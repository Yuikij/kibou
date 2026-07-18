#!/usr/bin/env python3
"""
用 mimo-v2.5 视觉能力,把图片型 PDF(FireShot 长截图)和长截图 PNG OCR 成文本。

用法:
    export MIMO_API_KEY=tp-xxx
    python3 scripts/ocr_images.py <素材根目录> <输出目录>

- 图片型 PDF: 用 pdfimages 按序抽出条带图,逐条 OCR 后拼接
- 长 PNG/JPG: 高度>2600px 时纵向切成 2400px 条带(带 100px 重叠)
- 结果写 <输出目录>/<相对路径打平>.txt,已存在则跳过(可断点续跑)
"""
import base64
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
MODEL = "mimo-v2.5"
CONCURRENCY = int(os.environ.get("OCR_CONCURRENCY", "3"))
PROMPT = ("请把图片中的正文文字完整转录出来,保持原有段落和列表结构,"
          "忽略网页导航栏/侧边栏/页脚等无关元素,不要添加任何解释或评论。"
          "如果图片里没有可读文字,只回复:(无文字)")

def log(msg):
    print(f"[{time.strftime('%H:%M:%S')}] {msg}", flush=True)

def ocr_one_image(img_path: Path) -> str:
    data = img_path.read_bytes()
    if len(data) > 7 * 1024 * 1024:
        subprocess.run(["sips", "--resampleWidth", "1200", str(img_path)],
                       capture_output=True)
        data = img_path.read_bytes()
    mime = "image/png" if img_path.suffix.lower() == ".png" else "image/jpeg"
    img_b64 = base64.b64encode(data).decode()
    body = {
        "model": MODEL,
        "messages": [{"role": "user", "content": [
            {"type": "image_url", "image_url": {"url": f"data:{mime};base64,{img_b64}"}},
            {"type": "text", "text": PROMPT},
        ]}],
        "max_completion_tokens": 8192,
        "temperature": 0.1,
        "stream": False,
    }
    req = urllib.request.Request(
        f"{BASE_URL}/chat/completions",
        data=json.dumps(body).encode(),
        headers={"Content-Type": "application/json", "api-key": API_KEY},
        method="POST")
    last = None
    for attempt in range(6):
        try:
            with urllib.request.urlopen(req, timeout=600) as resp:
                d = json.loads(resp.read().decode())
            return (d["choices"][0]["message"].get("content") or "").strip()
        except urllib.error.HTTPError as e:
            last = f"HTTP {e.code}: {e.read().decode(errors='replace')[:200]}"
            if e.code in (429, 500, 502, 503, 504):
                time.sleep(min(2 ** attempt * 5, 90))
                continue
            raise RuntimeError(last)
        except Exception as e:
            last = str(e)
            time.sleep(min(2 ** attempt * 5, 90))
    raise RuntimeError(f"重试耗尽: {last}")

def pdf_strip_images(pdf: Path, tmpdir: Path) -> list:
    subprocess.run(["pdfimages", "-j", "-png", str(pdf), str(tmpdir / "img")],
                   check=True, capture_output=True)
    return sorted(tmpdir.glob("img-*"))

def slice_tall_image(img: Path, tmpdir: Path) -> list:
    out = subprocess.run(
        ["sips", "-g", "pixelWidth", "-g", "pixelHeight", str(img)],
        capture_output=True, text=True).stdout
    w = int(re.search(r"pixelWidth: (\d+)", out).group(1))
    h = int(re.search(r"pixelHeight: (\d+)", out).group(1))
    if h <= 2600:
        return [img]
    step, overlap = 2400, 100
    parts = []
    y = 0
    i = 0
    while y < h:
        ch = min(step + overlap, h - y)
        dst = tmpdir / f"slice_{i:03d}.png"
        subprocess.run(
            ["sips", "-c", str(ch), str(w), "--cropOffset", str(y), "0",
             str(img), "--out", str(dst)], capture_output=True, check=True)
        parts.append(dst)
        y += step
        i += 1
        if ch < step:
            break
    return parts

def flat_name(root: Path, path: Path) -> str:
    rel = path.relative_to(root)
    name = "__".join(rel.parts)
    return re.sub(r'[\\/:*?"<>|]', "_", name)[:180] + ".ocr.txt"

def is_image_pdf(pdf: Path) -> bool:
    r = subprocess.run(["pdftotext", str(pdf), "-"], capture_output=True, text=True)
    return len(r.stdout.strip()) <= 200

def process(path: Path, root: Path, out_dir: Path):
    out_path = out_dir / flat_name(root, path)
    if out_path.exists() and out_path.stat().st_size > 0:
        return "skip"
    with tempfile.TemporaryDirectory() as td:
        tmpdir = Path(td)
        if path.suffix.lower() == ".pdf":
            imgs = pdf_strip_images(path, tmpdir)
        else:
            imgs = slice_tall_image(path, tmpdir)
        if not imgs:
            return "empty"
        texts = []
        with ThreadPoolExecutor(max_workers=CONCURRENCY) as pool:
            futs = {pool.submit(ocr_one_image, im): i for i, im in enumerate(imgs)}
            res = {}
            for fut in as_completed(futs):
                res[futs[fut]] = fut.result()
        for i in range(len(imgs)):
            t = res.get(i, "").strip()
            if t and t != "(无文字)":
                texts.append(t)
    body = "\n\n".join(texts).strip()
    if len(body) < 30:
        return "empty"
    out_path.write_text(f"【来源】{path}\n\n{body}", encoding="utf-8")
    return "ok"

def main():
    if not API_KEY:
        sys.exit("请先设置 MIMO_API_KEY")
    root = Path(sys.argv[1])
    out_dir = Path(sys.argv[2])
    out_dir.mkdir(parents=True, exist_ok=True)
    targets = []
    for p in sorted(root.rglob("*")):
        if not p.is_file() or "_asr_cache" in p.parts or "封面" in p.parts:
            continue
        suf = p.suffix.lower()
        if suf == ".pdf" and is_image_pdf(p):
            targets.append(p)
        elif suf in (".png", ".jpg", ".jpeg"):
            targets.append(p)
    log(f"待 OCR 文件: {len(targets)}")
    stats = {"ok": 0, "skip": 0, "empty": 0, "fail": 0}
    for p in targets:
        try:
            r = process(p, root, out_dir)
            stats[r] += 1
            if r == "ok":
                log(f"OCR 完成: {p.name}")
        except Exception as e:
            stats["fail"] += 1
            log(f"! OCR 失败 {p.name}: {e}")
    log(f"结束: {stats}")

if __name__ == "__main__":
    main()
