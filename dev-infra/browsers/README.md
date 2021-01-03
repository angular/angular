# Browser configuration and versioning for testing of Angular

Within the Angular organization, we use Chrome and Firefox to perform most of the local testing, and rely on Sauce Labs and BrowserStack to do cross-browser testing on our CI.

The version of Chrome used in tests within this monorepo is configured and controlled via Bazel and `puppeteer`.
We manually keep the configuration of these two tools in sync to create a consistent testing environment across unit, e2e, and integration tests.

## Bazel

Bazel `karma_web_test_suite` and `protractor_web_test_suite` targets will use Chromium or Firefox provisioned by `//dev-infra/browsers`.
The version of Chrome and Firefox are specified in the `chromium.bzl` and `firefox.bzl` files in `/dev-infra/browsers`.

The process of updating the Chrome or Firefox version is not straightforward, but below are dedicated sections for each browser.

## Updating Chromium

1. Visit https://chromium.woolyss.com/ and note the version (commit position) of the latest stable version.

    For example, "Google Chrome 83.0.4103.97 (756066) • Wednesday, 3 Jun 2020".
    Alternatively, you can look in https://omahaproxy.appspot.com/.

2. Find the closest commit position number available for each platform in chromium-browser-snapshots: https://commondatastorage.googleapis.com/chromium-browser-snapshots/index.html

    For example:
    * https://commondatastorage.googleapis.com/chromium-browser-snapshots/index.html?prefix=Linux_x64/756066/
    * https://commondatastorage.googleapis.com/chromium-browser-snapshots/index.html?prefix=Mac/756053/
    * https://commondatastorage.googleapis.com/chromium-browser-snapshots/index.html?prefix=Win/756065/

    You can download Chromium for your local platform and double check that the `--version` matches up with what you expect.

    For example:
    ``` bash
    $ ~/Downloads/chrome-mac/Chromium.app/Contents/MacOS/Chromium --version
    Chromium 83.0.4103.0
    ```

3. Update the chrome & chrome driver build numbers in `dev-infra/browsers/chromium/chromium.bzl` and either run `bazel query @org_chromium_chromium_amd64//...` to prompt Bazel to calculate the new `sha256` for each platform binary or determine the new `sha256` values manually.

    Here is an example with `curl` & `shasum`:
    ``` bash
    curl -L https://commondatastorage.googleapis.com/chromium-browser-snapshots/Linux_x64/756066/chrome-linux.zip | shasum -a 256
    ```

## Puppeteer

1. Visit https://github.com/puppeteer/puppeteer/blob/master/docs/api.md to determine which version of puppeteer corresponds to the version of Chrome desired.

2. Visit https://chromedriver.chromium.org/downloads to determine which version of ChromeDriver should be used for the version of Chrome desired.

    > NOTE:
    > The version of Chrome does not necessarily correspond exactly with the version of ChromeDriver.
    > For example, you might have to use ChromeDriver v87.0.4280.x to drive Chrome v87.0.4272.x.

3. Update `scripts/puppeteer-chromedriver-versions.js` to include and entry with the new version of puppeteer as key and the new version of ChromeDriver as value (as determined in the two previous steps).

4. Update all of the puppeteer versions throughout the repo:

    * `package.json`
    * `aio/package.json`
    * `aio/tools/examples/shared/package.json`

    ...and their corresponding `yarn.lock` files.

## Firefox

In order to update Firefox, open the `dev-infra/browsers/firefox/firefox.bzl` file and update the repository URLs to the desired version.
For example:

```bzl
platform_http_file(
    name = "org_mozilla_firefox_amd64",
    licenses = ["reciprocal"],  # MPL 2.0
    sha256 = "bde6e020556a21561e4b8d7aaecf8db7077951f179b98ca5d0305435bc6802c9",
    # Firefox v78.0
    urls = ["https://ftp.mozilla.org/pub/firefox/releases/78.0/linux-x86_64/en-US/firefox-78.0.tar.bz2"],
)
```

1. Go to the `urls` property and update the URL by replacing all `78.0` occurrences with the version you intend to use.
    Once done, do the same change for other platforms (such as `macos`).

2. Update the `sha256` checksum of the browser archives.
    You can do this by downloading the artifacts from the URLs you just updated, and then running `shasum` on those files:
    ```sh
    curl -L <BROWSER_URL> | shasum -a 256
    ```

In the same file, you can also update the version of gecko driver (the WebDriver implementation for Firefox browsers).

1. Go to https://firefox-source-docs.mozilla.org/testing/geckodriver/Support.html and find a version that is compatible with the used version of Firefox.

2. Update the `geckodriver` repository URLs to the desired version:

    ```bzl
    platform_http_file(
        name = "org_mozilla_geckodriver_amd64",
        licenses = ["reciprocal"],  # MPL 2.0
        sha256 = "d59ca434d8e41ec1e30dd7707b0c95171dd6d16056fb6db9c978449ad8b93cc0",
        # Geckodriver v0.26.0
        urls = ["https://github.com/mozilla/geckodriver/releases/download/v0.26.0/geckodriver-v0.26.0-linux64.tar.gz"],
    )
    ```

    For example, replace all occurrences of `0.26.0` with the newer version.

3. Update the `sha256` checksum of the driver archives.
    You can do this by downloading the artifacts from the URLs you just updated, and then running `shasum` on those files:
    ```sh
    curl -L <DRIVER_URL> | shasum -a 256
    ```
