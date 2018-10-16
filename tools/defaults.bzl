# Re-export of Bazel rules with repository-wide defaults

load("@angular//:index.bzl", _ng_module = "ng_module")
load("@build_bazel_rules_nodejs//:defs.bzl", _jasmine_node_test = "jasmine_node_test")
load("@build_bazel_rules_typescript//:defs.bzl", _ts_library = "ts_library",
  _ts_web_test_suite = "ts_web_test_suite")

DEFAULT_TSCONFIG_BUILD = "//src:bazel-tsconfig-build.json"
DEFAULT_TSCONFIG_TEST = "//src:bazel-tsconfig-test.json"

def _getDefaultTsConfig(testonly):
  if testonly:
    return DEFAULT_TSCONFIG_TEST
  else:
    return DEFAULT_TSCONFIG_BUILD

def ts_library(tsconfig = None, testonly = False, **kwargs):
  if not tsconfig:
    tsconfig = _getDefaultTsConfig(testonly)

  _ts_library(
    tsconfig = tsconfig,
    testonly = testonly,
    **kwargs
  )

def ng_module(deps = [], tsconfig = None, testonly = False, **kwargs):
  if not tsconfig:
    tsconfig = _getDefaultTsConfig(testonly)

  local_deps = [
    # Since we use the TypeScript import helpers (tslib) for each TypeScript configuration,
    # we declare TSLib as default dependency
    "@npm//tslib",
  ] + deps

  _ng_module(
    deps = local_deps,
    tsconfig = tsconfig,
    testonly = testonly,
    **kwargs
  )

def jasmine_node_test(deps = [], **kwargs):
  local_deps = [
    # Workaround for: https://github.com/bazelbuild/rules_nodejs/issues/344
    "@npm//jasmine",
    "@npm//source-map-support",
  ] + deps

  _jasmine_node_test(
    deps = local_deps,
    **kwargs
  )

def ng_test_library(deps = [], tsconfig = None, **kwargs):
  local_deps = [
    # We declare "@angular/core" and "@angular/core/testing" as default dependencies because
    # all Angular component unit tests use the `TestBed` and `Component` exports.
    "@angular//packages/core",
    "@angular//packages/core/testing",
    "@npm//@types/jasmine",
  ] + deps;

  ts_library(
    testonly = 1,
    deps = local_deps,
    **kwargs
  )

def ng_web_test_suite(deps = [], srcs = [], static_css = [], **kwargs):
  # Workaround for https://github.com/bazelbuild/rules_typescript/issues/301
  # Since some of our tests depend on CSS files which are not part of the `ng_module` rule,
  # we need to somehow load static CSS files within Karma (e.g. overlay prebuilt). Those styles
  # are required for successful test runs. Since the `ts_web_test_suite` rule currently only
  # allows JS files to be included and served within Karma, we need to create a JS file that
  # loads the given CSS file.
  for css_label in static_css:
    css_id = "static-css-file-%s" % (css_label.strip(':').strip('/'))
    deps += [":%s" % css_id]

    native.genrule(
      name = css_id,
      srcs = [css_label],
      outs = ["%s.js" % css_id],
      output_to_bindir = True,
      cmd = """
        files=($(locations %s))
        css_content=$$(cat $${files[0]})
        js_template="var cssElement = document.createElement('style'); \
                    cssElement.type = 'text/css'; \
                    cssElement.innerHTML = '$$css_content'; \
                    document.head.appendChild(cssElement);"

         echo $$js_template > $@
      """ % css_label
    )

  _ts_web_test_suite(
    # Required for running the compiled ng modules that use TypeScript import helpers.
    srcs = ["@npm//node_modules/tslib:tslib.js"] + srcs,
    # Depend on our custom test initialization script. This needs to be the first dependency.
    deps = ["//test:angular_test_init"] + deps,
    bootstrap = [
      "@npm//node_modules/zone.js:dist/zone-testing-bundle.js",
      "@npm//node_modules/reflect-metadata:Reflect.js",
    ],
    **kwargs
  )
