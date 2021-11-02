def _cldr_data_repository_impl(ctx):
    for url, sha256 in ctx.attr.urls.items():
        ctx.report_progress("Downloading CLDR data from: %s" % url)
        ctx.download_and_extract(
            url = url,
            sha256 = sha256,
        )

    ctx.report_progress("Extracting available locales from: %s" % ctx.attr.available_locales_path)
    locales_json = ctx.read(ctx.attr.available_locales_path)
    locales = json.decode(locales_json)["availableLocales"]["full"]
    ctx.report_progress("Extracted %s locales from CLDR" % len(locales))

    ctx.file("index.bzl", content = """
LOCALES=%s
  """ % locales)

    ctx.file("BUILD.bazel", content = """
filegroup(
  name = "all_json",
  srcs = glob(["**/*.json"]),
  visibility = ["//visibility:public"],
)
  """)

"""
  Repository rule that downloads CLDR data from the specified repository and generates a
  `BUILD.bazel` file that exposes all data files. Additionally, an `index.bzl` file is generated
  that exposes a constant for all locales the repository contains data for. This can be used to
  generate pre-declared outputs.
"""
cldr_data_repository = repository_rule(
    implementation = _cldr_data_repository_impl,
    attrs = {
        "urls": attr.string_dict(doc = """
           Dictionary of URLs that resolve to archives containing CLDR JSON data. These archives
           will be downloaded and extracted at root of the repository. Each key can specify
           a SHA256 checksum for hermetic builds.
        """, mandatory = True),
        "available_locales_path": attr.string(
            doc = """
              Relative path to the JSON data file describing all available locales.
              This file usually resides within the `cldr-core` package
            """,
            default = "cldr-core/availableLocales.json",
        ),
    },
)
