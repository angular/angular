load("//dev-infra/bazel/browsers:browser_archive_repo.bzl", "browser_archive")

"""
  Defines repositories for Firefox that can be used inside Karma unit tests
  and Protractor e2e tests with Bazel.
"""

def define_firefox_repositories():
    # Instructions on updating the Firefox version can be found in the `README.md` file
    # next to this file.

    browser_archive(
        name = "org_mozilla_firefox_amd64",
        licenses = ["reciprocal"],  # MPL 2.0
        sha256 = "998607f028043b3780f296eee03027279ef059acab5b50f9754df2bd69ca42b3",
        # Firefox v90.0.1
        urls = [
            "https://ftp.mozilla.org/pub/firefox/releases/90.0.1/linux-x86_64/en-US/firefox-90.0.1.tar.bz2",
            "https://storage.googleapis.com/dev-infra-mirror/mozilla/firefox/firefox-90.0.1.tar.bz2",
        ],
        named_files = {
            "FIREFOX": "firefox/firefox",
        },
    )

    browser_archive(
        name = "org_mozilla_firefox_macos",
        licenses = ["reciprocal"],  # MPL 2.0
        sha256 = "76c1b9c42b52c7e5be4c112a98b7d3762a18841367f778a179679ac0de751f05",
        # Firefox v90.0.1
        urls = [
            "https://ftp.mozilla.org/pub/firefox/releases/90.0.1/mac/en-US/Firefox%2090.0.1.dmg",
            "https://storage.googleapis.com/dev-infra-mirror/mozilla/firefox/Firefox%2090.0.1.dmg",
        ],
        named_files = {
            "FIREFOX": "Firefox.app/Contents/MacOS/firefox",
        },
    )

    browser_archive(
        name = "org_mozilla_geckodriver_amd64",
        licenses = ["reciprocal"],  # MPL 2.0
        sha256 = "ec164910a3de7eec71e596bd2a1814ae27ba4c9d112b611680a6470dbe2ce27b",
        # Geckodriver v0.29.1
        urls = [
            "https://github.com/mozilla/geckodriver/releases/download/v0.29.1/geckodriver-v0.29.1-linux64.tar.gz",
            "https://storage.googleapis.com/dev-infra-mirror/mozilla/geckodriver/0.29.1/geckodriver-v0.29.1-linux64.tar.gz",
        ],
        named_files = {
            "GECKODRIVER": "geckodriver",
        },
    )

    browser_archive(
        name = "org_mozilla_geckodriver_macos",
        licenses = ["reciprocal"],  # MPL 2.0
        sha256 = "9929c804ad0157ca13fdafca808866c88815b658e7059280a9f08f7e70364963",
        # Geckodriver v0.29.1
        urls = [
            "https://github.com/mozilla/geckodriver/releases/download/v0.29.1/geckodriver-v0.29.1-macos.tar.gz",
            "https://storage.googleapis.com/dev-infra-mirror/mozilla/geckodriver/0.29.1/geckodriver-v0.29.1-macos.tar.gz",
        ],
        named_files = {
            "GECKODRIVER": "geckodriver",
        },
    )
