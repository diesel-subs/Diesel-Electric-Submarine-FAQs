# save as scripts/dev.sh and make executable:  chmod +x scripts/dev.sh
#!/usr/bin/env bash
( sleep 4; open "http://127.0.0.1:8000" >/dev/null 2>&1 ) &  # use xdg-open on Linux
mkdocs serve --dirtyreload
