#!/usr/bin/env python3
"""tttos rebrand: turn what a user can see of the upstream name into tttos.

Run from anywhere:   python3 tools/tttos_rebrand.py           (apply)
                     python3 tools/tttos_rebrand.py --check   (count only, change nothing)

Safe to run again and again: after taking new upstream code, run it once more and the new
leftovers get renamed. Only the shell layer is touched. Internal names (JAVIS_* environment
variables, javis_* tool names, .javis data folders, pack ids) stay, because store packs, skills
and saved data depend on them.

What it renames:
  1. Session cookie            javis_session[_tttos]  ->  tttos_session
  2. Browser storage keys      "javis.<key>"          ->  "tttos.<key>"   (old values are copied once)
  3. Words shown on screen     Javis / Javis OS / JAVIS OS  ->  TTTOS      (dashboard only)
  4. Mac launchers             Start/Stop JAVIS OS.command  ->  Start/Stop tttos.command
  5. Loads dashboard/update-channel.js (update channel picker) from index.html
"""
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BRAND = "TTTOS"
PREFIX = "tttos"
PORT = "7779"
COOKIE = "tttos_session"

# Dotted names that look like storage keys but are pack ids or files. Never renamed.
KEEP_DOTTED = ("zalo", "crm", "tinh-gia", "cloudflare", "cloudflare-oauth", "log", "exe",
               "team_runner", "feedback_projector", "agent_judge")

TEXT_EXT = {".py", ".js", ".html", ".css", ".json", ".md", ".sh", ".command", ".txt", ".mjs"}
SELF = "tools/tttos_rebrand.py"

RE_COOKIE = re.compile(r"javis_session(?:_tttos)?(?![A-Za-z0-9_])")
RE_KEY = re.compile(r"""(["'`])javis\.(?!(?:%s)["'`])(?=[A-Za-z])""" % "|".join(re.escape(k) for k in KEEP_DOTTED))
RE_KEY_FULL = re.compile(RE_KEY.pattern + r"([A-Za-z0-9_.:-]*)")
RE_KEY_NEW = re.compile(r"""["'`]%s\.([A-Za-z][A-Za-z0-9_.:-]*)""" % PREFIX)
RE_NAME_OS = re.compile(r"(?<![A-Za-z0-9_$.\-/])(?:JAVIS|Javis) OS(?![A-Za-z0-9_$\-])")
# "Javis Core" is the name of the main agent, stored as data, so it is left alone.
RE_NAME = re.compile(r"(?<![A-Za-z0-9_$.\-/@])(?:Javis|JAVIS)(?! Core)(?!\.[A-Za-z_$])(?![A-Za-z0-9_$\-])")

MIGRATE_MARK = "tttos-migrate"
MIGRATE = ("<script>/*" + MIGRATE_MARK + "*/(function(){try{var S=localStorage;if(S.getItem('" + PREFIX
           + ".migrated'))return;var o='jav'+'is.';for(var i=S.length-1;i>=0;i--){var k=S.key(i);"
           "if(k&&k.indexOf(o)===0){var n='" + PREFIX + ".'+k.slice(o.length);"
           "if(S.getItem(n)===null)S.setItem(n,S.getItem(k));}}S.setItem('" + PREFIX
           + ".migrated','1');}catch(e){}})();</script>\n  ")
CHANNEL_TAG = '<script src="/static/update-channel.js?v=1"></script>'


def tracked():
    out = subprocess.run(["git", "ls-files", "-z", "--cached", "--others", "--exclude-standard"],
                         cwd=ROOT, capture_output=True, check=True).stdout.decode("utf-8")
    return [p for p in out.split("\0") if p]


def is_text(rel):
    return Path(rel).suffix.lower() in TEXT_EXT and rel != SELF and not rel.startswith("third_party/")


def main():
    check = "--check" in sys.argv
    counts = {"cookie": 0, "storage": 0, "name": 0, "launcher": 0, "files": 0}
    files = tracked()

    keys = set()   # storage keys the dashboard uses, with or without the new prefix
    for rel in files:
        if rel.startswith("dashboard/") and is_text(rel):
            try:
                text = (ROOT / rel).read_text(encoding="utf-8")
            except (UnicodeDecodeError, FileNotFoundError, IsADirectoryError):
                continue
            keys.update(m.group(2) for m in RE_KEY_FULL.finditer(text))
            keys.update(m.group(1) for m in RE_KEY_NEW.finditer(text))

    for rel in files:
        if not is_text(rel):
            continue
        path = ROOT / rel
        try:
            old = path.read_text(encoding="utf-8")
        except (UnicodeDecodeError, FileNotFoundError, IsADirectoryError):
            continue
        new = old
        in_dash = rel.startswith("dashboard/")
        in_code = in_dash or rel.startswith(("server/", "system/", "tests/", "cli/"))

        if in_code:
            new, n = RE_COOKIE.subn(COOKIE, new)
            counts["cookie"] += n
            if in_dash:
                new, n = RE_KEY.subn(lambda m: m.group(1) + PREFIX + ".", new)
            else:  # outside the dashboard only keys the dashboard really uses, never domains or pack ids
                new, n = RE_KEY_FULL.subn(
                    lambda m: m.group(1) + (PREFIX if m.group(2) in keys else "javis") + "." + m.group(2), new)
                n = sum(1 for m in RE_KEY_FULL.finditer(old) if m.group(2) in keys)
            counts["storage"] += n
        if in_dash:
            new, n1 = RE_NAME_OS.subn(BRAND, new)
            new, n2 = RE_NAME.subn(BRAND, new)
            counts["name"] += n1 + n2
        for word in ("Start", "Stop"):
            a, b = f"{word} JAVIS OS.command", f"{word} tttos.command"
            counts["launcher"] += new.count(a)
            new = new.replace(a, b)

        if rel == "dashboard/index.html":
            if MIGRATE_MARK not in new:
                new = new.replace("<script>(function(){try{var m=localStorage.getItem(", MIGRATE
                                  + "<script>(function(){try{var m=localStorage.getItem(", 1)
            if "update-channel.js" not in new:
                new = new.replace('<script src="/static/branding.js', CHANNEL_TAG + "\n  "
                                  + '<script src="/static/branding.js', 1)

        if new != old:
            counts["files"] += 1
            if not check:
                path.write_text(new, encoding="utf-8")

    # Mac launchers: one Start, one Stop, both on the tttos port.
    start_old, stop_old = ROOT / "Start JAVIS OS.command", ROOT / "Stop JAVIS OS.command"
    stop_new = ROOT / "Stop tttos.command"
    if not check:
        if start_old.exists() and (ROOT / "Start tttos.command").exists():
            start_old.unlink()
        if stop_old.exists():
            stop_old.unlink()
        if not stop_new.exists():
            stop_new.write_text(
                '#!/bin/bash\n# Double-click in Finder to stop tttos.\n'
                'cd "$(dirname "$0")" || exit 1\n'
                f'JAVIS_PORT={PORT} bash "bin/javis-stop.sh"\n'
                'echo ""\necho "You can close this window."\n', encoding="utf-8")
            stop_new.chmod(0o755)

    print(("Would change" if check else "Changed") + f" {counts['files']} files: "
          f"cookie {counts['cookie']}, storage keys {counts['storage']}, "
          f"shown name {counts['name']}, launcher mentions {counts['launcher']}")


if __name__ == "__main__":
    main()
