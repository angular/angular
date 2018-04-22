# Copyright Google Inc. All Rights Reserved.
#
# Use of this source code is governed by an MIT-style license that can be
# found in the LICENSE file at https://angular.io/license

"""This test run protractor.
"""

# This does a deep import under //internal because of not wanting the wrapper macro 
# because it introduces an extra target_bin target.
load("@build_bazel_rules_nodejs//internal/node:node.bzl", "nodejs_test")

def protractor_test(name, configuration, server, deps, **kwargs):
  """This test allows running protractor tests.
  """
  all_data = deps + [configuration, server]
  all_data += [
    Label("//tools/protractor_test:lib"), 
  ]
  entry_point = "angular/tools/protractor_test/protractor_test_cli.js"

  nodejs_test(
      name = name,
      data = all_data,
      entry_point = entry_point,
      templated_args = [
        "$(location %s)" % configuration, 
        server,
      ],
      **kwargs
  )