"""Used for angular.dev first-party package linking."""

load("@aspect_rules_js//npm:providers.bzl", "NpmPackageInfo")
load("@build_bazel_rules_nodejs//:providers.bzl", "LinkablePackageInfo")

def _ng_package_link_interop_impl(ctx):
    return [
        ctx.attr.package[DefaultInfo],
        ctx.attr.package[NpmPackageInfo],
        LinkablePackageInfo(
            package_name = ctx.attr.package_name,
            package_path = ctx.attr.package_path,
            path = ctx.files.package[0].path,
            files = ctx.attr.package[DefaultInfo].files,
        ),
    ]

ng_package_link_interop = rule(
    implementation = _ng_package_link_interop_impl,
    attrs = {
        "package": attr.label(mandatory = True),
        "package_name": attr.string(mandatory = True),
        "package_path": attr.string(mandatory = True),
    },
)
