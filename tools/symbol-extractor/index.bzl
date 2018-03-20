# Copyright Google Inc. All Rights Reserved.
#
# Use of this source code is governed by an MIT-style license that can be
# found in the LICENSE file at https://angular.io/license

"""This test verifies that a set of top level symbols from a javascript file match a gold file.
"""

load("@build_bazel_rules_nodejs//:defs.bzl", "nodejs_test")

def js_expected_symbol_test(name, src, golden, **kwargs):
  all_data = [src, golden]
  all_data += [Label("//tools/symbol-extractor:lib")]
  entry_point = "angular/tools/symbol-extractor/cli.js"

  nodejs_test(
      name = name,
      data = all_data,
      entry_point = entry_point,
      templated_args = ["$(location %s)" % src, "$(location %s)" % golden],
      **kwargs
  )
