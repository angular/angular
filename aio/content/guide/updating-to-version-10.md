# Updating to Angular version 10

This guide contains information related to updating to version 10 of Angular.

<div class="alert is-helpful">

For information on upgrading to Angular version 9, see [Updating to Angular version 9](https://v9.angular.io/guide/updating-to-version-9).

</div>

## Updating CLI Apps

For step-by-step instructions on how to update to the latest Angular release (and leverage our automated migration tools to do so), use the interactive update guide at [update.angular.io](https://update.angular.io).

If you're curious about the specific migrations being run by the CLI, see the [automated migrations section](#migrations) for details on what code is changing and why.

## Changes and Deprecations in Version 10

<div class="alert is-helpful">

   For information about Angular's deprecation and removal practices, see [Angular Release Practices](guide/releases#deprecation-practices "Angular Release Practices: Deprecation practices").

</div>

{@a breaking-changes}
### New Breaking Changes

* Typescript 3.6, 3.7, and 3.8 are no longer supported. Please update to Typescript 3.9.
* Input fields of type `number` fire the `valueChanges` event only once per value change (as opposed to twice in some cases). See [PR 36087](https://github.com/angular/angular/pull/36087).
* The `minLength` and `maxLength` validators only validate values that have a numeric `length` property. See [PR 36157](https://github.com/angular/angular/pull/36157).
* Templates with unknown property bindings or unknown element names now log errors instead of warnings. See [PR 36399](https://github.com/angular/angular/pull/36399).
* `UrlMatcher` can now return `null` values. See [PR 36402](https://github.com/angular/angular/pull/36402).
* Transplanted views now refresh at insertion point only. See PR 35968](https://github.com/angular/angular/pull/35968).
* Formatting times with the `b` or `B` format codes now supports time periods that cross midnight. See [PR 36611](https://github.com/angular/angular/pull/36611).
* Navigation is canceled for routes with at least one empty resolver. See [PR 24621](https://github.com/angular/angular/pull/24621).

{@a deprecations}
### New Deprecations

| Area                          | API or Feature                                                                 | May be removed in |
| ----------------------------- | ---------------------------------------------------------------------------    | ----------------- |
| `@angular/core`               | [`WrappedValue`](guide/deprecations#wrapped-value)                                     | <!--v10--> v12 |
| browser support               | [`IE 9, 10, and IE Mobile`](guide/deprecations#ie-9-10-and-ie-mobile-support) | <!--v10--> v11 |


{@a removals}
### New Removals of Deprecated APIs

The following APIs have been removed starting with version 10.0.0*:

| Package          | API            | Replacement | Notes |
| ---------------- | -------------- | ----------- | ----- |
| `@angular/core`  | Undecorated base classes that use Angular features | Add Angular decorator | See [migration guide](guide/migration-undecorated-classes) for more info |
| `@angular/core`  | `ModuleWithProviders` without a generic             | `ModuleWithProviders` with a generic | See [migration guide](guide/migration-module-with-providers) for more info |
| `@angular/core`  | Style Sanitization | no action needed | See [style sanitization API removal](/guide/deprecations#style-sanitization) for more info
| `@angular/bazel` | [`Bazel builder and schematics`](guide/deprecations#bazelbuilder) | `bazelbuild/rules_nodejs` | [More info](https://github.com/angular/angular/tree/10.0.x/packages/bazel/src/schematics) |


*To see APIs removed in version 9, check out this guide on the [version 9 docs site](https://v9.angular.io/guide/deprecations#removed).

{@a ivy}

## Ivy features and compatibility

Since version 9, Angular Ivy is the default rendering engine. If you haven't heard of Ivy, you can read more about it in the [Angular Ivy guide](guide/ivy).

* Among other features, Ivy introduces more comprehensive type-checking within templates. For details, see [Template Type-checking](guide/template-typecheck).

* For general guidance on debugging and a list of minor changes associated with Ivy, see the [Ivy compatibility guide](guide/ivy-compatibility).

* For help with opting out of Ivy, see the instructions [here](guide/ivy#opting-out-of-angular-ivy).

{@a migrations}
## Automated Migrations for Version 10

Read about the migrations the CLI handles for you automatically:

* [Migrating missing `@Directive()`/`@Component()` decorators](guide/migration-undecorated-classes)
* [Migrating `ModuleWithProviders`](guide/migration-module-with-providers)
* [Solution-style `tsconfig.json` migration](guide/migration-solution-style-tsconfig)
* [`tslib` direct dependency migration](guide/migration-update-libraries-tslib)
* [Update `module` and `target` compiler options migration](guide/migration-update-module-and-target-compiler-options)
