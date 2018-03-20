"""Re-export of some bazel rules with repository-wide defaults."""
load("@build_bazel_rules_nodejs//:defs.bzl", _npm_package = "npm_package")
load("@build_bazel_rules_typescript//:defs.bzl", _ts_library = "ts_library", _ts_web_test = "ts_web_test")
load("//packages/bazel:index.bzl", _ng_module = "ng_module", _ng_package = "ng_package")
load("//packages/bazel/src:ng_module.bzl", _ivy_ng_module = "internal_ivy_ng_module")

DEFAULT_TSCONFIG = "//packages:tsconfig-build.json"

# Packages which are versioned together on npm
ANGULAR_SCOPED_PACKAGES = ["@angular/%s" % p for p in [
  "bazel",
  "core",
  "common",
  "compiler",
  "compiler-cli",
  "animations",
  "platform-browser",
  "platform-browser-dynamic",
  "forms",
  "http",
  "platform-server",
  "platform-webworker",
  "platform-webworker-dynamic",
  "upgrade",
  "router",
  "language-service",
  "service-worker",
]]

PKG_GROUP_REPLACEMENTS = {
    "\"NG_UPDATE_PACKAGE_GROUP\"": """[
      %s
    ]""" % ",\n      ".join(["\"%s\"" % s for s in ANGULAR_SCOPED_PACKAGES])
}

def ts_library(tsconfig = None, **kwargs):
  if not tsconfig:
    tsconfig = DEFAULT_TSCONFIG
  _ts_library(tsconfig = tsconfig, **kwargs)

def ng_module(name, tsconfig = None, entry_point = None, **kwargs):
  if not tsconfig:
    tsconfig = DEFAULT_TSCONFIG
  if not entry_point:
    entry_point = "public_api.ts"
  _ng_module(name = name, flat_module_out_file = name, tsconfig = tsconfig, entry_point = entry_point, **kwargs)

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
      replacements = PKG_GROUP_REPLACEMENTS,
      **kwargs)

def npm_package(name, replacements = {}, **kwargs):
  _npm_package(
      name = name,
      stamp_data = "//tools:stamp_data",
      replacements = dict(replacements, **PKG_GROUP_REPLACEMENTS),
      **kwargs)

def ts_web_test(bootstrap = [], deps = [], **kwargs):
  if not bootstrap:
    bootstrap = ["//:web_test_bootstrap_scripts"]
  local_deps = [
    "//:node_modules/tslib/tslib.js",
    "//tools/testing:browser",
  ] + deps

  _ts_web_test(
      bootstrap = bootstrap,
      deps = local_deps,
      **kwargs)

def ivy_ng_module(name, tsconfig = None, **kwargs):
  if not tsconfig:
    tsconfig = DEFAULT_TSCONFIG
  _ivy_ng_module(name = name, tsconfig = tsconfig, **kwargs)
