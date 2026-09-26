#!/usr/bin/env python3
"""Render a content page's Markdown into a print-ready PDF.

Usage:
    python3 scripts/generate-pdf.py <src.md> <out.pdf> "<Title>" ["<Subtitle>"]

Uses the `markdown` package to build HTML and headless Chrome to print it.
The trailing "Konzept (PDF)" section and its download link are stripped so the
PDF does not reference itself.
"""

import os
import re
import subprocess
import sys
import tempfile

import markdown

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

TEMPLATE = """<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8" />
<title>{title}</title>
<style>
  @page {{ size: A4; margin: 20mm 18mm; }}
  html {{ -webkit-print-color-adjust: exact; }}
  body {{
    font-family: "DejaVu Sans", "Liberation Sans", Arial, sans-serif;
    font-size: 10.5pt;
    line-height: 1.5;
    color: #1a1a1a;
    margin: 0;
  }}
  header {{ margin-bottom: 22px; border-bottom: 2px solid #d94f30; padding-bottom: 10px; }}
  header h1 {{ font-size: 21pt; margin: 0 0 2px; color: #d94f30; }}
  header p {{ margin: 0; font-size: 10pt; color: #555; letter-spacing: .04em; text-transform: uppercase; }}
  h2 {{ font-size: 13.5pt; margin: 20px 0 6px; color: #b23a1e; page-break-after: avoid; }}
  h3 {{ font-size: 11.5pt; margin: 14px 0 4px; color: #333; page-break-after: avoid; }}
  p {{ margin: 0 0 8px; text-align: justify; }}
  ul {{ margin: 0 0 8px; padding-left: 18px; }}
  li {{ margin-bottom: 2px; }}
  a {{ color: #1a1a1a; text-decoration: none; }}
  em {{ color: #444; }}
</style>
</head>
<body>
<header>
  <h1>{title}</h1>
  <p>{subtitle}</p>
</header>
{body}
</body>
</html>
"""


def read_markdown(path):
    with open(path, encoding="utf-8") as fh:
        text = fh.read()
    if text.startswith("---"):
        text = text.split("---", 2)[2]
    return text.lstrip("\n")


def strip_self_link(text):
    return re.split(r"\n##\s+Konzept \(PDF\)", text)[0].rstrip() + "\n"


def main():
    if len(sys.argv) < 4:
        sys.exit(__doc__)
    src, out, title = sys.argv[1], sys.argv[2], sys.argv[3]
    subtitle = sys.argv[4] if len(sys.argv) > 4 else "Kita Pipilota"

    body = markdown.markdown(
        strip_self_link(read_markdown(os.path.join(ROOT, src))),
        extensions=["extra", "sane_lists"],
    )
    html = TEMPLATE.format(title=title, subtitle=subtitle, body=body)

    out_abs = os.path.join(ROOT, out)
    os.makedirs(os.path.dirname(out_abs), exist_ok=True)

    with tempfile.TemporaryDirectory() as tmp:
        html_path = os.path.join(tmp, "konzept.html")
        with open(html_path, "w", encoding="utf-8") as fh:
            fh.write(html)
        subprocess.run(
            [
                "google-chrome",
                "--headless=new",
                "--disable-gpu",
                "--no-sandbox",
                "--no-pdf-header-footer",
                f"--user-data-dir={tmp}/chrome",
                f"--print-to-pdf={out_abs}",
                f"file://{html_path}",
            ],
            check=True,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )
    print(f"wrote {out}")


if __name__ == "__main__":
    main()
