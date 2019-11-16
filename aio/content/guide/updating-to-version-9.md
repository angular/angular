# Updating to Angular Version 9

This guide contains everything you need to know about updating to the next Angular version.

## Updating CLI Apps

If your application uses the CLI, you can update to version 9 automatically with the help of the `ng update` script:

```bash
ng update @angular/core@8 @angular/cli@8
git add .
git commit --all -m "build: update Angular packages to latest 8.x version"
ng update @angular/cli @angular/core --next
```

<div class="alert is-important">
In order to improve the updating experience, we strongly suggest that you update to the latest 8.x version of `@angular/core` and `@angular/cli`.

Additionally, during the RC period, the `--next` command line flag is required. This flag will no longer be necessary once version 9 final is released.
</div>

The script runs a series of small migrations that will transform the code of your application to be compatible with version 9.
If you're curious about the specific migrations being run, see the [automated migrations section](#migrations) for details on what code is changing and why.

## Changes and Deprecations in Version 9

{@a breaking-changes}
### New Breaking Changes

- Angular now compiles with Ivy by default. See [Ivy compatibility section](#ivy).

- CLI apps compile in [AOT mode](/guide/aot-compiler) by default (which includes template type-checking).
Users who only built with JIT before may see new type errors.
See our [template type-checking guide](guide/template-typecheck) for more information and debugging tips.

- Typescript 3.4 and 3.5 are no longer supported. Please update to Typescript 3.6.

- `tslib` is now listed as a peer dependency rather than a direct dependency. If you are not using the CLI, you must manually install `tslib`, using `yarn add tslib` or `npm install tslib --save`.

{@a deprecations}
### New Deprecations

| API                                                                     | Replacement                          | Notes |
| ------------------------------------------------------------------------| ------------------------------------ | ----- |
| [`entryComponents`](api/core/NgModule#entryComponents)                  | none                                 | See [`entryComponents`](guide/deprecations#entryComponents) |
| [`ANALYZE_FOR_ENTRY_COMPONENTS`](api/core/ANALYZE_FOR_ENTRY_COMPONENTS) | none                                 | See [`ANALYZE_FOR_ENTRY_COMPONENTS`](guide/deprecations#entryComponents) |
| `ModuleWithProviders` without a generic                                 | `ModuleWithProviders` with a generic | See [`ModuleWithProviders` section](guide/deprecations#moduleWithProviders) |
| `esm5` and `fesm5` distribution in `@angular/*` npm packages            | `esm2015` and `fesm2015` entrypoints | See [`esm5` and `fesm5`](guide/deprecations#esm5-fesm5) |
| [`TestBed.get`](api/core/testing/TestBed#get)                           | [`TestBed.inject`](api/core/testing/TestBed#inject) | Same behavior, but type safe. |


{@a removals}
### New Removals of Deprecated APIs

| Package | API            | Replacement | Notes |
| ------- | -------------- | ----------- | ----- |
| `@angular/core`  | [`Renderer`](https://v8.angular.io/api/core/Renderer) | [`Renderer2`](https://angular.io/api/core/Renderer2) | [Migration guide.](guide/migration-renderer) |
| `@angular/core`  | [`RootRenderer`](https://v8.angular.io/api/core/RootRenderer) | [`RendererFactory2`](https://angular.io/api/core/RendererFactory2) | none |
| `@angular/core`  | [`RenderComponentType`](https://v8.angular.io/api/core/RenderComponentType) | [`RendererType2`](https://angular.io/api/core/RendererType2) | none |
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
- [Migrating undecorated classes](guide/migration-undecorated-classes)
- [Migrating missing `@Injectable()` decorators](guide/migration-injectable)
- [Migrating dynamic queries](guide/migration-dynamic-flag)
- [Migrating to the new `$localize` i18n support](guide/migration-localize)
- [Migrating `ModuleWithProviders`](guide/migration-module-with-providers)
