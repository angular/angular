## Publishing

The `@angular/benchpress` package is not published together with the framework and therefore
the `npm_package` Bazel target does not have the `release-with-framework` tag.

In order to publish this package manually, one can run the following command after bumping
the `version` in the `package.json` of this package:

```
yarn bazel run //packages/benchpress:npm_package.publish
```