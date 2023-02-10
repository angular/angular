#!/usr/bin/env bash
set +x -eu -o pipefail

(
  readonly thisDir="$(cd $(dirname ${BASH_SOURCE[0]}); pwd)"
  readonly aioDir="$(realpath $thisDir/..)"

  readonly protractorConf="$aioDir/tests/deployment/e2e/protractor.conf.js"
  readonly targetUrl="$1"
  readonly minPwaScore="$2"

  cd "$aioDir"

  # Install dependencies.
  echo -e "\nInstalling dependencies in '$aioDir'...\n-----"
  yarn install --frozen-lockfile --non-interactive

  # Run checks for target URL.
  echo -e "\nChecking '$targetUrl'...\n-----"

  # Run basic e2e and deployment config tests.
  yarn test-production-url --test_env=TARGET_URL="$targetUrl"

  # Run PWA-score tests.
  yarn test-pwa-score "$targetUrl" "$minPwaScore"

  # Run a11y tests.
  yarn test-a11y-score "$targetUrl"

  echo -e "\nAll checks passed!"
)
