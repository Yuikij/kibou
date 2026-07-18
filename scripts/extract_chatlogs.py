#!/usr/bin/env python3
"""
把聊天记录压缩包(zip/rar)提取为纯文本聊天稿,落在聊天记录目录下。

数据源两种格式:
  1. HTML 内嵌 `window.WEFLOW_DATA = [...]`(WeFlow 导出)
  2. 伴随的 *.html.json(消息数组)

输出: <聊天记录目录>/<压缩包名>.chat.txt,格式为 [时间] 昵称: 文本
用法: python3 scripts/extract_chatlogs.py "/Users/kubo/素材/哥飞课程/聊天记录（2024.5-2026.4）"
"""
import html as html_mod
import json
import re
import subprocess
import sys
import tempfile
from datetime import datetime
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from unzip_gbk import fix_name  # noqa: E402
import zipfile  # noqa: E402


def strip_tags(s: str) -> str:
    s = re.sub(r"<img [^>]*alt=\"([^\"]*)\"[^>]*/?>", r"[\1]", s)
    s = re.sub(r"<[^>]+>", " ", s)
    s = html_mod.unescape(s)
    return re.sub(r"\s+", " ", s).strip()


def messages_from_weflow(raw: str):
    m = re.search(r"window\.WEFLOW_DATA\s*=\s*", raw)
    if not m:
        return None
    dec = json.JSONDecoder()
    try:
        data, _ = dec.raw_decode(raw[m.end():])
    except json.JSONDecodeError:
        return None
    out = []
    for msg in data:
        text = strip_tags(str(msg.get("b", "")))
        sender = strip_tags(str(msg.get("n", "") or msg.get("a", "")))
        ts = msg.get("t")
        when = datetime.fromtimestamp(ts).strftime("%Y-%m-%d %H:%M") if ts else ""
        if text:
            out.append((when, sender, text))
    return out


def messages_from_json(data):
    """兼容 .html.json:尝试常见字段名。"""
    if isinstance(data, dict):
        for key in ("messages", "data", "list", "msgs"):
            if isinstance(data.get(key), list):
                data = data[key]
                break
        else:
            return None
    if not isinstance(data, list):
        return None
    out = []
    for msg in data:
        if not isinstance(msg, dict):
            continue
        text = msg.get("content") or msg.get("text") or msg.get("msg") or msg.get("b") or ""
        text = strip_tags(str(text))
        sender = str(msg.get("sender") or msg.get("name") or msg.get("nickname")
                     or msg.get("n") or "")
        ts = msg.get("timestamp") or msg.get("time") or msg.get("t")
        when = ""
        if isinstance(ts, (int, float)) and ts > 1e9:
            when = datetime.fromtimestamp(ts if ts < 1e12 else ts / 1000).strftime("%Y-%m-%d %H:%M")
        elif isinstance(ts, str):
            when = ts[:16]
        if text:
            out.append((when, sender, text))
    return out


def extract_archive(archive: Path, tmpdir: Path) -> Path:
    dest = tmpdir / archive.stem
    dest.mkdir(parents=True, exist_ok=True)
    if archive.suffix.lower() == ".rar":
        subprocess.run(["unar", "-quiet", "-force-overwrite", "-output-directory",
                        str(dest), str(archive)], check=True, capture_output=True)
    else:
        with zipfile.ZipFile(archive) as zf:
            for info in zf.infolist():
                name = info.filename if info.flag_bits & 0x800 else fix_name(info.filename)
                low = name.lower()
                # 只解压文本载体,跳过图片/视频/语音,省磁盘
                if info.is_dir() or not (low.endswith(".html") or low.endswith(".json")):
                    continue
                target = dest / name
                target.parent.mkdir(parents=True, exist_ok=True)
                with zf.open(info) as srcf, open(target, "wb") as dstf:
                    dstf.write(srcf.read())
    return dest


def collect_messages(folder: Path):
    msgs = []
    for f in sorted(folder.rglob("*")):
        if not f.is_file():
            continue
        if f.suffix.lower() == ".json":
            try:
                got = messages_from_json(json.loads(f.read_text(encoding="utf-8", errors="replace")))
            except Exception:
                got = None
            if got:
                msgs.extend(got)
        elif f.suffix.lower() == ".html":
            raw = f.read_text(encoding="utf-8", errors="replace")
            got = messages_from_weflow(raw)
            if got:
                msgs.extend(got)
    # 去重并按时间排序
    seen = set()
    uniq = []
    for m in msgs:
        key = (m[0], m[1], m[2][:80])
        if key in seen:
            continue
        seen.add(key)
        uniq.append(m)
    uniq.sort(key=lambda m: m[0])
    return uniq


def main():
    chat_dir = Path(sys.argv[1])
    with tempfile.TemporaryDirectory() as td:
        tmp = Path(td)
        for archive in sorted(chat_dir.glob("*")):
            if archive.suffix.lower() not in (".zip", ".rar"):
                continue
            out = chat_dir / (archive.stem + ".chat.txt")
            if out.exists() and out.stat().st_size > 0:
                print(f"跳过(已存在): {out.name}")
                continue
            try:
                folder = extract_archive(archive, tmp)
            except Exception as e:
                print(f"! 解压失败 {archive.name}: {e}")
                continue
            msgs = collect_messages(folder)
            if not msgs:
                print(f"! 未识别消息格式: {archive.name}")
                continue
            lines = [f"[{w}] {s}: {t}" for w, s, t in msgs]
            out.write_text("\n".join(lines), encoding="utf-8")
            print(f"{out.name}: {len(msgs)} 条消息, {out.stat().st_size >> 10}KB")


if __name__ == "__main__":
    main()
