# 素材处理与知识库构建脚本

这组脚本把 `/Users/kubo/素材/哥飞课程` 的视频/PDF/HTML/长截图素材加工成 `docs/website-seo/` 知识库。全部使用小米 MiMo API(廉价 LLM),需要先设置:

```bash
export MIMO_API_KEY=tp-xxx
export MIMO_BASE_URL=https://token-plan-sgp.xiaomimimo.com/v1   # 默认值,可省略
```

依赖:`ffmpeg`(音频抽取)、`poppler`(pdftotext/pdfimages)。`brew install ffmpeg poppler`。

## 流水线总览

```
视频/音频 ──transcribe_media.py──> <原文件>.transcript.md   (落在素材原文件夹)
图片型PDF/长截图 ──ocr_images.py──> /tmp/gefei_ocr/*.ocr.txt ──backfill_ocr.py──> <原文件>.ocr.md
HTML/文字PDF ──extract_texts.py──> /tmp/gefei_texts/*.txt
以上文本 ──distill_docs.py──> *.digest.md(结构化摘要)
摘要 ──bucket_digests.py──> /tmp/buckets/<章节>/
章节桶 ──synthesize_chapter.py──> /tmp/chapters/<章节>.md(章节长文)
章节长文+摘要 ──build_kb_pages.py──> docs/website-seo/<章节>/
```

## 各脚本用法

| 脚本 | 作用 | 示例 |
| --- | --- | --- |
| `transcribe_media.py` | 视频/音频转文字(mimo-v2.5-asr),按 300s 切片,断点续跑,产物 `.transcript.md` 落原文件夹 | `python3 scripts/transcribe_media.py "/Users/kubo/素材/哥飞课程"` |
| `ocr_images.py` | 图片型 PDF、长截图 OCR(mimo-v2.5 视觉),断点续跑 | `python3 scripts/ocr_images.py "素材目录" /tmp/gefei_ocr` |
| `backfill_ocr.py` | 把 OCR 产物按来源回填到素材原文件夹(`.ocr.md`) | `python3 scripts/backfill_ocr.py /tmp/gefei_ocr` |
| `extract_texts.py` | HTML(SingleFile 快照)/带文字层 PDF 提取纯文本 | `python3 scripts/extract_texts.py "素材目录" /tmp/gefei_texts` |
| `distill_docs.py` | 逐篇蒸馏为结构化摘要(标题/分类/要点/工具),断点续跑 | `python3 scripts/distill_docs.py /tmp/gefei_texts --out /tmp/gefei_digests` |
| `bucket_digests.py` | 摘要按 12 个章节分桶,html/pdf 同名去重 | `python3 scripts/bucket_digests.py /tmp/gefei_digests` |
| `synthesize_chapter.py` | 一个章节桶合成一篇体系化长文(mimo-v2.5-pro) | `python3 scripts/synthesize_chapter.py --title 外链建设 --out /tmp/chapters/05-外链建设.md /tmp/buckets/05-外链建设` |
| `build_kb_pages.py` | 组装章节正文+资料索引到 `docs/website-seo/` | `python3 scripts/build_kb_pages.py` |
| `unzip_gbk.py` | 解压 zip 并修复 GBK 文件名乱码 | `python3 scripts/unzip_gbk.py 深圳分享.zip .` |

## 素材新增后的增量更新

1. `transcribe_media.py` 重跑一遍(自动跳过已完成)。
2. 新转写稿复制到临时目录后 `distill_docs.py` 蒸馏。
3. `bucket_digests.py` 分桶 → `synthesize_chapter.py` 重合成受影响章节 → `build_kb_pages.py` 重建页面。
