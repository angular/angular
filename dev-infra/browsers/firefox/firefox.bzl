load("//dev-infra/browsers:platform_http_file.bzl", "platform_http_file")

"""
  Defines repositories for Firefox that can be used inside Karma unit tests
  and Protractor e2e tests with Bazel.
"""

def define_firefox_repositories():
    # Instructions on updating the Firefox version can be found in the `README.md` file
    # next to this file.

    platform_http_file(
        name = "org_mozilla_firefox_amd64",
        licenses = ["reciprocal"],  # MPL 2.0
        sha256 = "601e5a9a12ce680ecd82177c7887dae008d8f33690da43be1a690b76563cd992",
        # Firefox v84.0
        urls = ["https://ftp.mozilla.org/pub/firefox/releases/84.0/linux-x86_64/en-US/firefox-84.0.tar.bz2"],
    )

    platform_http_file(
        name = "org_mozilla_firefox_macos",
        licenses = ["reciprocal"],  # MPL 2.0
        sha256 = "4c7bca050eb228f4f6f93a9895af0a87473e03c67401d1d2f1ba907faf87fefd",
        # Firefox v84.0
        urls = ["https://ftp.mozilla.org/pub/firefox/releases/84.0/mac/en-US/Firefox%2084.0.dmg"],
    )

    platform_http_file(
        name = "org_mozilla_geckodriver_amd64",
        licenses = ["reciprocal"],  # MPL 2.0
        sha256 = "61bfc547a623d7305256611a81ecd24e6bf9dac555529ed6baeafcf8160900da",
        # Geckodriver v0.28.0
        urls = ["https://github.com/mozilla/geckodriver/releases/download/v0.28.0/geckodriver-v0.28.0-linux64.tar.gz"],
    )

    platform_http_file(
        name = "org_mozilla_geckodriver_macos",
        licenses = ["reciprocal"],  # MPL 2.0
        sha256 = "c288ff6db39adfd5eea0e25b4c3e71bfd9fb383eccf521cdd65f67ea78eb1761",
        # Geckodriver v0.28.0
        urls = ["https://github.com/mozilla/geckodriver/releases/download/v0.28.0/geckodriver-v0.28.0-macos.tar.gz"],
    )
