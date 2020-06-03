# Browser configuration and versioning for testing of Angular

Within the Angular monorepo, we use Chrome to perform most of the local testing, and rely on Sauce Labs and BrowserStack to do cross-browser testing on our CI.

The version of Chrome used in tests within this monorepo is configured and controlled via `rules_webtesting` and `puppeteer`. We manually keep the configuration of these two tools in sync to create a consistent testing environment across unit, e2e, and integration tests.

## rules_webtesting

Bazel `karma_web_test_suite` and `protractor_web_test_suite` targets will use Chromium provisioned by rules_webtesting. The version of chrome used is specified in the `dev-infra/browsers/browser_repositories.bzl` file. The process of updating the Chrome version in that file consists of several steps:

1) Visit https://chromium.woolyss.com/ and note the version (commit position) of the latest stable version.

    For example, "Google Chrome 83.0.4103.97 (756066) • Wednesday, 3 Jun 2020". Alternately, you can look in https://omahaproxy.appspot.com/.

1) Find the closest commit position number available for each platform in chromium-browser-snapshots:
 https://commondatastorage.googleapis.com/chromium-browser-snapshots/index.html

   For example,

   * https://commondatastorage.googleapis.com/chromium-browser-snapshots/index.html?prefix=Linux_x64/756066/
   * https://commondatastorage.googleapis.com/chromium-browser-snapshots/index.html?prefix=Mac/756053/
   * https://commondatastorage.googleapis.com/chromium-browser-snapshots/index.html?prefix=Win/756065/

   You can download the Chromium for your local platform and double check that the --version matches up with
   what you expect.

   For example,

``` bash
$ ~/Downloads/chrome-mac/Chromium.app/Contents/MacOS/Chromium --version
Chromium 83.0.4103.0
```

1) Update the chrome & chrome driver build numbers in `dev-infra/browsers/browser_repositories.bzl` and run either run `bazel query @org_chromium_chromium_amd64//...` to prompt Bazel to calculate the new sha256 for each platform binary or determine the new sha256 values manually.

    For example, with curl & shasum

``` bash
curl https://commondatastorage.googleapis.com/chromium-browser-snapshots/Linux_x64/756066/chrome-linux.zip | shasum -a 256
```

## puppeteer

Visit https://github.com/puppeteer/puppeteer/blob/master/docs/api.md to determine which version of puppeteer corresponds to the version of Chrome desired. Then update `scripts/puppeteer-chrome-versions.js` and all of the puppeteer versions throughout the repo,

* `package.json`
* `aio/package.json`
* `aio/tools/examples/shared/package.json`

and their corresponding `yarn.lock` files.
