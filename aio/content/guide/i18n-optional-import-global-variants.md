# Import global variants of the locale data

The [Angular CLI][AioCliMain] automatically includes locale data if you run the [`ng build`][AioCliBuild] command with the `--localize` option.

<!--todo: replace with code-example -->

<code-example language="sh">

ng build --localize

</code-example>

The `@angular/common` package on npm contains the locale data files.
Global variants of the locale data are available in [`@angular/common/locales/global`][GithubAngularAngularTreeMasterPackagesCommonLocalesGlobal].

## `import` example for French

The following example imports the global variants for French (`fr`).

<code-example path="i18n/doc-files/app.module.ts" header="src/app/app.module.ts" region="global-locale"></code-example>

<!-- links -->

[AioCliMain]: cli "CLI Overview and Command Reference | Angular"
[AioCliBuild]: cli/build "ng build | CLI | Angular"

<!-- external links -->

[GithubAngularAngularTreeMasterPackagesCommonLocales]: https://github.com/angular/angular/tree/master/packages/common/locales "angular/packages/common/locales | angular/angular | GitHub"
[GithubAngularAngularTreeMasterPackagesCommonLocalesGlobal]: https://github.com/angular/angular/tree/master/packages/common/locales/global "angular/packages/common/locales/global | angular/angular | GitHub"

<!-- end links -->

@reviewed 2021-10-13
