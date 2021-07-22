load("//dev-infra/bazel/browsers:browser_archive_repo.bzl", "browser_archive")

"""
  Defines repositories for Chromium that can be used inside Karma unit tests
  and Protractor e2e tests with Bazel.
"""

def define_chromium_repositories():
    # To update to a newer version of Chromium see instructions in
    # https://github.com/angular/angular/blob/master/dev-infra/bazel/browsers/README.md.

    browser_archive(
        name = "org_chromium_chromium_amd64",
        licenses = ["notice"],  # BSD 3-clause (maybe more?)
        sha256 = "e2ce3260ad798151b88ee6ce53027533f0a596c311d960a514e82bf87c217ab3",
        # 93.0.4532.0
        urls = [
            "https://storage.googleapis.com/chromium-browser-snapshots/Linux_x64/888689/chrome-linux.zip",
            "https://storage.googleapis.com/dev-infra-mirror/chromium/888689/chrome-linux.zip",
        ],
        named_files = {
            "CHROMIUM": "chrome-linux/chrome",
        },
    )

    browser_archive(
        name = "org_chromium_chromium_macos",
        licenses = ["notice"],  # BSD 3-clause (maybe more?)
        sha256 = "46093b750f1efe5575bdb0a4dc8a229fbfaf5e1801f19c9480232c6ad3b35330",
        # 93.0.4532.0
        urls = [
            "https://storage.googleapis.com/chromium-browser-snapshots/Mac/888689/chrome-mac.zip",
            "https://storage.googleapis.com/dev-infra-mirror/chromium/888689/chrome-mac.zip",
        ],
        named_files = {
            "CHROMIUM": "chrome-mac/Chromium.app/Contents/MacOS/chromium",
        },
    )

    browser_archive(
        name = "org_chromium_chromium_windows",
        licenses = ["notice"],  # BSD 3-clause (maybe more?)
        sha256 = "27398cdf31bcb070e60f0339330c4ebd9ff44f62c76b55b39c2b329e0ce63f58",
        # 93.0.4532.0
        urls = [
            "https://storage.googleapis.com/chromium-browser-snapshots/Win/888689/chrome-win.zip",
            "https://storage.googleapis.com/dev-infra-mirror/chromium/888689/chrome-win.zip",
        ],
        named_files = {
            "CHROMIUM": "chrome-win/chrome.exe",
        },
    )

    browser_archive(
        name = "org_chromium_chromedriver_amd64",
        licenses = ["reciprocal"],  # BSD 3-clause, ICU, MPL 1.1, libpng (BSD/MIT-like), Academic Free License v. 2.0, BSD 2-clause, MIT
        sha256 = "f898364b4e237101748ef9bb6a44715b3840422270bdca25f0a98eba2eb8d732",
        urls = [
            "https://storage.googleapis.com/chromium-browser-snapshots/Linux_x64/888689/chromedriver_linux64.zip",
            "https://storage.googleapis.com/dev-infra-mirror/chromium/888689/chromedriver_linux64.zip",
        ],
        named_files = {
            "CHROMEDRIVER": "chromedriver_linux64/chromedriver",
        },
    )

    browser_archive(
        name = "org_chromium_chromedriver_macos",
        licenses = ["reciprocal"],  # BSD 3-clause, ICU, MPL 1.1, libpng (BSD/MIT-like), Academic Free License v. 2.0, BSD 2-clause, MIT
        sha256 = "c297fa1a3dccdf40cf4c7b67ca302eca135aac09a67dfddc57f25b93cea0835c",
        urls = [
            "https://storage.googleapis.com/chromium-browser-snapshots/Mac/888689/chromedriver_mac64.zip",
            "https://storage.googleapis.com/dev-infra-mirror/chromium/888689/chromedriver_mac64.zip",
        ],
        named_files = {
            "CHROMEDRIVER": "chromedriver_mac64/chromedriver",
        },
    )

    browser_archive(
        name = "org_chromium_chromedriver_windows",
        licenses = ["reciprocal"],  # BSD 3-clause, ICU, MPL 1.1, libpng (BSD/MIT-like), Academic Free License v. 2.0, BSD 2-clause, MIT
        sha256 = "2f2bd5f090f605797d81a50684daf9e84ffc5d049ca1341c3b9c3801daf37e86",
        urls = [
            "https://storage.googleapis.com/chromium-browser-snapshots/Win/888689/chromedriver_win32.zip",
            "https://storage.googleapis.com/dev-infra-mirror/chromium/888689/chromedriver_win32.zip",
        ],
        named_files = {
            "CHROMEDRIVER": "chromedriver_win32/chromedriver.exe",
        },
    )
