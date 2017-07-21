# ngc-wrapped

This is a wrapper around @angular/compiler-cli that makes ngc run under Bazel.
It should be identical to https://github.com/bazelbuild/rules_angular/tree/master/internal/ngc
however that is built against Angular packages from npm, while ngc-wrapped is
built using Bazel against Angular at HEAD.
