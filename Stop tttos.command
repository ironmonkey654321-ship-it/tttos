#!/bin/bash
# Double-click in Finder to stop tttos.
cd "$(dirname "$0")" || exit 1
JAVIS_PORT=7779 bash "bin/javis-stop.sh"
echo ""
echo "You can close this window."
