# Schematics for Bazel

Bazel builder for Angular CLI has been deprecated.

We believe that a lot of projects would benefit from directly using Bazel, the same way we do in Angular. Validating the experimental Bazel schematics for the Angular CLI for the past year as part of Angular Labs, we concluded that they don't implement the most optimal approach. In v10, we're deprecating `@angular/bazel` and encouraging developers to explore using Bazel directly following the [canonical example](https://github.com/bazelbuild/rules_nodejs/tree/master/examples/angular).

Using the Bazel builder, we abstracted the build file management and tooling orchestration, making Bazel invisible for developers.

Through this experiment, we found that wrapping Bazel into Angular CLI does currently not meet our expectation of providing a great experience to developers.


There are a few reasons we're taking this path:

1. Bazel ecosystem for the Web is still evolving at a rapid pace.
2. The introduction of the Angular Ivy compiler enables new ways to use Bazel in a faster
   and more efficient manner.
3. Feature parity with Webpack based Angular CLI is currently difficult to achieve without trade-offs that would not be acceptable for many Angular users.

For users who are currently using Bazel builder, there are a few migration
options.




## Migrate from `@angular/bazel`

For users who are currently using Bazel builder, there are a few migration options.

### Eject the build config

You could leave the Bazel files in your workspace, and manage them manually:

```
ng build --leaveBazelFilesOnDisk
```

If you're using Ivy, in your build files replace `ng_module` with the [`ng_ts_library`](https://github.com/bazelbuild/rules_nodejs/blob/master/examples/angular/tools/angular_ts_library.bzl) rule. This new rule leverages ngtsc plugin supported by `ts_library`, and it is much faster.

For the latest recommendations, please refer to the canonical Angular Bazel [repo](https://github.com/bazelbuild/rules_nodejs/tree/master/examples/angular).

## Angular CLI

If you'd like to revert to the default Angular CLI builder, you could restore
the original Angular config from backup by replacing `angular.json` with
`angular.json.bak`.
