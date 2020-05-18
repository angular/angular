# Schematics for Bazel

Bazel builder for Angular CLI has been deprecated.

**tl;dr: We have deprecated the the Bazel builder and schematics for Angular CLI. As of Angular v10 we removed the ability to call `ng add @angular/bazel` to convert existing Angular CLI projects to use Bazel. We believe that some Angular projects can greatly benefit from using Bazel - these projects should use Bazel Web directly as documented in the [canonical example in the Bazel Web repo](https://github.com/bazelbuild/rules_nodejs/tree/master/examples/angular).**

The schematics for Bazel builder have been in Angular Labs for some time. Via labs we have been able to experiment with wrapping Bazel into the CLI and make it's use in the CLI invisible to developers using Angular CLI.

Through this experiment we, the Angular team have found that wrapping Bazel into Angular CLI does currently not meet our expectation of providing a great experience to developers using Angular.


There are multiple factors:

1. Bazel ecosystem for the Web is still evolving at a rapid pace.
2. The introduction of the Angular Ivy compiler enables new ways to use Bazel in a faster
   and more efficient manner.
3. Feature parity with Webpack based Angular CLI is currently difficult to achieve without trade offs that would not be acceptable for many Angular users.

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
