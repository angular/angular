load("@bazel_skylib//rules:write_file.bzl", "write_file")
load("//tools:defaults2.bzl", "js_test")

def module_test(name, npm_packages, skipped_entry_points = [], additional_deps = [], **kwargs):
    write_file(
        name = "%s_config" % name,
        out = "%s_config.json" % name,
        content = [json.encode({
            "packages": [pkg[1] for pkg in npm_packages.items()],
            "skipEntryPoints": skipped_entry_points,
        })],
    )

    js_test(
        name = "test",
        data = [
            ":%s_config" % name,
            "//integration/ng-modules-importability:test_lib",
        ] + additional_deps + [pkg[0] for pkg in npm_packages.items()],
        entry_point = "//integration/ng-modules-importability:index.mjs",
        fixed_args = ["$(rootpath :%s_config)" % name],
        **kwargs
    )
