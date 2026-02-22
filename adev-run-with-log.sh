#!/usr/bin/env bash
# Angular.dev-i log faylına yazmaqla işə salır — terminal bağlansa belə sonra .tmp/adev.log oxuya bilərsiniz.

set -e
# Skript angular qovluğundadır; package.json da burdadır
cd "$(dirname "$0")"
mkdir -p .tmp

export TMPDIR="$(pwd)/.tmp"
export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"

LOG=".tmp/adev.log"
echo "=== $(date) === adev başladı, log: $LOG ===" | tee -a "$LOG"
echo ""

# CI= lazımdır, yoxsa skript "Cannot run on CI" deyib çıxır
export CI=
exec pnpm adev 2>&1 | tee -a "$LOG"
