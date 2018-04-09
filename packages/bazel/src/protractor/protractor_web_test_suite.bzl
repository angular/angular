# Copyright Google Inc. All Rights Reserved.
#
# Use of this source code is governed by an MIT-style license that can be
# found in the LICENSE file at https://angular.io/license
"""Implementation of the protractor_web_test_suite rule.
"""

load("@io_bazel_rules_webtesting//web:web.bzl", "web_test_suite")
load("@build_bazel_rules_nodejs//:defs.bzl", "nodejs_binary")
load("@build_bazel_rules_nodejs//internal/common:sources_aspect.bzl", "sources_aspect")
load("@build_bazel_rules_nodejs//internal/common:module_mappings.bzl", "module_mappings_runtime_aspect")

def _modify_tsconfig_impl(ctx):
  spec_file_import_paths = []
  for dep in ctx.attr.deps:
    # For each transitive ES5 dependency, grab the short path
    for f in dep.node_sources.to_list():
      spec_file_import_paths.append("\"{workspace}/{path}\"".format(workspace=ctx.workspace_name, path=f.short_path))

  ctx.actions.expand_template(
    template = ctx.file._conf_templ,
    output = ctx.outputs._modified_conf,
    substitutions = {
      "BASE_CONF_IMPORT_PATH": "{workspace}/{path}".format(workspace=ctx.workspace_name, path=ctx.file.base_conf.short_path),
      "SPEC_FILE_IMPORT_PATHS": ',\n    '.join(spec_file_import_paths),
    })

_modify_conf = rule(
  attrs = {
    "base_conf": attr.label(
      doc = """conf.js file used to configure protractor.""",
      allow_single_file = True,
      cfg = "data",
      aspects = [
        sources_aspect,
        module_mappings_runtime_aspect,
      ],
    ),
    "deps": attr.label_list(
      doc = """Spec and page files used for testing.""",
      allow_files = True,
      cfg = "data",
      aspects = [
        sources_aspect,
        module_mappings_runtime_aspect,
      ],
    ),
    "_conf_templ": attr.label(
      allow_files = True,
      single_file = True,
      default = Label("@angular//packages/bazel/src/protractor:conf.js.tmpl"),
    ),
  },
  outputs = {
    "_modified_conf": "%{name}.conf.js",
  },
  implementation = _modify_tsconfig_impl,
)

def protractor_web_test_suite(name, conf, deps, data = [], **kwargs):
  """Runs protractor using the passed conf.js file and tests listed within deps.

  Args:
    name: The name of the web_test_suite rule the macro expands into.
    conf: A conf.js file to be used as a base template. The following fields of the base
      config are overridden:
        framework
        seleniumAddress
        specs
        capabilities
    deps: A list of dependencies containing the test files to run within protractor.
    data: Any runtime files which are needed to run the test suite.
    **kwargs: Any other arguements are passed directory to the expanded web_test_suite rule.

  Returns:
    This macro expands into a web_test_suite rule which runs the protractor tests.
  """

  _modify_conf_name = "%s_modify_conf" % name
  _modify_conf(
    name = _modify_conf_name,
    base_conf = conf,
    deps = deps,
    testonly = True,
  )

  _modified_conf = "%s.conf.js" % _modify_conf_name

  _protractor_runner_name = name + "_protractor_runner"
  nodejs_binary(
    name = _protractor_runner_name,
    entry_point = "angular/packages/bazel/src/protractor/protractor_runner.js",
    data = data + deps + [_modified_conf, "@angular//packages/bazel/src/protractor:protractor_runner.js"],
    templated_args = ["$(location :%s)" % _modified_conf],
    tags = ["manual"],
    testonly = True,
  )

  web_test_suite(
    name = name,
    # TODO: Allow users to specify more browsers. Currently conf.js is hardcoded for chrome.
    browsers = ["@io_bazel_rules_webtesting//browsers:chromium-local"],
    data = data + deps + [conf, _modified_conf],
    test = ":%s_bin" % _protractor_runner_name,
    testonly = True,
    **kwargs
  )
