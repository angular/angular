# Browser configuration and versioning for testing of Angular

Within the Angular organization, we use Chrome and Firefox to perform most of the local testing, and rely on Sauce Labs and BrowserStack to do cross-browser testing on our CI.

The version of Chrome used in tests within this monorepo is configured and controlled via Bazel and `puppeteer`.
We manually keep the configuration of these two tools in sync to create a consistent testing environment across unit, e2e, and integration tests.

## Bazel

Bazel `karma_web_test_suite` and `protractor_web_test_suite` targets will use Chromium or Firefox provisioned by `//dev-infra/bazel/browsers`.
The version of Chrome and Firefox are specified in the `chromium.bzl` and `firefox.bzl` files in `/dev-infra/bazel/browsers`.

The process of updating the Chrome or Firefox version is not straightforward, but below are dedicated sections for each browser.

## Updating Chromium

1. Run `yarn ts-node dev-infra/bazel/browsers/chromium/find-stable-revision-for-all-platforms.ts`

2. Inspect the console output which looks like the followed:

```
Release Info: https://storage.googleapis.com/chromium-find-releases-static/index.html#r885453
Click on the link above to determine the Chromium version number.

MAC:       https://storage.googleapis.com/chromium-browser-snapshots/Mac/885453/chrome-mac.zip
                0c7ed37b2128c992d5563a5b54d2c2790ce4872d2004b298ca073c7db4cc3f58
           https://storage.googleapis.com/chromium-browser-snapshots/Mac/885453/chromedriver_mac64.zip
                fc5150742c045b12ec0a138365b87be3d4216a52bf6b65c914325e941a3c8af7

WINDOWS:   https://storage.googleapis.com/chromium-browser-snapshots/Win/885453/chrome-win.zip
                2a78bc9331a9fd7d1153e9e87cad85948853d4e37427d053dc88887ac9774a69
           https://storage.googleapis.com/chromium-browser-snapshots/Win/885453/chromedriver_win32.zip
                bdde7e7aa6349dd0e6e185c07c2fdef4a8f60739eacd79ee49c175390231be20

LINUX:     https://storage.googleapis.com/chromium-browser-snapshots/Linux_x64/885453/chrome-linux.zip
                ac5d11ff66698cb29ece33f8a38de011d2384c609123f421b771aafeea87f679
           https://storage.googleapis.com/chromium-browser-snapshots/Linux_x64/885453/chromedriver_linux64.zip
                aa38374059252bb7896d79ac7bb4b3ee3eca84cfa5641f432e05bba5f04c01a2

```

3. Click on the `Release Info` URL and update version number comments in the `chromium.bzl` file so
   that it is easier to figure out which version of Chromium is configured.

4. Update the `chromium` and `chromedriver` repository URLs for all platforms to use the
   new URLs printed out by the tool. Also make sure to update the SHA256 checksums. The tool prints the
   new checksums for convenient copy & paste.

5. [Upload artifacts to our Google Cloud Storage mirror.](#uploading-mirror-artifacts)


## Puppeteer

1. Visit https://github.com/puppeteer/puppeteer/blob/master/docs/api.md to determine which version of puppeteer corresponds to the version of Chrome desired.

2. Visit https://chromedriver.chromium.org/downloads to determine which version of ChromeDriver should be used for the version of Chrome desired.

    > NOTE:
    > The version of Chrome does not necessarily correspond exactly with the version of ChromeDriver.
    > For example, you might have to use ChromeDriver v87.0.4280.x to drive Chrome v87.0.4272.x.

3. Update `scripts/puppeteer-chromedriver-versions.js` to include an entry with the new version of puppeteer as key and the new version of ChromeDriver as value (as determined in the two previous steps).

4. Update all of the puppeteer versions throughout the repo:

    * `package.json`
    * `aio/package.json`
    * `aio/tools/examples/shared/package.json`

    ...and their corresponding `yarn.lock` files.

## Firefox

In order to update Firefox, open the `dev-infra/bazel/browsers/firefox/firefox.bzl` file and update the repository URLs to the desired version.
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

3. [Upload artifacts to our Google Cloud Storage mirror.](#uploading-mirror-artifacts)


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

4. [Upload artifacts to our Google Cloud Storage mirror.](#uploading-mirror-artifacts)
   

## Uploading mirror artifacts

1. Download all the artifacts you want to mirror, and upload the artifacts to the
   `dev-infra-mirror` cloud storage bucket (which serves as a fallback mirror to help with reducing flakiness).

   Note: The `dev-infra-mirror` bucket is part of the team-internal `internal-200822` GCP instance. If you do not
   have permission to update, please contact a member of the Angular dev-infra team

2. Update the permissions for all uploaded artifacts so that they can be accessed publicly. This can be
   done by clicking on an uploaded file, then going to `Edit Permissions`. Within the permission dialog
   you can then add another entity for `Public` with the `allUsers` name, and `Reader` access.  

3. Update the fallback `dev-infra-mirror` URLs for your browser archives to point to the newly
   uploaded files. 