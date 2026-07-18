#!/usr/bin/env python3
"""
把聊天记录纯文本(*.chat.txt / 聊天导出md)按块蒸馏成"社群问答精华"。

用法:
    export MIMO_API_KEY=tp-xxx
    python3 scripts/distill_chats.py <聊天目录> --out /tmp/chat_digests

按 ~50KB 分块,逐块提取有价值的问答/经验/工具,输出 *.chunkNN.md,可断点续跑。
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
CONCURRENCY = int(os.environ.get("DISTILL_CONCURRENCY", "5"))
CHUNK_CHARS = 50000

PROMPT = """下面是"哥飞的朋友们"出海建站社群的一段群聊记录。请从中提取对做英文网站/谷歌SEO/变现有实际价值的内容,忽略寒暄、表情、灌水、报名接龙等噪声。

输出 markdown,格式:
### 主题短语
- **问**: ...(如果是问答形式;提问可简写)
- **答**(回答者): ...(保留具体结论、数字、工具名、网址)

或者对于非问答的经验分享:
### 主题短语
- (分享者)要点...

要求:
1. 只保留有信息量的内容,一段聊天可能有 0~15 个主题,没有就输出"(本段无有价值内容)"。
2. 保留原始判断标准和数据,不要自行发挥。
3. 哥飞本人的发言优先保留。
"""


def log(msg):
    print(f"[{time.strftime('%H:%M:%S')}] {msg}", flush=True)


def chat_api(text: str) -> str:
    body = {
        "model": MODEL,
        "messages": [{"role": "user", "content": PROMPT + "\n\n---聊天记录---\n" + text}],
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


def chunks_of(path: Path):
    text = path.read_text(encoding="utf-8", errors="replace")
    lines = text.splitlines()
    buf, size = [], 0
    for line in lines:
        buf.append(line)
        size += len(line) + 1
        if size >= CHUNK_CHARS:
            yield "\n".join(buf)
            buf, size = [], 0
    if buf:
        yield "\n".join(buf)


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
        sys.exit("用法: MIMO_API_KEY=xx distill_chats.py <目录> --out <输出目录>")
    out_dir.mkdir(parents=True, exist_ok=True)

    tasks = []
    for d in dirs:
        files = sorted(list(d.glob("*.chat.txt")) + list(d.glob("*⑩.md")))
        for f in files:
            for ci, chunk in enumerate(chunks_of(f)):
                dst = out_dir / f"{f.stem}.chunk{ci:03d}.md"
                if dst.exists() and dst.stat().st_size > 0:
                    continue
                tasks.append((chunk, dst))
    log(f"待蒸馏聊天块: {len(tasks)}")
    done = fail = 0
    with ThreadPoolExecutor(max_workers=CONCURRENCY) as pool:
        futs = {pool.submit(chat_api, chunk): dst for chunk, dst in tasks}
        for fut in as_completed(futs):
            dst = futs[fut]
            try:
                result = fut.result()
                dst.write_text(result, encoding="utf-8")
                done += 1
                if done % 10 == 0:
                    log(f"进度 {done}/{len(tasks)}")
            except Exception as e:
                fail += 1
                log(f"! 失败 {dst.name}: {e}")
    log(f"结束: 成功 {done}, 失败 {fail}")


if __name__ == "__main__":
    main()
