#!/usr/bin/env python3
"""
批量把视频/音频转成文字稿(使用小米 MiMo ASR API)。

用法:
    export MIMO_API_KEY=tp-xxx
    export MIMO_BASE_URL=https://token-plan-sgp.xiaomimimo.com/v1   # 可选
    python3 scripts/transcribe_media.py <目录或文件>...

行为:
  - 递归扫描目录下的 mp4/ts/mov/mkv/mp3/wav/m4a 文件
  - 用 ffmpeg 抽出音频并按 300s 切片(mp3 mono 16k 32kbps, base64 后远小于 10MB 限制)
  - 逐片调用 mimo-v2.5-asr 转写,结果缓存在素材根目录 _asr_cache/ 下,可断点续跑
  - 最终文稿写到源文件同目录: <文件名>.transcript.md
"""
import base64
import hashlib
import json
import os
import re
import subprocess
import sys
import tempfile
import time
import urllib.error
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

API_KEY = os.environ.get("MIMO_API_KEY", "")
BASE_URL = os.environ.get("MIMO_BASE_URL", "https://token-plan-sgp.xiaomimimo.com/v1")
MODEL = "mimo-v2.5-asr"
SEGMENT_SECONDS = 300
CONCURRENCY = int(os.environ.get("ASR_CONCURRENCY", "4"))
MEDIA_EXTS = {".mp4", ".ts", ".mov", ".mkv", ".avi", ".webm", ".mp3", ".wav", ".m4a", ".aac", ".flac"}

def log(msg):
    print(f"[{time.strftime('%H:%M:%S')}] {msg}", flush=True)

def ffprobe_duration(path: Path) -> float:
    out = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration",
         "-of", "default=noprint_wrappers=1:nokey=1", str(path)],
        capture_output=True, text=True)
    try:
        return float(out.stdout.strip())
    except ValueError:
        return 0.0

def extract_chunks(path: Path, tmpdir: Path) -> list:
    """抽音频并切片,返回按序的 mp3 路径列表。"""
    pattern = str(tmpdir / "chunk_%05d.mp3")
    cmd = ["ffmpeg", "-y", "-v", "error", "-i", str(path), "-vn",
           "-ac", "1", "-ar", "16000", "-c:a", "libmp3lame", "-b:a", "32k",
           "-f", "segment", "-segment_time", str(SEGMENT_SECONDS), pattern]
    subprocess.run(cmd, check=True, capture_output=True)
    return sorted(tmpdir.glob("chunk_*.mp3"))

def asr_request(mp3_path: Path) -> str:
    audio_b64 = base64.b64encode(mp3_path.read_bytes()).decode()
    body = {
        "model": MODEL,
        "messages": [{
            "role": "user",
            "content": [{
                "type": "input_audio",
                "input_audio": {"data": f"data:audio/mp3;base64,{audio_b64}"},
            }],
        }],
        "asr_options": {"language": "zh"},
        "stream": False,
    }
    req = urllib.request.Request(
        f"{BASE_URL}/chat/completions",
        data=json.dumps(body).encode(),
        headers={
            "Content-Type": "application/json",
            "api-key": API_KEY,
            "Authorization": f"Bearer {API_KEY}",
        },
        method="POST")
    last_err = None
    for attempt in range(6):
        try:
            with urllib.request.urlopen(req, timeout=600) as resp:
                data = json.loads(resp.read().decode())
            return (data["choices"][0]["message"].get("content") or "").strip()
        except urllib.error.HTTPError as e:
            detail = e.read().decode(errors="replace")[:300]
            last_err = f"HTTP {e.code}: {detail}"
            if e.code in (429, 500, 502, 503, 504):
                time.sleep(min(2 ** attempt * 3, 60))
                continue
            raise RuntimeError(last_err)
        except Exception as e:  # 超时/网络错误
            last_err = str(e)
            time.sleep(min(2 ** attempt * 3, 60))
    raise RuntimeError(f"重试耗尽: {last_err}")

def fmt_ts(seconds: int) -> str:
    h, rem = divmod(seconds, 3600)
    m, s = divmod(rem, 60)
    return f"{h:02d}:{m:02d}:{s:02d}"

def transcribe_file(path: Path, cache_root: Path) -> bool:
    out_path = path.with_name(path.name + ".transcript.md")
    if out_path.exists() and out_path.stat().st_size > 0:
        log(f"跳过(已存在): {path.name}")
        return True
    file_key = hashlib.md5(str(path).encode()).hexdigest()[:16]
    cache_dir = cache_root / file_key
    cache_dir.mkdir(parents=True, exist_ok=True)

    duration = ffprobe_duration(path)
    log(f"开始: {path.name} ({duration/60:.1f} 分钟)")
    with tempfile.TemporaryDirectory() as td:
        chunks = extract_chunks(path, Path(td))
        if not chunks:
            log(f"! 无音频流: {path}")
            return False
        results = {}
        pending = []
        for i, c in enumerate(chunks):
            cached = cache_dir / f"{i:05d}.txt"
            if cached.exists():
                results[i] = cached.read_text()
            else:
                pending.append((i, c))
        errors = []
        with ThreadPoolExecutor(max_workers=CONCURRENCY) as pool:
            futs = {pool.submit(asr_request, c): (i, c) for i, c in pending}
            for fut in as_completed(futs):
                i, c = futs[fut]
                try:
                    text = fut.result()
                    results[i] = text
                    (cache_dir / f"{i:05d}.txt").write_text(text)
                    log(f"  片段 {i+1}/{len(chunks)} 完成 ({path.name[:30]})")
                except Exception as e:
                    errors.append((i, str(e)))
                    log(f"  ! 片段 {i+1} 失败: {e}")
        if errors:
            log(f"! {path.name} 有 {len(errors)} 个片段失败,本次不落稿(重跑可续)")
            return False

    lines = [f"# {path.stem} — 语音转写稿", "",
             f"> 来源文件:{path.name}(时长 {duration/60:.1f} 分钟,自动转写,可能存在错别字)", ""]
    for i in range(len(results)):
        text = results[i].strip()
        if not text:
            continue
        lines.append(f"**[{fmt_ts(i * SEGMENT_SECONDS)}]** {text}")
        lines.append("")
    out_path.write_text("\n".join(lines), encoding="utf-8")
    log(f"完成: {out_path.name}")
    return True

def collect_media(targets) -> list:
    files = []
    for t in targets:
        p = Path(t)
        if p.is_file() and p.suffix.lower() in MEDIA_EXTS:
            files.append(p)
        elif p.is_dir():
            for f in sorted(p.rglob("*")):
                if (f.is_file() and f.suffix.lower() in MEDIA_EXTS
                        and "_asr_cache" not in f.parts):
                    files.append(f)
    return files

def main():
    if not API_KEY:
        sys.exit("请先设置 MIMO_API_KEY 环境变量")
    targets = sys.argv[1:]
    if not targets:
        sys.exit("用法: transcribe_media.py <目录或文件>...")
    files = collect_media(targets)
    # 小文件优先,尽快产出
    files.sort(key=lambda f: f.stat().st_size)
    log(f"共 {len(files)} 个媒体文件待处理")
    cache_root = Path(targets[0])
    cache_root = (cache_root if cache_root.is_dir() else cache_root.parent) / "_asr_cache"
    ok = fail = 0
    for f in files:
        try:
            if transcribe_file(f, cache_root):
                ok += 1
            else:
                fail += 1
        except Exception as e:
            fail += 1
            log(f"! 处理失败 {f}: {e}")
    log(f"全部结束: 成功 {ok},失败 {fail}")

if __name__ == "__main__":
    main()
