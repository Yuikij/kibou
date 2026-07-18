#!/usr/bin/env python3
"""
把多篇 digest 摘要聚合成一篇知识库章节长文(用 mimo-v2.5-pro)。

用法:
    export MIMO_API_KEY=tp-xxx
    python3 scripts/synthesize_chapter.py --title "关键词与需求挖掘" \
        --out /tmp/chapter.md <digest文件或目录>...

digest 输入可以是目录(取全部 *.md)或单个文件。超长时自动分批+合并。
"""
import json
import os
import re
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

API_KEY = os.environ.get("MIMO_API_KEY", "")
BASE_URL = os.environ.get("MIMO_BASE_URL", "https://token-plan-sgp.xiaomimimo.com/v1")
MODEL = os.environ.get("SYNTH_MODEL", "mimo-v2.5-pro")
BATCH_CHARS = 90000

SYSTEM = "你是资深SEO出海站长,也是知识库编辑,擅长把碎片化社群分享整理成体系化教程。"

PROMPT_TMPL = """下面是若干篇来自"哥飞的朋友们"出海建站社群的分享摘要,主题都与「{title}」相关。

请把它们综合成一篇体系化的知识库章节(markdown),要求:
1. 用中文,面向想通过做英文网站获取谷歌流量并变现的开发者。
2. 结构清晰:开头两三句话概述本章内容;然后按逻辑组织为若干二级标题(##)小节;方法论在前,实操技巧在后。
3. 尽量保留具体可操作的细节:数字标准、工具名、网址、步骤、判断公式、案例数据。不要泛泛而谈。
4. 观点冲突时并列呈现并注明适用场景。
5. 不编造摘要中没有的内容。综合、去重、归纳即可。
6. 篇幅 3000~6000 字。不要输出一级标题(#),从正文/二级标题开始。
7. 文末加一节"## 速查清单",用 checklist 形式总结本章行动要点。

---以下是摘要合集---
{body}"""

MERGE_TMPL = """以下是同一主题「{title}」的多份章节草稿(因素材过多分批生成)。
请把它们合并成一篇结构统一、无重复的最终章节,保留全部具体细节(数字、工具、步骤),
格式要求同前:markdown、无一级标题、以##小节组织、文末保留一节"## 速查清单"。

{body}"""


def log(msg):
    print(f"[{time.strftime('%H:%M:%S')}] {msg}", flush=True)


def chat(prompt: str, max_tokens: int = 16384) -> str:
    body = {
        "model": MODEL,
        "messages": [
            {"role": "system", "content": SYSTEM},
            {"role": "user", "content": prompt},
        ],
        "max_completion_tokens": max_tokens,
        "temperature": 0.3,
        "stream": False,
    }
    req = urllib.request.Request(
        f"{BASE_URL}/chat/completions",
        data=json.dumps(body).encode(),
        headers={"Content-Type": "application/json", "api-key": API_KEY},
        method="POST")
    last = None
    for attempt in range(7):
        try:
            with urllib.request.urlopen(req, timeout=900) as resp:
                d = json.loads(resp.read().decode())
            content = d["choices"][0]["message"].get("content") or ""
            content = re.sub(r"<think>.*?</think>", "", content, flags=re.S).strip()
            if content:
                return content
            last = "empty"
        except urllib.error.HTTPError as e:
            last = f"HTTP {e.code}: {e.read().decode(errors='replace')[:200]}"
            if e.code not in (429, 500, 502, 503, 504):
                raise RuntimeError(last)
        except Exception as e:
            last = str(e)
        time.sleep(min(2 ** attempt * 5, 120))
    raise RuntimeError(f"重试耗尽: {last}")


def main():
    args = sys.argv[1:]
    title, out = None, None
    inputs = []
    i = 0
    while i < len(args):
        if args[i] == "--title":
            title = args[i + 1]; i += 2
        elif args[i] == "--out":
            out = Path(args[i + 1]); i += 2
        else:
            inputs.append(Path(args[i])); i += 1
    if not (API_KEY and title and out and inputs):
        sys.exit("用法: synthesize_chapter.py --title T --out F <digest...>")

    docs = []
    for p in inputs:
        if p.is_dir():
            docs.extend(sorted(p.glob("*.md")))
        elif p.is_file():
            docs.append(p)
    texts = [d.read_text(encoding="utf-8", errors="replace") for d in docs]
    log(f"{title}: {len(texts)} 篇输入")

    batches = []
    cur, size = [], 0
    for t in texts:
        if size + len(t) > BATCH_CHARS and cur:
            batches.append(cur); cur, size = [], 0
        cur.append(t); size += len(t)
    if cur:
        batches.append(cur)

    drafts = []
    for bi, batch in enumerate(batches):
        log(f"  生成批次 {bi+1}/{len(batches)} ({sum(len(t) for t in batch)} chars)")
        drafts.append(chat(PROMPT_TMPL.format(title=title, body="\n\n---\n\n".join(batch))))
    final = drafts[0] if len(drafts) == 1 else chat(
        MERGE_TMPL.format(title=title, body="\n\n=====草稿分隔=====\n\n".join(drafts)))
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(final, encoding="utf-8")
    log(f"完成: {out} ({len(final)} chars)")


if __name__ == "__main__":
    main()
