# Updating Angular

This guide contains information related to updating to Angular version 12.

## Updating CLI applications

For step-by-step instructions on how to update to the latest Angular release and leverage our automated migration tools to do so, use the interactive update guide at [update.angular.io](https://update.angular.io).


## Building applications with Ivy

For libraries, View Engine is deprecated and will be removed in version 13.
New libraries created with version 12 or later default to Ivy.
For more information about distributing libraries with View Engine and Ivy, see the [Building libraries with Ivy](guide/creating-libraries#ivy-libraries) section of [Creating libraries](guide/creating-libraries).

## Changes and deprecations in version 12

<div class="alert is-helpful">

   For information about Angular's deprecation and removal practices, see [Angular Release Practices](guide/releases#deprecation-practices "Angular Release Practices: Deprecation practices").

</div>

* Applications can no longer build with View Engine by setting `enableIvy: false`.
  Support for building libraries with View Engine, for backwards compatibility, is deprecated and will be removed in Angular version 13.
  New libraries created with Angular version 12 will default to building and distributing with Ivy.
  For more information, see [Creating Libraries](guide/creating-libraries).
* The Ivy-based IDE [language service](guide/language-service) is now on by default.
  See [PR #1279](https://github.com/angular/vscode-ng-language-service/pull/1279).
* Angular's View Engine-based algorithm for generating i18n message IDs is deprecated.
  Angular version 12 adds a new flag to `localize-extract` called `--migrateMapFile` which  generates a JSON file that can be used to map legacy message IDs to canonical ones.
  There is also a new script called `localize-migrate` that can use the mapping file which `localize-extract` generates and migrate all of the IDs in the files that are passed in.
  For better stability, if you are using Angular's `i18n`, run this migration to move to the new message ID generation algorithm.
  If you don't run this migration, all your generated message IDs will change when Angular removes the View Engine compiler.
  See [PR #41026](https://github.com/angular/angular/pull/41026).
* There is now a new build option named `inlineStyleLanguage` for defining the style sheet language in inline component styles.
  Currently supported language options are CSS (default), Sass, SCSS, and LESS.
  The default of CSS enables existing projects to continue to function as expected.
  See [PR #20514](https://github.com/angular/angular-cli/pull/20514).
* For new applications, strict mode is now the default in the CLI.
  See [PR #20029](https://github.com/angular/angular-cli/pull/20029).
* Add `emitEvent` option for `AbstractControl` class methods.
  See [PR #31031](https://github.com/angular/angular/pull/31031).
* Support `APP_INITIALIZER` to work with observables.
  See [PR #31031](https://github.com/angular/angular/pull/31031).
* `HttpClient` supports specifying request metadata.
  See [PR #25751](https://github.com/angular/angular/pull/25751).


{@a breaking-changes}
### Breaking changes in Angular version 12

* Add support for TypeScript 4.2.
  TypeScript <4.2.3 is no longer supported.
  The supported range of TypeScript versions is 4.2.3 to 4.2.x.
  See [PR #41158](https://github.com/angular/angular/pull/41158).
* Angular CDK and Angular Material internally now use the new [Sass module system](https://sass-lang.com/blog/the-module-system-is-launched), which is actively maintained by the Sass team at Google.
  Consequently, applications can no longer consume Angular CDK/Material's Sass with the [`node-sass` npm package](https://www.npmjs.com/package/node-sass).
  `node-sass` is unmaintained and does not support newer Sass features. Instead, applications must use the [`sass` npm package](https://www.npmjs.com/package/sass), or the [`sass-embedded` npm package](https://www.npmjs.com/package/sass-embedded) for the `sass-embedded` beta.
* The Angular tooling now uses Webpack 5 to build applications. Webpack 4 usage and support has been removed.
  You don't need to make any project level configuration changes to use the upgraded Webpack version when using the official Angular builders.
  Custom builders based on this package that use the experimental programmatic APIs may need to be updated to become compatible with Webpack 5.
  See [PR #20466](https://github.com/angular/angular-cli/pull/20466).
* Webpack 5 generates similar but differently named files for lazy-loaded JavaScript files in development configurations when the `namedChunks` option is enabled.
  For the majority of users this change should have no effect on the application or build process.
  Production builds should also not be affected as the `namedChunks` option is disabled by default in production configurations.
  However, if a project's post-build process makes assumptions as to the file names, then adjustments may need to be made to account for the new naming paradigm.
  Such post-build processes could include custom file transformations after the build, integration into service-side frameworks, or deployment procedures.
  An example of a development file name change is `lazy-lazy-module.js` becoming `src_app_lazy_lazy_module_ts.js`.
  See [PR #20466](https://github.com/angular/angular-cli/pull/20466).
* Webpack 5 now includes web worker support.
  However, the structure of the URL within the worker constructor must be in a specific format that differs from the current requirement.
  To update web worker usage, where `./app.worker` is the actual worker name, change `new Worker('./app.worker', ...)` to `new Worker(new URL('./app.worker', import.meta.url), ...)`.
  See [PR #20466](https://github.com/angular/angular-cli/pull/20466).
* Critical CSS inlining is now enabled by default.
  To turn this off, set `inlineCritical` to false.
  See [PR #20096](https://github.com/angular/angular-cli/pull/20096) and the [Style preprocessor options](guide/workspace-config#optimization-configuration) section of [Angular workspace configuration](guide/workspace-config).
* `ng build` now produces production bundle by default.
  See [PR #20128](https://github.com/angular/angular-cli/pull/20128).
* Previously, the Forms module ignored `min` and `max` attributes defined on the `<input type="number">`.
  Now these attributes trigger `min` and `max` validation logic in cases where `formControl`, `formControlName`, or `ngModel` directives are also present on a given input.
  See [PR #39063](https://github.com/angular/angular/pull/39063).


{@a deprecations}
### New deprecations

* Support for Internet Explorer 11 is deprecated.
  See [Deprecated APIs and features](guide/deprecations) and [Microsoft 365 apps say farewell to Internet Explorer 11 and Windows 10 sunsets Microsoft Edge Legacy](https://techcommunity.microsoft.com/t5/microsoft-365-blog/microsoft-365-apps-say-farewell-to-internet-explorer-11-and/ba-p/1591666).
* Sass imports from `@angular/material/theming` are deprecated. There is a new Angular Material Sass API for `@use`.
  Run the migration script `ng g @angular/material:themingApi` to switch all your Sass imports for Angular CDK and Angular Material to the new API and `@use`.
* Support for publishing libraries with View Engine has been deprecated:
  - You can now compile libraries in [_partial_ compilation mode](guide/angular-compiler-options#compilationmode) to generate Ivy compatible output that will be _linked_ when an application using that library is bundled.
  - New libraries you create with the Angular CLI default to partial compilation mode, and do not support View Engine. You can still build a library with View Engine. See [Creating libraries](guide/creating-libraries) for more information.
  - Libraries compiled in partial compilation mode will not contain legacy `i18n` message IDs.
    If the library was previously compiled by View Engine, and contained legacy `i18n` message IDs, then applications may have translation files that you'll need to migrate to the new message ID format. For more information, see [Migrating legacy localization IDs](guide/migration-legacy-message-id).
  - For context, see [Issue #38366](https://github.com/angular/angular/issues/38366).

<div class="alert is-helpful">

Since version 9, Angular Ivy is the default rendering engine.
For more information about Ivy, see [Angular Ivy](guide/ivy).

</div>
