#!/usr/bin/env python3
"""
组装知识库页面:章节正文(/tmp/chapters/*.md) + 该章资料索引(源摘要标题/一句话/来源)。

用法: python3 scripts/build_kb_pages.py
输出: docs/website-seo/<章节目录>/ 下的 <章名>.md 与 资料索引.md
"""
import re
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
KB = REPO / "docs" / "website-seo"
CHAPTERS = Path("/tmp/chapters")
BUCKETS = Path("/tmp/buckets")

# 客套开场白清理
OPENING_NOISE = re.compile(
    r"^(好的|以下|作为)[^\n]*(编辑|站长|章节|整理)[^\n]*\n+", re.M)


def clean_body(text: str) -> str:
    text = OPENING_NOISE.sub("", text.strip())
    # 万一模型输出了一级标题,降级为二级
    text = re.sub(r"^# ([^\n#])", r"## \1", text, flags=re.M)
    return text.strip()


def digest_meta(f: Path):
    text = f.read_text(encoding="utf-8", errors="replace")
    title = ""
    m = re.search(r"^# (.+)$", text, re.M)
    if m:
        title = m.group(1).strip()
    summary = ""
    m = re.search(r"\*\*一句话总结\*\*: *(.+)", text)
    if m:
        summary = m.group(1).strip()
    source = ""
    m = re.search(r"<!-- 来源: (.+?) -->", text)
    if m:
        source = m.group(1).replace(".txt", "")
        source = re.sub(r"\.(html|pdf)$", "", source)
        source = source.split("__")[-1]
        source = re.sub(r" ｜ Web\.Cafe.*$", "", source)
    return title, summary, source


def main():
    for ch_file in sorted(CHAPTERS.glob("*.md")):
        name = ch_file.stem  # e.g. 01-新手入门
        if not re.match(r"^\d{2}-", name):
            continue
        label = name.split("-", 1)[1]
        ch_dir = KB / name
        ch_dir.mkdir(parents=True, exist_ok=True)

        body = clean_body(ch_file.read_text(encoding="utf-8"))
        (ch_dir / f"{label}.md").write_text(
            f"---\nsidebar_position: 1\ntitle: {label}·方法与实操\n---\n\n"
            f"# {label}\n\n"
            f":::info 说明\n本文由社群历年分享资料自动聚合并整理而成,细节以[资料索引](./资料索引.md)中的原始来源为准。\n:::\n\n"
            f"{body}\n",
            encoding="utf-8")

        bucket = BUCKETS / name
        if bucket.is_dir():
            rows = []
            for f in sorted(bucket.glob("*.md")):
                title, summary, source = digest_meta(f)
                if not title:
                    continue
                rows.append((title, summary, source))
            lines = [
                "---", "sidebar_position: 99", "title: 资料索引", "---", "",
                f"# {label}·资料索引", "",
                "本章内容基于以下原始分享整理。标题为摘要归纳,括注为原始文件名。", ""]
            for title, summary, source in rows:
                lines.append(f"### {title}")
                if source:
                    lines.append(f"*来源:{source}*")
                lines.append("")
                if summary:
                    lines.append(summary)
                lines.append("")
            (ch_dir / "资料索引.md").write_text("\n".join(lines), encoding="utf-8")
        print(f"built {name}: 正文 {len(body)} chars, 索引 {len(rows) if bucket.is_dir() else 0} 条")


if __name__ == "__main__":
    main()
