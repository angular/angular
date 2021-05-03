# Updating Angular

This guide contains information related to updating to the latest version of Angular.

## Updating CLI Apps

For step-by-step instructions on how to update to the latest Angular release (and leverage our automated migration tools to do so), use the interactive update guide at [update.angular.io](https://update.angular.io).

## Changes and Deprecations in Version 11

<div class="alert is-helpful">

   For information about Angular's deprecation and removal practices, see [Angular Release Practices](guide/releases#deprecation-practices "Angular Release Practices: Deprecation practices").

</div>

{@a breaking-changes}
### New Breaking Changes

* Remove deprecated support for IE 9, 10, and IE mobile. See [PR 38931](https://github.com/angular/angular/pull/38931).
* TypeScript 3.9 is no longer supported. Please update to TypeScript 4.0. See [PR 39313](https://github.com/angular/angular/pull/39313).
* `NavigationExtras#preserveQueryParams` has been removed from `@angular/router`. See [PR 38762](https://github.com/angular/angular/pull/38762)
* `CollectionChangeRecord` has been removed from `@angular/core`. See [PR 38668](https://github.com/angular/angular/pull/38668).
* We changed the default value for `relativeLinkResolution` from `'legacy'` to `'corrected'` so that new applications are automatically opted-in to the corrected behavior from  [PR 22394](https://github.com/angular/angular/pull/22394). Applications which use the current default are updated by a migration to specify `'legacy'` to ensure the current behavior is maintained when the default is updated. See [PR 25609](https://github.com/angular/angular/pull/25609).
* Fixed a bug in the router where the arguments for `future` and `curr` snapshots were reversed in the call to `shouldReuseRoute` when processing child routes. Usually this ordering mistake doesn't matter because most implementations of [`shouldReuseRoute`](api/router/RouteReuseStrategy#shouldReuseRoute) just do
an equality comparison between `future` and `curr`. However, some implementations actually do rely on values specifically on
one of the two and will need to be updated. See [PR 26949](https://github.com/angular/angular/pull/26949).
* `ViewEncapsulation.Native` has been removed. Angular previously supported a view encapsulation mode `ViewEncapsulaion.Native` that was based on the v0 Shadow DOM Draft APIs. These APIs have been superceded by the final Shadow DOM APIs, which are enabled via `ViewEncapsulation.ShadowDom`. For background information about this change, see [Web Components update: more time to upgrade to v1 APIs](https://developers.google.com/web/updates/2019/07/web-components-time-to-upgrade).
* `@angular/platform-webworker` has been removed and will no longer be supported. See [PR 38846](https://github.com/angular/angular/pull/38846).
* `@angular/platform-webworker` is no longer supported. No further versions will be published. See [PR 38846](https://github.com/angular/angular/pull/38846).
* Updated the options for `initialNavigation`. For more information, see [initialNavigation](api/router/InitialNavigation) in the API documentation. See [PR 33128](https://github.com/angular/angular/pull/33128).
* `DatePipe` no longer rounds up fractional milliseconds. See [PR 38009](https://github.com/angular/angular/pull/38009).
* Locale data arrays are now read-only. See [PR 30397](https://github.com/angular/angular/pull/30397).
* The injected `ControlValueAccessor` for `NG_VALUE_ACCESSOR` is now readonly. See [PR 29273](https://github.com/angular/angular/pull/29723).
* The type of `AbstractControl#parent` now indicates that it may be null. See [PR 32671](https://github.com/angular/angular/pull/32671).
* Calling `overrideProvider` before initializing the TestBed will now throw an error. See [PR 38717](https://github.com/angular/angular/pull/38717).
* Types for many Angular built-in pipes have been either narrowed or expanded to be more accurate. For more information, see the corresponding [Pipes](https://angular.io/api?type=pipe) API documentation. See [PR 37447](https://github.com/angular/angular/pull/37447).
* Directives in the `@angular/forms` package used to have `any[]` as a type of validators and asyncValidators
arguments in constructors. Now these arguments are properly typed, so if your code relies on
directive constructor types it may require some updates to improve type safety. See [PR 38994](https://github.com/angular/angular/pull/38944).
* `routerLink` now accepts `undefined` inputs. See [PR 39151](https://github.com/angular/angular/pull/39151).
* The `async` function from `@angular/core/testing` has been renamed to `waitForAsync` in order to avoid confusion with the native JavaScript `async` syntax. The existing function is deprecated and will be removed in a future version. See [PR 37583](https://github.com/angular/angular/pull/37583).

{@a deprecations}
### New Deprecations

| Area                          | API or Feature                                     | May be removed in |
| ----------------------------- | -------------------------------------------------- | ----------------- |
| `@angular/core/testing`       | Rename `async` to `waitForAsync`                       | <!--v11--> v13 |


{@a removals}
### New Removals of Deprecated APIs

The following APIs have been removed starting with version 11.0.0*:

| Package          | API            | Replacement | Notes |
| ---------------- | -------------- | ----------- | ----- |
| `@angular/router`| `NavigationExtras#preserveQueryParams` | no action needed | NavigationExtras#preserveQueryParams has been removed from `@angular/router`.|
| `@angular/core` | `CollectionChangeRecord` | no action needed | CollectionChangeRecord has been removed from `@angular/core`.|
| `@angular/core` | `ViewEncapsulation.Native` | no action needed | Angular previously supported a view encapsulation mode `ViewEncapsulaion.Native` that was based on the v0 Shadow DOM Draft APIs. These APIs have been superceeded by the final Shadow DOM APIs, which are enabled via `ViewEncapsulation.ShadowDom`. For background information about this change, see [Web Components update: more time to upgrade to v1 APIs](https://developers.google.com/web/updates/2019/07/web-components-time-to-upgrade).|

{@a ivy}

## Ivy features and compatibility

Since version 9, Angular Ivy is the default rendering engine. If you haven't heard of Ivy, you can read more about it in the [Angular Ivy guide](guide/ivy).

* Among other features, Ivy introduces more comprehensive type-checking within templates. For details, see [Template Type-checking](guide/template-typecheck).

* For general guidance on debugging and a list of minor changes associated with Ivy, see the [Ivy compatibility guide](guide/ivy-compatibility).

* For help with opting out of Ivy, see the instructions [here](guide/ivy#opting-out-of-angular-ivy).
