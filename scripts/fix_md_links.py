#!/usr/bin/env python3
import re
import os
import sys
import shutil
import argparse
from pathlib import Path
from typing import Optional
from urllib.parse import urlparse

LINK_RE = re.compile(r'(!?\[[^\]]+\]\()([^)]+)(\))')  # capture: prefix, url, suffix

def is_external(url: str) -> bool:
    """
    Treat only fully qualified URLs (http/https/mailto/tel/data/etc.) as external.
    Root-relative paths like '/categories/...' are considered internal so we can fix them.
    """
    parsed = urlparse(url)
    if parsed.scheme and parsed.netloc:
        return True
    # Do NOT treat root-relative (/foo) as external; we want to rewrite those.
    return False

def split_url(url: str):
    """Return (path_part, tail) where tail keeps ?query and/or #fragment."""
    qpos = url.find('?')
    hpos = url.find('#')
    cut = len(url)
    if qpos != -1: cut = min(cut, qpos)
    if hpos != -1: cut = min(cut, hpos)
    return url[:cut], url[cut:]

def resolve_candidate(base: Path, raw_path: str) -> Optional[Path]:
    """
    Resolve a Markdown link target against 'base' (either docs_root or the file's parent),
    returning a real file path if it exists, otherwise None.
    Handles:
      - missing .md
      - directory links -> index.md
    """
    # Normalize separators and strip leading './'
    norm = raw_path.replace('\\', '/').lstrip('./')
    candidate = (base / norm).resolve()

    # Exact file
    if candidate.is_file():
        return candidate

    # Missing extension -> try .md
    if candidate.suffix == '' and candidate.with_suffix('.md').is_file():
        return candidate.with_suffix('.md')

    # Directory -> index.md
    if candidate.is_dir():
        idx = candidate / 'index.md'
        if idx.is_file():
            return idx

    # Trailing slash form that isn't a real dir: try index.md anyway
    if norm.endswith('/'):
        idx = candidate / 'index.md'
        if idx.is_file():
            return idx

    return None

def relativize(from_file: Path, to_file: Path) -> str:
    # Use os.path.relpath, then normalize to forward slashes for Markdown/URLs
    rel = os.path.relpath(str(to_file), start=str(from_file.parent))
    return Path(rel).as_posix()

def process_file(md_path: Path, docs_root: Path, write: bool):
    text = md_path.read_text(encoding='utf-8')
    changed = []
    out = []
    last = 0

    for m in LINK_RE.finditer(text):
        prefix, url, suffix = m.groups()
        new_url = url

        # Skip images, in-page anchors, and fully external links
        if prefix.startswith('![') or url.startswith('#') or is_external(url):
            out.append(text[last:m.start()])
            out.append(m.group(0))
            last = m.end()
            continue

        path_part, tail = split_url(url)

        # Normalize Windows backslashes and collapse leading "./"
        norm = path_part.replace('\\', '/').lstrip('./')

        # Resolution rules:
        # - '/categories/...' => resolve against docs root (strip the leading '/')
        # - 'categories/...'  => resolve against docs root
        # - otherwise         => resolve relative to the current file's folder (MkDocs default)
        if norm.startswith('/categories/'):
            target = resolve_candidate(docs_root, norm.lstrip('/'))
        elif norm.startswith('categories/'):
            target = resolve_candidate(docs_root, norm)
        else:
            target = resolve_candidate(md_path.parent, norm)

        if target and target.is_file():
            rel = relativize(md_path, target)
            new_url = rel + tail
            if new_url != url:
                changed.append((url, new_url))
                out.append(prefix + new_url + suffix)
            else:
                out.append(m.group(0))
        else:
            # Could not resolve; leave as-is
            out.append(m.group(0))

        last = m.end()

    out.append(text[last:])
    new_text = ''.join(out)

    if changed and write:
        backup = md_path.with_suffix(md_path.suffix + '.bak')
        if not backup.exists():
            shutil.copyfile(md_path, backup)
        md_path.write_text(new_text, encoding='utf-8')

    return changed

def main():
    ap = argparse.ArgumentParser(description="Fix internal Markdown links to correct relative paths.")
    ap.add_argument('--docs-root', default='docs', help='Docs root directory (default: docs)')
    ap.add_argument('--write', action='store_true', help='Write changes (otherwise dry-run)')
    args = ap.parse_args()

    docs_root = Path(args.docs_root).resolve()
    if not docs_root.is_dir():
        print(f"ERROR: docs root not found: {docs_root}", file=sys.stderr)
        sys.exit(1)

    md_files = sorted(docs_root.rglob('*.md'))
    total_changes = 0
    touched_files = 0

    for md in md_files:
        changes = process_file(md, docs_root, args.write)
        if changes:
            touched_files += 1
            total_changes += len(changes)
            print(f"\n{md.relative_to(docs_root)}")
            for old, new in changes:
                print(f"  - {old}  ->  {new}")

    if touched_files == 0:
        print("No changes needed.")
    else:
        print(f"\nSummary: {total_changes} link(s) updated across {touched_files} file(s).")
        if not args.write:
            print("Dry run only. Re-run with --write to apply changes.")

if __name__ == '__main__':
    main()

