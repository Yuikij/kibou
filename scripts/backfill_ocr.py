#!/usr/bin/env python3
"""把 OCR 产物按【来源】行写回素材原文件夹,命名 <原文件名>.ocr.md。"""
import re
import sys
from pathlib import Path


def main():
    ocr_dir = Path(sys.argv[1] if len(sys.argv) > 1 else "/tmp/gefei_ocr")
    n = 0
    for f in sorted(ocr_dir.glob("*.ocr.txt")):
        text = f.read_text(encoding="utf-8", errors="replace")
        m = re.match(r"【来源】(.+)\n", text)
        if not m:
            continue
        src = Path(m.group(1).strip())
        if not src.exists():
            continue
        dst = src.with_name(src.name + ".ocr.md")
        if dst.exists() and dst.stat().st_size > 0:
            continue
        body = text[m.end():].strip()
        dst.write_text(
            f"# {src.stem} — OCR 文字稿\n\n> 来源:{src.name}(模型 OCR,可能存在识别误差)\n\n{body}\n",
            encoding="utf-8")
        n += 1
    print(f"回填 {n} 个 OCR 文字稿")


if __name__ == "__main__":
    main()
