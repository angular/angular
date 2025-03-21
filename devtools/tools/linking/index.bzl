load("@build_bazel_rules_nodejs//:index.bzl", "npm_package_bin")
load("//devtools/tools/linking:linker_mapping.bzl", "linker_mapping")

def link_package(name, package_name, npm_package):
    npm_package_bin(
        name = "%s_package_out" % name,
        data = [npm_package],
        args = ["./external/npm/node_modules/%s" % package_name, "$(@D)"],
        output_dir = True,
        tool = "//devtools/tools/linking:linker_bin",
    )

    linker_mapping(
        name = name,
        srcs = [":%s_package_out" % name],
        package = npm_package,
        module_name = package_name,
        subpath = "./%s_package_out" % name,
    )
