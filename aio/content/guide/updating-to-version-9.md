# Updating to Angular version 9

This guide contains information related to updating to version 9 of Angular.

## Updating CLI Apps

For step-by-step instructions on how to update to the latest Angular release (and leverage our automated migration tools to do so), use the interactive update guide at [update.angular.io](https://update.angular.io).

If you're curious about the specific migrations being run by the CLI, see the [automated migrations section](#migrations) for details on what code is changing and why.

## Changes and Deprecations in Version 9

<div class="alert is-helpful">

   For information about Angular's deprecation and removal practices, see [Angular Release Practices](guide/releases#deprecation-practices "Angular Release Practices: Deprecation practices").

</div>

{@a breaking-changes}
### New Breaking Changes

- Angular now compiles with Ivy by default. See the [Ivy compatibility section](#ivy).

- CLI apps compile in [AOT mode](/guide/aot-compiler) by default (which includes template type-checking).
Users who only built with JIT before may see new type errors.
See our [template type-checking guide](guide/template-typecheck) for more information and debugging tips.

- Typescript 3.4 and 3.5 are no longer supported. Please update to Typescript 3.7.

- `tslib` is now listed as a peer dependency rather than a direct dependency. If you are not using the CLI, you must manually install `tslib`, using `yarn add tslib` or `npm install tslib --save`.

{@a deprecations}
### New Deprecations

| API                                                                     | Replacement                          | Notes |
| ------------------------------------------------------------------------| ------------------------------------ | ----- |
| [`entryComponents`](api/core/NgModule#entryComponents)                  | none                                 | See [`entryComponents`](guide/deprecations#entryComponents) |
| [`CurrencyPipe` - `DEFAULT_CURRENCY_CODE`](api/common/CurrencyPipe#currency-code-deprecation)| `{provide: DEFAULT_CURRENCY_CODE, useValue: 'USD'}` | From v11 the default code will be extracted from the locale data given by `LOCAL_ID`, rather than `USD`. |
| [`ANALYZE_FOR_ENTRY_COMPONENTS`](api/core/ANALYZE_FOR_ENTRY_COMPONENTS) | none                                 | See [`ANALYZE_FOR_ENTRY_COMPONENTS`](guide/deprecations#entryComponents) |
| `ModuleWithProviders` without a generic                                 | `ModuleWithProviders` with a generic | See [`ModuleWithProviders` section](guide/deprecations#moduleWithProviders) |
| Undecorated base classes that use Angular features                      | Base classes with `@Directive()` decorator that use Angular features | See [undecorated base classes section](guide/deprecations#undecorated-base-classes) |
| `esm5` and `fesm5` distribution in `@angular/*` npm packages            | `esm2015` and `fesm2015` entrypoints | See [`esm5` and `fesm5`](guide/deprecations#esm5-fesm5) |
| [`TestBed.get`](api/core/testing/TestBed#get)                           | [`TestBed.inject`](api/core/testing/TestBed#inject) | Same behavior, but type safe. |


{@a removals}
### New Removals of Deprecated APIs

| Package | API            | Replacement | Notes |
| ------- | -------------- | ----------- | ----- |
| `@angular/core`  | [`Renderer`](https://v8.angular.io/api/core/Renderer) | [`Renderer2`](api/core/Renderer2) | [Migration guide.](guide/migration-renderer) |
| `@angular/core`  | [`RootRenderer`](https://v8.angular.io/api/core/RootRenderer) | [`RendererFactory2`](api/core/RendererFactory2) | none |
| `@angular/core`  | [`RenderComponentType`](https://v8.angular.io/api/core/RenderComponentType) | [`RendererType2`](api/core/RendererType2) | none |
| `@angular/core`  | [`WtfScopeFn`](https://v8.angular.io/api/core/WtfScopeFn) | none | v8 | See [Web Tracing Framework](#wtf) |
| `@angular/core`  | [`wtfCreateScope`](https://v8.angular.io/api/core/wtfCreateScope) | none | v8 | See [Web Tracing Framework](guide/deprecations#wtf) |
| `@angular/core`  | [`wtfStartTimeRange`](https://v8.angular.io/api/core/wtfStartTimeRange) | none | v8 | See [Web Tracing Framework](guide/deprecations#wtf) |
| `@angular/core`  | [`wtfEndTimeRange`](https://v8.angular.io/api/core/wtfEndTimeRange) | none | v8 | See [Web Tracing Framework](guide/deprecations#wtf) |
| `@angular/core`  | [`wtfLeave`](https://v8.angular.io/api/core/wtfLeave) | none | v8 | See [Web Tracing Framework](guide/deprecations#wtf) |
| `@angular/common` | `DeprecatedI18NPipesModule` | [`CommonModule`](api/common/CommonModule#pipes) | none |
| `@angular/common` | `DeprecatedCurrencyPipe` | [`CurrencyPipe`](api/common/CurrencyPipe) | none |
| `@angular/common` | `DeprecatedDatePipe`     | [`DatePipe`](api/common/DatePipe) | none |
| `@angular/common` | `DeprecatedDecimalPipe` | [`DecimalPipe`](api/common/DecimalPipe) | none |
| `@angular/common` | `DeprecatedPercentPipe` | [`PercentPipe`](api/common/PercentPipe) | none |
| `@angular/forms` | [`NgFormSelectorWarning`](https://v8.angular.io/api/forms/NgFormSelectorWarning) | none |
| `@angular/forms` | `ngForm` element selector | `ng-form` element selector | none |
| `@angular/service-worker` | `versionedFiles` | `files` | In the service worker configuration file `ngsw-config.json`, replace `versionedFiles` with `files`. See [Service Worker Configuration](guide/service-worker-config#assetgroups). |

{@a ivy}

## Ivy features and compatibility

In Version 9, Angular Ivy is the default rendering engine. If you haven't heard of Ivy, you can read more about it in the [Angular Ivy guide](guide/ivy).

* Among other features, Ivy introduces more comprehensive type-checking within templates. For details, see [Template Type-checking](guide/template-typecheck).

* For general guidance on debugging and a list of minor changes associated with Ivy, see the [Ivy compatibility guide](guide/ivy-compatibility).

* For help with opting out of Ivy, see the instructions [here](guide/ivy#opting-out-of-angular-ivy).

{@a migrations}
## Automated Migrations for Version 9

Read about the migrations the CLI handles for you automatically:

- [Migrating from `Renderer` to `Renderer2`](guide/migration-renderer)
- [Migrating missing `@Directive()`/`@Component()` decorators](guide/migration-undecorated-classes)
- [Migrating missing `@Injectable()` decorators and incomplete provider definitions](guide/migration-injectable)
- [Migrating dynamic queries](guide/migration-dynamic-flag)
- [Migrating to the new `$localize` i18n support](guide/migration-localize)
- [Migrating `ModuleWithProviders`](guide/migration-module-with-providers)
