#!/usr/bin/env python3
"""解压 zip 并修复 GBK 文件名乱码。用法: unzip_gbk.py <zip> <目标目录>"""
import sys
import zipfile
from pathlib import Path


def fix_name(name: str) -> str:
    try:
        return name.encode("cp437").decode("gbk")
    except (UnicodeEncodeError, UnicodeDecodeError):
        return name


def main():
    zip_path, dest = Path(sys.argv[1]), Path(sys.argv[2])
    dest.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(zip_path) as zf:
        for info in zf.infolist():
            # flag bit 11 表示文件名已是 UTF-8
            name = info.filename if info.flag_bits & 0x800 else fix_name(info.filename)
            target = dest / name
            if info.is_dir():
                target.mkdir(parents=True, exist_ok=True)
                continue
            target.parent.mkdir(parents=True, exist_ok=True)
            if target.exists() and target.stat().st_size == info.file_size:
                continue
            with zf.open(info) as src, open(target, "wb") as dst:
                while True:
                    buf = src.read(1 << 20)
                    if not buf:
                        break
                    dst.write(buf)
            print(f"  {name}")


if __name__ == "__main__":
    main()
