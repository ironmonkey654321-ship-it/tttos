"""tttos update source: which repo and which branch (channel) this machine updates from.

Kept in its own file so the update path is separate from the upstream code. Both main.py
(version check, changelog, announcements) and updater.py (fetch + merge) ask here.

- Channel list: tttos-update.json at the project root (tracked, same on every machine).
- This machine's choice: STATE_DIR/update_channel.json (not tracked), or the
  TTTOS_UPDATE_CHANNEL environment variable, which wins.
"""
import json
import os
import re
from pathlib import Path

import config as cfgmod

PROJECT_ROOT = Path(__file__).resolve().parent.parent
CONFIG_FILE = PROJECT_ROOT / "tttos-update.json"
CHOICE_FILE = cfgmod.STATE_DIR / "update_channel.json"

_DEFAULT = {
    "repo": "ironmonkey654321-ship-it/tttos",
    "default": "chung",
    "channels": {"chung": {"branch": "main", "label": "Chung"}},
}
_SAFE_REPO = re.compile(r"^[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+$")
_SAFE_BRANCH = re.compile(r"^[A-Za-z0-9_.][A-Za-z0-9_./-]*$")


def _config() -> dict:
    try:
        data = json.loads(CONFIG_FILE.read_text(encoding="utf-8"))
    except Exception:
        return dict(_DEFAULT)
    repo = str(data.get("repo") or "")
    channels = {}
    for cid, info in (data.get("channels") or {}).items():
        branch = str((info or {}).get("branch") or "")
        if _SAFE_BRANCH.match(branch):
            channels[str(cid)] = {"branch": branch, "label": str((info or {}).get("label") or cid)}
    if not _SAFE_REPO.match(repo) or not channels:
        return dict(_DEFAULT)
    default = str(data.get("default") or "")
    if default not in channels:
        default = next(iter(channels))
    return {"repo": repo, "default": default, "channels": channels}


def current() -> str:
    """Channel id this machine follows."""
    cfg = _config()
    env = (os.getenv("TTTOS_UPDATE_CHANNEL") or "").strip()
    if env in cfg["channels"]:
        return env
    try:
        saved = str(json.loads(CHOICE_FILE.read_text(encoding="utf-8")).get("channel") or "")
        if saved in cfg["channels"]:
            return saved
    except Exception:
        pass
    return cfg["default"]


def repo() -> str:
    return _config()["repo"]


def branch() -> str:
    cfg = _config()
    return cfg["channels"][current()]["branch"]


def git_remote() -> str:
    return f"https://github.com/{repo()}.git"


def info() -> dict:
    cfg = _config()
    env = (os.getenv("TTTOS_UPDATE_CHANNEL") or "").strip()
    return {
        "repo": cfg["repo"],
        "current": current(),
        "branch": branch(),
        "locked_by_env": env in cfg["channels"],
        "channels": [{"id": cid, "branch": c["branch"], "label": c["label"]}
                     for cid, c in cfg["channels"].items()],
    }


def set_channel(channel_id: str) -> dict:
    cfg = _config()
    if channel_id not in cfg["channels"]:
        raise ValueError("unknown channel")
    CHOICE_FILE.parent.mkdir(parents=True, exist_ok=True)
    CHOICE_FILE.write_text(json.dumps({"channel": channel_id}, ensure_ascii=False), encoding="utf-8")
    return info()
