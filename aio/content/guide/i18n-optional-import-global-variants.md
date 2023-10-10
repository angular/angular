# Import global variants of the locale data

The [Angular CLI][AioCliMain] automatically includes locale data if you run the [`ng build`][AioCliBuild] command with the `--localize` option.

<!--todo: replace with code-example -->

<code-example format="shell" language="shell">

ng build --localize

</code-example>

<div class="alert-is-helpful">

The initial installation of Angular already contains locale data for English in the United States \(`en-US`\).
The [Angular CLI][AioCliMain] automatically includes the locale data and sets the `LOCALE_ID` value when you use the `--localize` option with [`ng build`][AioCliBuild] command.

</div>

The `@angular/common` package on npm contains the locale data files.
Global variants of the locale data are available in [`@angular/common/locales/global`][UnpkgBrowseAngularCommonLocalesGlobal].

## `import` example for French

For example, you could import the global variants for French \(`fr`\) in `main.ts` where you bootstrap the application.

<code-example header="src/main.ts (import locale)" path="i18n/src/main.ts" region="global-locale"></code-example>

<div class="alert is-helpful">

In an `NgModules` application, you would import it in your `app.module`.

</div>

<!-- links -->

[AioCliMain]: cli "CLI Overview and Command Reference | Angular"
[AioCliBuild]: cli/build "ng build | CLI | Angular"

<!-- external links -->

[UnpkgBrowseAngularCommonLocalesGlobal]: https://unpkg.com/browse/@angular/common/locales/global "@angular/common/locales/global | Unpkg"

<!-- end links -->

@reviewed 2023-08-30
