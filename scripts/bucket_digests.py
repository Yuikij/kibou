#!/usr/bin/env python3
"""
把 digest 摘要按知识库章节分桶(复制到 /tmp/buckets/<章节>/)。

用法: python3 scripts/bucket_digests.py <digest目录>...
同名 html/pdf digest 去重(优先 html);已在桶里的文件跳过。
"""
import re
import shutil
import sys
from pathlib import Path

BUCKETS = Path("/tmp/buckets")

RULES = [
    ("01-新手入门", ["新手入门"], ["入门", "路线图", "第一站", "从零开始", "新手"]),
    ("02-关键词与需求挖掘", ["关键词与需求挖掘"], ["关键词", "需求", "找词", "新词", "选品", "挖掘", "趋势", "KGR"]),
    ("03-建站与OnPage", ["建站与OnPage"], ["OnPage", "on-page", "结构", "域名", "URL", "多语言", "title", "元标", "部署", "模板", "favicon", "CMS"]),
    ("04-内容策略", ["内容策略"], ["内容", "AI味", "伪原创", "程序化", "长尾词覆盖", "文章"]),
    ("05-外链建设", ["外链建设"], ["外链", "反链", "内链", "backlink", "导航站提交", "目录提交"]),
    ("06-收录与技术SEO", ["收录与技术"], ["收录", "GSC", "Search Console", "Bing", "爬", "排名到底", "谷歌排名", "算法", "结构化"]),
    ("07-变现", ["Adsense变现", "支付与出海配套"], ["Adsense", "支付", "Stripe", "Creem", "Paypal", "提现", "开户", "LLC", "报税", "收入", "变现", "订阅"]),
    ("08-广告投放", ["广告投放"], ["广告", "Ads", "投放", "投流", "冷启动", "MCC"]),
    ("09-游戏站", ["游戏站"], ["游戏"]),
    ("10-案例拆解", ["案例拆解"], ["案例", "拆解", "分析"]),
    ("11-经验复盘", ["经验复盘"], ["复盘", "经验分享", "月入", "赚到", "出海之路", "成长"]),
    ("12-工具与资源", ["工具资源"], ["工具", "插件", "Bookmarklet", "资源", "合集", "清单"]),
]


def main():
    for name, _, _ in RULES:
        (BUCKETS / name).mkdir(parents=True, exist_ok=True)

    existing = {f.name for b in BUCKETS.iterdir() if b.is_dir() for f in b.glob("*.md")}

    files = []
    for d in sys.argv[1:]:
        files.extend(sorted(Path(d).glob("*.digest.md")))

    seen = {}
    for f in files:
        stem = re.sub(r"\.(html|pdf|ocr)\.digest\.md$", "", f.name)
        stem = re.sub(r"\.digest\.md$", "", stem)
        if stem not in seen or f.name.endswith(".html.digest.md"):
            seen[stem] = f

    counts = {}
    for stem, f in seen.items():
        if f.name in existing:
            continue
        text = f.read_text(encoding="utf-8", errors="replace")
        m = re.search(r"\*\*分类\*\*: *(\S+)", text)
        tag = m.group(1).strip() if m else ""
        target = None
        for name, tags, _ in RULES:
            if any(t in tag for t in tags):
                target = name
                break
        if not target:
            for name, _, kws in RULES:
                if any(kw.lower() in f.name.lower() for kw in kws):
                    target = name
                    break
        if not target:
            target = "11-经验复盘"
        shutil.copy(f, BUCKETS / target / f.name)
        counts[target] = counts.get(target, 0) + 1

    for k in sorted(counts):
        print(f"{k}: +{counts[k]}")
    print("total new:", sum(counts.values()))


if __name__ == "__main__":
    main()
