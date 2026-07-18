#!/usr/bin/env python3
"""
生成 docs/website-seo/13-线下分享与直播/:按活动分组,把每场视频分享的
digest 摘要拼成一页,便于浏览线下分享与直播的核心内容。

用法: python3 scripts/build_share_pages.py
依赖: 素材目录下的 *.transcript.md(定位活动分组) + /tmp/gefei_digests_video/(摘要)
"""
import re
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
OUT = REPO / "docs" / "website-seo" / "13-线下分享与直播"
SRC = Path("/Users/kubo/素材/哥飞课程")
DIGESTS = Path("/tmp/gefei_digests_video")

# 目录名 -> (页面文件名, 页面标题, 排序)
GROUPS = {
    "20251213深圳交流会": ("2025深圳交流会", "2025.12 深圳交流会", 1),
    "上海分享": ("2025上海分享", "2025 上海分享会", 2),
    "深圳分享": ("2025深圳分享", "2025.6 深圳分享会", 3),
    "杭州分享": ("2025杭州分享", "2025 杭州分享会", 4),
    "成都交流分享": ("2025成都分享", "2025 成都交流分享", 5),
    "20240630-深圳线下聚会": ("2024深圳聚会", "2024.6 深圳线下聚会", 6),
    "20240615-上海线下聚会": ("2024上海聚会", "2024.6 上海线下聚会", 7),
    "20240602-北京线下聚会": ("2024北京聚会", "2024.6 北京线下聚会", 8),
    "直播回放": ("直播回放", "视频号直播回放", 9),
}
ROOT_GROUP = ("大会与专题", "年度大会与专题分享", 10)

SKIP_DIRS = {"谷歌SEO从入门到精通 带你打造排名 清晰的独立站+Google SEO工作流"}


def digest_for(transcript: Path):
    base = transcript.name[: -len(".transcript.md")]
    f = DIGESTS / (base + ".digest.md")
    if not f.exists():
        return None
    text = f.read_text(encoding="utf-8", errors="replace")
    return re.sub(r"<!-- 来源: .+? -->\n*", "", text).strip()


def title_of(transcript: Path) -> str:
    name = transcript.name[: -len(".transcript.md")]
    name = re.sub(r" - Web\.Cafe.*$", "", name)
    name = re.sub(r"\.(ts|mp4)$", "", name)
    return name.strip()


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / "_category_.json").write_text(
        '{\n  "label": "线下分享与直播",\n  "position": 14,\n  "collapsed": true\n}\n',
        encoding="utf-8")

    groups = {}
    for t in sorted(SRC.rglob("*.transcript.md")):
        parent = t.parent.name
        if parent in SKIP_DIRS:
            continue
        key = None
        for dirname in GROUPS:
            if dirname in t.parts:
                key = dirname
                break
        if key is None:
            if t.parent == SRC:
                key = "__root__"
            else:
                continue
        groups.setdefault(key, []).append(t)

    for key, transcripts in groups.items():
        fname, page_title, pos = GROUPS.get(key, ROOT_GROUP) if key != "__root__" else ROOT_GROUP
        lines = [
            "---",
            f"sidebar_position: {pos}",
            f"title: {page_title}",
            "---",
            "",
            f"# {page_title}",
            "",
            "> 以下内容由各场分享的语音转写稿自动摘要而成。完整逐字稿在素材文件夹对应视频旁的 `.transcript.md` 文件中。",
            "",
        ]
        seen_titles = set()
        for t in sorted(transcripts, key=lambda p: p.name):
            title = title_of(t)
            if title in seen_titles:
                continue
            seen_titles.add(title)
            digest = digest_for(t)
            if not digest:
                continue
            digest = re.sub(r"^# .+$", "", digest, count=1, flags=re.M).strip()
            digest = re.sub(r"^## ", "### ", digest, flags=re.M)
            lines.append(f"## {title}")
            lines.append("")
            lines.append(digest)
            lines.append("")
        (OUT / f"{fname}.md").write_text("\n".join(lines), encoding="utf-8")
        print(f"{fname}: {len(seen_titles)} 场分享")


if __name__ == "__main__":
    main()
