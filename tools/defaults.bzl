"""Re-export of some bazel rules with repository-wide defaults."""
load("@build_bazel_rules_typescript//:defs.bzl", _ts_library = "ts_library")
load("//packages/bazel:index.bzl", _ng_module = "ng_module", _ng_package = "ng_package")

DEFAULT_TSCONFIG = "//packages:tsconfig-build.json"

def ts_library(tsconfig = None, **kwargs):
  if not tsconfig:
    tsconfig = DEFAULT_TSCONFIG
  _ts_library(tsconfig = tsconfig, **kwargs)

def ng_module(name, tsconfig = None, entry_point = None, **kwargs):
  if not tsconfig:
    tsconfig = DEFAULT_TSCONFIG
  if not entry_point:
    entry_point = "public_api.ts"
  _ng_module(name = name, tsconfig = tsconfig, entry_point = entry_point, **kwargs)

def ng_package(name, readme_md = None, license_banner = None, stamp_data = None, **kwargs):
  if not readme_md:
    readme_md = "//packages:README.md"
  if not license_banner:
    license_banner = "//packages:license-banner.txt"
  if not stamp_data:
    stamp_data = "//tools:stamp_data"

  _ng_package(
      name = name,
      readme_md = readme_md,
      license_banner = license_banner,
      stamp_data = stamp_data,
      **kwargs)
