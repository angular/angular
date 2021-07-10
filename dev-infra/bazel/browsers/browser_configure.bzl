load("@io_bazel_rules_webtesting//web/internal:metadata.bzl", "metadata")
load("@io_bazel_rules_webtesting//web/internal:provider.bzl", "WebTestInfo")

"""Converts the specified label to a manifest path"""

def _label_to_manifest_path(label):
    if label.package != "":
        return "%s/%s" % (label.workspace_name, label.package)
    return label.workspace_name

"""Implementation of the `browser_configure` rule."""

def _browser_configure_impl(ctx):
    named_files = {}
    base_dir = _label_to_manifest_path(ctx.label)

    # Update the named files to manifest paths that can be resolved
    # with Bazel runfile resolution in web tests.
    for n, p in ctx.attr.named_files.items():
        named_files[n] = base_dir + "/" + p

    # Create a web test metadata file that will be provided as part of
    # the `WebTestInfo` provider.
    metadata.create_file(
        ctx = ctx,
        output = ctx.outputs.web_test_metadata,
        web_test_files = [
            metadata.web_test_files(ctx = ctx, named_files = named_files),
        ],
    )

    return [
        DefaultInfo(runfiles = ctx.runfiles(files = ctx.files.files)),
        WebTestInfo(metadata = ctx.outputs.web_test_metadata),
    ]

"""
  Rule that is used in combination with the `browser_archive` rule. It captures a set
  of files which are needed for dealing with a browser. Additionally, specific files
  for the browser can be denoted with an unique name so that web tests can access browser
  files in a platform-agnostic way, regardless of which browser repository is selected.

  The specified browser files are exposed as runfiles of the target defined through this
  rule. The unique names with their associated files are captured within a metadata file
  that is exposed through a `WebTestInfo` provider. Web tests will be able to deal with
  this metadata file to resolve browser files in a platform-agnostic way.

  More details on this can be found in the `browser_archive` rule.
"""
browser_configure = rule(
    attrs = {
        "files": attr.label_list(
            mandatory = True,
            allow_files = True,
            doc = "List of files which are needed for the browser.",
        ),
        "named_files": attr.string_dict(
            doc = """
              Dictionary that maps files to unique identifiers. This is useful
              if browser archives are different on different platforms and the web
              tests would not want to care about archive-specific paths. e.g. targets
              expect a `CHROMIUM` key to point to the Chromium browser binary.
            """,
            mandatory = True,
        ),
    },
    outputs = {"web_test_metadata": "%{name}.gen.json"},
    implementation = _browser_configure_impl,
)
