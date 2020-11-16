# Schematics for Bazel

Bazel builder for Angular CLI has been deprecated in version 10.

We believe that a lot of projects would benefit from using Bazel, the same way
we do in the Angular repository. We still believe that is true in many cases.
However, after experimenting with Bazel schematics for Angular CLI in
Angular Labs for the past year, we concluded that invoking Bazel from within
CLI is not the best approach to encourage adoption of the technology.
Instead, we recommend developers to explore using Bazel directly, and refer to
the canonical example [repository](https://github.com/bazelbuild/rules_nodejs/tree/master/examples/angular)
for latest updates and best practices.

In the beginning of this project, we thought it would make Bazel easier for
users to adopt if we abstracted the BUILD files management and tooling
orchestration within Angular CLI. However, we have come to realize that such
abstraction does not encourage users to use Bazel to its full potential.

There are a few other reasons for this deprecation:

1. Bazel ecosystem for the Web is still evolving at a rapid pace.
2. The introduction of the Angular Ivy compiler enables new ways to use Bazel
   in a faster and more efficient manner (see below).
3. Feature parity with Webpack-based Angular CLI is difficult to achieve without
   trade-offs that would not be acceptable for many Angular users.  
   There is currently a [prototype](https://github.com/bazelbuild/rules_nodejs/tree/master/examples/angular_bazel_architect)
   that showcases how multiple architects within CLI could be orchestrated by Bazel.

## Migrate from `@angular/bazel`

For users who are currently using Bazel builder, there are a few migration options.

### Eject the BUILD files

You could leave the Bazel files in your workspace, and manage them manually:

```
ng build --leaveBazelFilesOnDisk
```

If you're using Ivy, in your BUILD files replace `ng_module` with the
[`ng_ts_library`](https://github.com/bazelbuild/rules_nodejs/blob/master/examples/angular/tools/angular_ts_library.bzl)
rule.
This new rule leverages ngtsc plugin supported by `ts_library`, and it is much faster.

For the latest recommendations, please refer to the canonical Angular Bazel [repo](https://github.com/bazelbuild/rules_nodejs/tree/master/examples/angular).

For questions, please ask in the `#angular` channel in https://slack.bazel.build/.

## Angular CLI

If you'd like to revert to the default Angular CLI builder, you could restore
the original Angular config from backup by replacing `angular.json` with
`angular.json.bak`.

## External Resources

1. Angular ❤️ Bazel leaving Angular Labs  
   https://dev.to/bazel/angular-bazel-leaving-angular-labs-51ja
