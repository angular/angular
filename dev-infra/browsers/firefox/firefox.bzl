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
        sha256 = "bde6e020556a21561e4b8d7aaecf8db7077951f179b98ca5d0305435bc6802c9",
        # Firefox v78.0
        urls = ["https://ftp.mozilla.org/pub/firefox/releases/78.0/linux-x86_64/en-US/firefox-78.0.tar.bz2"],
    )

    platform_http_file(
        name = "org_mozilla_firefox_macos",
        licenses = ["reciprocal"],  # MPL 2.0
        sha256 = "69a0ae139814cc314d0c5e3fd3859e0ac9de8517550d7d32b06c57022a14f49e",
        # Firefox v78.0
        urls = ["https://ftp.mozilla.org/pub/firefox/releases/78.0/mac/en-US/Firefox%2078.0.dmg"],
    )

    platform_http_file(
        name = "org_mozilla_geckodriver_amd64",
        licenses = ["reciprocal"],  # MPL 2.0
        sha256 = "d59ca434d8e41ec1e30dd7707b0c95171dd6d16056fb6db9c978449ad8b93cc0",
        # Geckodriver v0.26.0
        urls = ["https://github.com/mozilla/geckodriver/releases/download/v0.26.0/geckodriver-v0.26.0-linux64.tar.gz"],
    )

    platform_http_file(
        name = "org_mozilla_geckodriver_macos",
        licenses = ["reciprocal"],  # MPL 2.0
        sha256 = "4739ef8f8af5d89bd4a8015788b4dc45c2f5f16b2fdc001254c9a92fe7261947",
        # Geckodriver v0.26.0
        urls = ["https://github.com/mozilla/geckodriver/releases/download/v0.26.0/geckodriver-v0.26.0-macos.tar.gz"],
    )
