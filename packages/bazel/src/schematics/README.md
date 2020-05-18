# Schematics for Bazel

Bazel builder for Angular CLI has been deprecated.

The schematics for Bazel builder have been in Angular Labs for some time,
but over the course of its evaluation the Angular team has found that they did
not meet our expectation of providing a smooth experience to get users onboard.

There are multiple factors:

1. Bazel ecosystem for Javascript is still evolving at a rapid pace.
2. The introduction of Ivy compiler enables new ways to use Bazel in a faster
   and more efficient manner.
3. Feature parity with Angular CLI is difficult to achieve.

For users who are currently using Bazel builder, there are a few migration
options.

## View Engine

If your application is using View Engine, you could leave the Bazel files
in your workspace, and manage them manually.

```
ng build --leaveBazelFilesOnDisk
```

## Ivy

If your application is using Ivy, you should also leave the Bazel files on disk.

```
ng build --leaveBazelFilesOnDisk
```

Once that is done, switch to using the latest [`ng_ts_library`](https://github.com/bazelbuild/rules_nodejs/blob/master/examples/angular/tools/angular_ts_library.bzl) rule.
This new rule leverages ngtsc plugin supported by `ts_library`, and it is much
faster.

For the latest recommendations, please refer to the canonical Angular Bazel [repo](https://github.com/bazelbuild/rules_nodejs/tree/master/examples/angular).

## Angular CLI

If you'd like to revert to the default Angular CLI builder, you could restore
the original Angular config from backup by replacing `angular.json` with
`angular.json.bak`.
