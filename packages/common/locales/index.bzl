load("@cldr_data//:index.bzl", _ALL_CLDR_LOCALES = "LOCALES")

# There are a couple of locales for which no data is present, even within the
# CLDR full tier packages. For these locales, we do not generate any data.
# TODO(devversion): Remove once we update to CLDR v39 where this problem no longer persists.
# Note that this worked before in the Gulp tooling without such an exclusion list because the
# `cldr-data-downloader` overwrote the `availableLocales` to only capture locales with data.
NO_DATA_LOCALES = [
    "ff-Adlm",
    "ff-Adlm-BF",
    "ff-Adlm-CM",
    "ff-Adlm-GH",
    "ff-Adlm-GM",
    "ff-Adlm-GW",
    "ff-Adlm-LR",
    "ff-Adlm-MR",
    "ff-Adlm-NE",
    "ff-Adlm-NG",
    "ff-Adlm-SL",
    "ff-Adlm-SN",
    "mai",
    "mni",
    "mni-Beng",
    "ms-ID",
    "pcm",
    "sat",
    "sat-Olck",
    "sd-Deva",
    "su",
    "su-Latn",
]

# List of locales the tool can generate files for.
LOCALES = [l for l in _ALL_CLDR_LOCALES if l not in NO_DATA_LOCALES]

# Labels resolving to the individual `generate-locale-tool` entry-points
GENERATE_LOCALES_TOOL_BIN = "//packages/common/locales/generate-locales-tool/bin"
GET_BASE_CURRENCIES_FILE_BIN = "%s:get-base-currencies-file" % GENERATE_LOCALES_TOOL_BIN
GET_BASE_LOCALE_FILE_BIN = "%s:get-base-locale-file" % GENERATE_LOCALES_TOOL_BIN
GET_CLOSURE_LOCALE_FILE_BIN = "%s:get-closure-locale-file" % GENERATE_LOCALES_TOOL_BIN
WRITE_LOCALE_FILES_TO_DIST_BIN = "%s:write-locale-files-to-dist" % GENERATE_LOCALES_TOOL_BIN

def _run_tool_with_single_output(name, output_file, tool, **kwargs):
    native.genrule(
        name = name,
        outs = [output_file],
        srcs = [],
        exec_tools = [tool],
        cmd = """$(location %s) > $@""" % tool,
        **kwargs
    )

def generate_base_currencies_file(name, output_file, **kwargs):
    _run_tool_with_single_output(
        name = name,
        output_file = output_file,
        tool = GET_BASE_CURRENCIES_FILE_BIN,
        **kwargs
    )

def generate_base_locale_file(name, output_file, **kwargs):
    _run_tool_with_single_output(
        name = name,
        output_file = output_file,
        tool = GET_BASE_LOCALE_FILE_BIN,
        **kwargs
    )

def generate_closure_locales_file(name, output_file, **kwargs):
    _run_tool_with_single_output(
        name = name,
        output_file = output_file,
        tool = GET_CLOSURE_LOCALE_FILE_BIN,
        **kwargs
    )

def generate_all_locale_files(name, **kwargs):
    locale_files = []

    for locale in LOCALES:
        locale_files += [
            "%s.ts" % locale,
            "global/%s.js" % locale,
            "extra/%s.ts" % locale,
        ]

    native.genrule(
        name = name,
        outs = locale_files,
        srcs = [],
        exec_tools = [WRITE_LOCALE_FILES_TO_DIST_BIN],
        cmd = """$(location %s) $(@D)""" % WRITE_LOCALE_FILES_TO_DIST_BIN,
        **kwargs
    )
