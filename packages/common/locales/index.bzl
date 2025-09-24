load("@aspect_bazel_lib//lib:write_source_files.bzl", "write_source_file")
load("@cldr_json_data//:index.bzl", _ALL_CLDR_LOCALES = "LOCALES")
load("//tools:defaults.bzl", "js_run_binary")

# List of locales the tool can generate files for.
LOCALES = _ALL_CLDR_LOCALES

# Labels resolving to the individual `generate-locale-tool` entry-points
GENERATE_LOCALES_TOOL_BIN = "//packages/common/locales/generate-locales-tool/bin"
GET_BASE_CURRENCIES_FILE_BIN = "%s:get-base-currencies-file" % GENERATE_LOCALES_TOOL_BIN
GET_BASE_LOCALE_FILE_BIN = "%s:get-base-locale-file" % GENERATE_LOCALES_TOOL_BIN
GET_CLOSURE_LOCALE_FILE_BIN = "%s:get-closure-locale-file" % GENERATE_LOCALES_TOOL_BIN
WRITE_LOCALE_FILES_TO_DIST_BIN = "%s:write-locale-files-to-dist" % GENERATE_LOCALES_TOOL_BIN

def generate_base_currencies_file(name, src):
    js_run_binary(
        name = name + "_generated",
        outs = ["base_currencies_generated.ts"],
        tool = "//packages/common/locales/generate-locales-tool/bin:get-base-currencies-file",
        chdir = native.package_name(),
    )
    write_source_file(
        name = name,
        out_file = src,
        in_file = name + "_generated",
    )

def generate_base_locale_file(name, src):
    js_run_binary(
        name = name + "_generated",
        outs = ["base_locale_file.ts"],
        tool = "//packages/common/locales/generate-locales-tool/bin:get-base-locale-file",
        chdir = native.package_name(),
    )
    write_source_file(
        name = name,
        out_file = src,
        in_file = name + "_generated",
    )

def generate_closure_locale_file(name, src):
    js_run_binary(
        name = name + "_generated",
        outs = ["closure_locale_generated.ts"],
        tool = "//packages/common/locales/generate-locales-tool/bin:get-closure-locale-file",
        chdir = native.package_name(),
    )
    write_source_file(
        name = name,
        out_file = src,
        in_file = name + "_generated",
    )

def generate_all_locale_files(name):
    locale_files = []

    for locale in LOCALES:
        locale_files += [
            "%s.ts" % locale,
            "global/%s.js" % locale,
            "extra/%s.ts" % locale,
        ]

    js_run_binary(
        name = name,
        outs = locale_files,
        tool = "//packages/common/locales/generate-locales-tool/bin:write-locale-files-to-dist",
        chdir = native.package_name(),
    )
