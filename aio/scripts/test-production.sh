#!/usr/bin/env bash
set +x -eu -o pipefail

(
  readonly thisDir="$(cd $(dirname ${BASH_SOURCE[0]}); pwd)"
  readonly aioDir="$(realpath $thisDir/..)"

  readonly protractorConf="$aioDir/tests/deployment/e2e/protractor.conf.js"
  readonly minPwaScore="$1"
  readonly urls=(
    "https://angular.io/"
    "https://next.angular.io/"
  )

  cd "$aioDir"

  # Install dependencies.
  echo -e "\nInstalling dependencies in '$aioDir'...\n-----"
  yarn install --frozen-lockfile
  yarn update-webdriver

  # Run checks for all URLs.
  for url in "${urls[@]}"; do
    echo -e "\nChecking '$url'...\n-----"

    # Run basic e2e and deployment config tests.
    yarn protractor "$protractorConf" --baseUrl "$url"

    # Run PWA-score tests.
    yarn test-pwa-score "$url" "$minPwaScore"
  done

  echo -e "\nAll checks passed!"
)
