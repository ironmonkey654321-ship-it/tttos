#!/bin/bash
# Double-click in Finder to start tttos and open the dashboard.
cd "$(dirname "$0")" || exit 1
JAVIS_PORT=7779 bash "bin/javis-start.sh"
echo ""
echo "tttos is running at http://127.0.0.1:7779"
echo "This window can be closed - the server keeps running in the background."
