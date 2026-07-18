#!/usr/bin/env python3
"""
把素材库中的 HTML(SingleFile 快照)和带文字层的 PDF 批量提取为纯文本。

输出统一放到 <输出目录>/,文件名为 <相对路径打平>.txt,便于后续 LLM 蒸馏。
用法: python3 scripts/extract_texts.py <素材根目录> <输出目录>
"""
import html
import html.parser
import re
import subprocess
import sys
from pathlib import Path


class TextExtractor(html.parser.HTMLParser):
    SKIP = {"script", "style", "noscript", "svg", "head", "iframe", "template"}
    BLOCK = {"p", "div", "br", "li", "tr", "h1", "h2", "h3", "h4", "h5", "h6",
             "section", "article", "blockquote", "pre"}

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.parts = []
        self.skip_depth = 0

    def handle_starttag(self, tag, attrs):
        if tag in self.SKIP:
            self.skip_depth += 1
        elif tag in self.BLOCK:
            self.parts.append("\n")

    def handle_endtag(self, tag):
        if tag in self.SKIP and self.skip_depth > 0:
            self.skip_depth -= 1
        elif tag in self.BLOCK:
            self.parts.append("\n")

    def handle_data(self, data):
        if not self.skip_depth:
            self.parts.append(data)


def html_to_text(path: Path) -> str:
    raw = path.read_text(encoding="utf-8", errors="replace")
    parser = TextExtractor()
    try:
        parser.feed(raw)
    except Exception:
        pass
    text = "".join(parser.parts)
    text = html.unescape(text)
    text = re.sub(r"[ \t\u00a0]+", " ", text)
    text = re.sub(r"\n\s*\n+", "\n\n", text)
    return text.strip()


def pdf_to_text(path: Path) -> str:
    out = subprocess.run(["pdftotext", str(path), "-"],
                         capture_output=True, text=True)
    return out.stdout.strip()


def flat_name(root: Path, path: Path) -> str:
    rel = path.relative_to(root)
    name = "__".join(rel.parts)
    name = re.sub(r'[\\/:*?"<>|]', "_", name)
    return name[:180] + ".txt"


def main():
    root = Path(sys.argv[1])
    out_dir = Path(sys.argv[2])
    out_dir.mkdir(parents=True, exist_ok=True)
    stats = {"html": 0, "pdf_ok": 0, "pdf_empty": 0, "skip": 0}
    for path in sorted(root.rglob("*")):
        if not path.is_file() or "_asr_cache" in path.parts:
            continue
        suffix = path.suffix.lower()
        if suffix == ".html":
            text = html_to_text(path)
            kind = "html"
        elif suffix == ".pdf":
            text = pdf_to_text(path)
            kind = "pdf_ok" if len(text) > 200 else "pdf_empty"
        else:
            continue
        if len(text) <= 200:
            stats["pdf_empty" if suffix == ".pdf" else "skip"] += 1
            continue
        stats[kind] += 1
        (out_dir / flat_name(root, path)).write_text(text, encoding="utf-8")
    print(stats)


if __name__ == "__main__":
    main()
