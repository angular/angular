# Import global variants of the locale data

{@a import-locale}

Angular will automatically include locale data if you configure the locale using the `--localize` option with [`ng build`][AioCliBuild] CLI command.

The [Angular repository][GithubAngularAngularTreeMasterPackagesCommonLocales] files (`@angular/common/locales`) contain most of the locale data that you need, but some advanced formatting options require additional locale data.

Global variants of the locale data are available in [`@angular/common/locales/global`][GithubAngularAngularTreeMasterPackagesCommonLocalesGlobal].

The following example imports the global variants for French (`fr`).

<code-example path="i18n/doc-files/app.module.ts" header="src/app/app.module.ts" region="global-locale"></code-example>

<!-- links -->

[AioCliBuild]: cli/build "ng build | CLI | Angular"

<!-- external links -->

[GithubAngularAngularTreeMasterPackagesCommonLocales]: https://github.com/angular/angular/tree/master/packages/common/locales "angular/packages/common/locales | angular/angular | GitHub"
[GithubAngularAngularTreeMasterPackagesCommonLocalesGlobal]: https://github.com/angular/angular/tree/master/packages/common/locales/global "angular/packages/common/locales/global | angular/angular | GitHub"

<!-- end links -->

@reviewed 2021-09-15
