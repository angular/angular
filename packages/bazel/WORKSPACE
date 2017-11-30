# By convention, the name should "describe the project in reverse-DNS form"
# https://docs.bazel.build/versions/master/be/functions.html#workspace
# But if we use "io_angular" then the loads used in BUILD files will
# be unfamiliar to Angular users who import from '@angular/pkg' in
# TypeScript files. We want to reduce the impedance between the Bazel
# and node naming schemes.
# We take the name "angular" so that users can write
# load("@angular//:index.bzl", "ng_module")
workspace(name = "angular")
