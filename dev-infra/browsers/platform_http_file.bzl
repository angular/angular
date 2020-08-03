load(
    "@io_bazel_rules_webtesting//web/internal:platform_http_file.bzl",
    _platform_http_file = "platform_http_file",
)

def platform_http_file(name, licenses, sha256, urls):
    """Platform specific browser repository.

    This works around a deficiency in io_bazel_rules_webtesting platform_http_file in that
    it selects the platform when the repository rule is executed. This limits browsers
    tests to run on the local user platform only. For cross-platform RBE we want a repository
    to be defined per platform so the correct one can be selected.
    """

    _platform_http_file(
        name = name,
        amd64_sha256 = sha256,
        amd64_urls = urls,
        licenses = licenses,
        macos_sha256 = sha256,
        macos_urls = urls,
        windows_sha256 = sha256,
        windows_urls = urls,
    )
