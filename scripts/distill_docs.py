#!/usr/bin/env python3
"""
用 mimo-v2.5 把提取好的素材文本逐篇蒸馏成结构化摘要(markdown),供知识库编写使用。

用法:
    export MIMO_API_KEY=tp-xxx
    python3 scripts/distill_docs.py <文本目录>... --out <输出目录>

每篇输出 <输出目录>/<同名>.digest.md,已存在则跳过,可断点续跑。
"""
import json
import os
import re
import sys
import time
import urllib.error
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

API_KEY = os.environ.get("MIMO_API_KEY", "")
BASE_URL = os.environ.get("MIMO_BASE_URL", "https://token-plan-sgp.xiaomimimo.com/v1")
MODEL = os.environ.get("DISTILL_MODEL", "mimo-v2.5")
CONCURRENCY = int(os.environ.get("DISTILL_CONCURRENCY", "4"))
MAX_CHARS = 60000  # 单篇超长时截断(网页快照有大量噪声)

PROMPT = """你是一个SEO出海建站知识库的整理助手。下面是一篇来自"哥飞的朋友们"社群的教程/分享/案例的原始文本(可能来自网页快照,含少量导航噪声,请忽略无关内容)。

请输出结构化摘要,格式严格如下(markdown):

# 标题(概括本文主题,不超过30字)

**分类**: 从以下选一个最贴切的: 新手入门/关键词与需求挖掘/建站与OnPage/内容策略/外链建设/收录与技术/Adsense变现/支付与出海配套/广告投放/游戏站/案例拆解/经验复盘/工具资源
**一句话总结**: ...

## 核心要点
- 要点(尽量保留具体数字、工具名、网址、操作步骤;5~15条)

## 可执行动作
- 读者可以直接照做的具体操作(如有;没有则写"无")

## 提到的工具/网站
- 名称: 用途 (没有则写"无")

要求:只依据原文,不要编造;保留原文中的关键数据和判断标准;中文输出。"""


def log(msg):
    print(f"[{time.strftime('%H:%M:%S')}] {msg}", flush=True)


def chat(text: str) -> str:
    body = {
        "model": MODEL,
        "messages": [
            {"role": "user", "content": PROMPT + "\n\n---原文开始---\n" + text[:MAX_CHARS]},
        ],
        "max_completion_tokens": 4096,
        "temperature": 0.2,
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
            with urllib.request.urlopen(req, timeout=600) as resp:
                d = json.loads(resp.read().decode())
            content = d["choices"][0]["message"].get("content") or ""
            # 思考模型可能带 <think>,剥掉
            content = re.sub(r"<think>.*?</think>", "", content, flags=re.S).strip()
            if content:
                return content
            last = "empty content"
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
    out_dir = None
    dirs = []
    i = 0
    while i < len(args):
        if args[i] == "--out":
            out_dir = Path(args[i + 1]); i += 2
        else:
            dirs.append(Path(args[i])); i += 1
    if not API_KEY or not out_dir or not dirs:
        sys.exit("用法: MIMO_API_KEY=xx distill_docs.py <目录>... --out <输出目录>")
    out_dir.mkdir(parents=True, exist_ok=True)

    tasks = []
    for d in dirs:
        for f in sorted(d.glob("*.txt")):
            dst = out_dir / (f.stem + ".digest.md")
            if dst.exists() and dst.stat().st_size > 0:
                continue
            tasks.append((f, dst))
    log(f"待蒸馏: {len(tasks)} 篇")
    done = fail = 0
    with ThreadPoolExecutor(max_workers=CONCURRENCY) as pool:
        futs = {pool.submit(chat, f.read_text(encoding="utf-8", errors="replace")): (f, dst)
                for f, dst in tasks}
        for fut in as_completed(futs):
            f, dst = futs[fut]
            try:
                digest = fut.result()
                dst.write_text(f"<!-- 来源: {f.name} -->\n\n{digest}", encoding="utf-8")
                done += 1
                if done % 10 == 0:
                    log(f"进度 {done}/{len(tasks)}")
            except Exception as e:
                fail += 1
                log(f"! 失败 {f.name[:50]}: {e}")
    log(f"结束: 成功 {done}, 失败 {fail}")


if __name__ == "__main__":
    main()
