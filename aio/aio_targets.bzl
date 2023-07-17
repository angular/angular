load("@aio_npm//@angular-devkit/architect-cli:index.bzl", "architect_test")

def aio_test(name, data, args, **kwargs):
    architect_test(
        name = name,
        args = args,
        chdir = native.package_name(),
        data = data,
        env = {
            "CHROME_BIN": "../$(CHROMIUM)",
        },
        toolchains = [
            "@aio_npm//@angular/build-tooling/bazel/browsers/chromium:toolchain_alias",
        ],
        **kwargs
    )
