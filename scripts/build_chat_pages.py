#!/usr/bin/env python3
"""
组装"社群问答精华"章节:把 /tmp/chat_digests/*.chunkNN.md 按来源时间段拼成页面,
输出到 docs/website-seo/14-社群问答精华/。

用法: python3 scripts/build_chat_pages.py
"""
import re
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
OUT = REPO / "docs" / "website-seo" / "14-社群问答精华"
DIGESTS = Path("/tmp/chat_digests")

# 来源 stem -> (页面文件名, 标题, 排序)
PAGES = {
    "哥飞的朋友们截止到1019": ("2025-07至10月", "2025.7 - 2025.10", 1),
    "哥飞的朋友们（10.19-11.2）": ("2025-10下旬", "2025.10.19 - 11.2", 2),
    "哥飞的朋友们11.02-11.10)": ("2025-11上旬", "2025.11.2 - 11.10", 3),
    "哥飞的朋友们聊天记录(11.10-11.19)": ("2025-11中旬", "2025.11.10 - 11.19", 4),
    "哥飞的朋友们(25.8.28-25.12.1)": ("2025-08至12月", "2025.8.28 - 12.1", 5),
    "哥飞的朋友们(25.12.1-25.12.9)": ("2025-12上旬", "2025.12.1 - 12.9", 6),
    "哥飞的朋友们(25.12.9-25.12.17)": ("2025-12中旬", "2025.12.9 - 12.17", 7),
    "2026.02-04.2聊天记录": ("2026-02至04月", "2026.2 - 2026.4", 8),
    "哥飞的朋友们⑩": ("2025-09下旬", "2025.9.28 - 10.6", 9),
    "gefei-vip-chat 2025.06": ("2025-06-VIP群", "2025.6 VIP群", 10),
}

NOISE = re.compile(r"^\(?（?本段无有价值内容\)?）?\.?$", re.M)


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / "_category_.json").write_text(
        '{\n  "label": "社群问答精华",\n  "position": 15,\n  "collapsed": true\n}\n',
        encoding="utf-8")

    groups = {}
    for f in sorted(DIGESTS.glob("*.md")):
        stem = re.sub(r"\.chunk\d+$", "", f.stem)
        stem = re.sub(r"\.chat$", "", stem)
        groups.setdefault(stem, []).append(f)

    for stem, files in groups.items():
        if stem not in PAGES:
            print(f"! 未配置页面: {stem}")
            continue
        fname, label, pos = PAGES[stem]
        parts = []
        for f in sorted(files):
            text = f.read_text(encoding="utf-8", errors="replace").strip()
            text = NOISE.sub("", text).strip()
            if len(text) < 30:
                continue
            # 统一为三级标题
            text = re.sub(r"^#{1,2} ", "### ", text, flags=re.M)
            parts.append(text)
        if not parts:
            continue
        body = "\n\n".join(parts)
        (OUT / f"{fname}.md").write_text(
            f"---\nsidebar_position: {pos}\ntitle: {label}\n---\n\n"
            f"# 社群问答精华 · {label}\n\n"
            f":::info 说明\n从该时间段的群聊记录中自动提取的有价值问答与经验,已过滤寒暄灌水。原始聊天稿在素材文件夹 `聊天记录（2024.5-2026.4）/` 下的 `.chat.txt` 文件中。\n:::\n\n"
            f"{body}\n",
            encoding="utf-8")
        print(f"{fname}: {len(parts)} 块, {sum(len(p) for p in parts)} chars")


if __name__ == "__main__":
    main()
