# Updating to Angular Version 9

This guide contains everything you need to know about updating to the next Angular version.

## Version 9 Schematics

If your application uses the CLI, you can update to version 9 automatically with the help of the `ng update` script.
The script will run a series of small migrations that will transform the code of your application to be compatible with version 9.

If you're curious about the specific migrations being run (e.g. what code is changing and why), the guides below provide more context on each change and contain FAQs for common questions.

- [Migrating from `Renderer` to `Renderer2`](guide/migration-renderer)
- [Migrating undecorated classes](guide/migration-undecorated-classes)
- [Migrating missing `@Injectable()` decorators](guide/migration-injectable)
- [Migrating dynamic queries](guide/migration-dynamic-flag)
- [Migrating to the new `$localize` i18n support](guide/migration-localize)
- [Migrating `ModuleWithProviders`](guide/migration-module-with-providers)
- [Migrating to `ngcc` npm `postinstall` script](guide/migration-ngcc)

## Deprecations and Removals in Version 9

### New Deprecations

| API                                                                     | Replacement                          | Notes |
| ------------------------------------------------------------------------| ------------------------------------ | ----- |
| [`entryComponents`](api/core/NgModule#entryComponents)                  | none                                 | See [`entryComponents`](guide/deprecations#entryComponents) |
| [`ANALYZE_FOR_ENTRY_COMPONENTS`](api/core/ANALYZE_FOR_ENTRY_COMPONENTS) | none                                 | See [`ANALYZE_FOR_ENTRY_COMPONENTS`](guide/deprecations#entryComponents) |
| `ModuleWithProviders` without a generic                                 | `ModuleWithProviders` with a generic | See [`ModuleWithProviders` section](guide/deprecations#moduleWithProviders) |
| `esm5` and `fesm5` distribution in `@angular/*` npm packages              | `esm2015` and `fesm2015` entrypoints | See [`esm5` and `fesm5`](guide/deprecations#esm5-fesm5) |

### New Removals of Deprecated APIs

| Package | API            | Replacement | Notes |
| ------- | -------------- | ----------- | ----- |
| `@angular/core`  | [`Renderer`](https://v8.angular.io/api/core/Renderer) | [`Renderer2`](https://angular.io/api/core/Renderer2) | [Migration guide.](guide/migration-renderer)
| `@angular/core`  | [`RootRenderer`](https://v8.angular.io/api/core/RootRenderer) | [`RendererFactory2`](https://angular.io/api/core/RendererFactory2) | none
| `@angular/core`  | [`RenderComponentType`](https://v8.angular.io/api/core/RenderComponentType) | [`RendererType2`](https://angular.io/api/core/RendererType2) | none
| `@angular/common` | `DeprecatedI18NPipesModule` | [`CommonModule`](api/common/CommonModule#pipes) | none |
| `@angular/common` | `DeprecatedCurrencyPipe` | [`CurrencyPipe`](api/common/CurrencyPipe) | none |
| `@angular/common` | `DeprecatedDatePipe`     | [`DatePipe`](api/common/DatePipe) | none |
| `@angular/common` | `DeprecatedDecimalPipe` | [`DecimalPipe`](api/common/DecimalPipe) | none |
| `@angular/common` | `DeprecatedPercentPipe` | [`PercentPipe`](api/common/PercentPipe) | none |
| `@angular/forms` | [`NgFormSelectorWarning`](https://v8.angular.io/api/forms/NgFormSelectorWarning) | none | none
| `@angular/forms` | `ngForm` element selector | `ng-form` element selector | none
