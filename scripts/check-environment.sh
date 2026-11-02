#!/usr/bin/env bash
set -e
echo "== Kenya Sentinel environment check =="
for cmd in python3 git node npm; do
  if command -v "$cmd" >/dev/null 2>&1; then
    printf "%-10s %s\\n" "$cmd" "$("$cmd" --version 2>&1 | head -n 1)"
  else
    printf "%-10s MISSING\\n" "$cmd"
  fi
done
python3 - <<'PY'
import sys
print("Python 3.10+:", sys.version_info >= (3, 10))
PY
