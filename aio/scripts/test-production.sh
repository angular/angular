#!/usr/bin/env bash
set +x -eu -o pipefail

(
  readonly thisDir="$(cd $(dirname ${BASH_SOURCE[0]}); pwd)"
  readonly aioDir="$(realpath $thisDir/..)"

  readonly appPtorConf="$aioDir/tests/e2e/protractor.conf.js"
  readonly cfgPtorConf="$aioDir/tests/deployment-config/e2e/protractor.conf.js"
  readonly minPwaScore="95"
  readonly urls=(
    "https://angular.io/"
    "https://next.angular.io"
  )

  cd "$aioDir"

  # Install dependencies.
  echo -e "\nInstalling dependencies in '$aioDir'...\n-----"
  yarn install --frozen-lockfile
  yarn update-webdriver

  # Run checks for all URLs.
  for url in "${urls[@]}"; do
    echo -e "\nChecking '$url'...\n-----"

    # Run e2e tests.
    yarn protractor "$appPtorConf" --baseUrl "$url"

    # Run deployment config tests.
    yarn protractor "$cfgPtorConf" --baseUrl "$url"

    # Run PWA-score tests.
    yarn test-pwa-score "$url" "$minPwaScore"
  done

  echo -e "\nAll checks passed!"
)
