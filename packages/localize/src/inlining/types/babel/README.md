# @babel/... external types

The Bazel `ts_library` rule does not understand how to map imports of the form `@babel/core` to
external typings of the form `@types/babel__core`. Note the double underscore to account for the
namespaced package.

See https://github.com/bazelbuild/rules_nodejs/issues/1033.

This folder is a workaround to this by copying the typings directly into the project. Once the
issue with `ts_library` is resolved we can remove this folder and add appropriate npm dependencies
for the typings