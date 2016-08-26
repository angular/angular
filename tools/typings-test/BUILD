sh_test(
    name = "typings-test",
    srcs = ["test.sh"],
    data = ["//:all_packages"] + glob(["**"]),
    # This currently uses external npm, so we need an unsandboxed environment.
    # If your npm is not in the standard PATH, you will also need to pass the
    # flag --test_env=PATH to "bazel test".
    local = True,
    size = "small",
)
