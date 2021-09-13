# Set the source locale manually

{@a set-source-manually}

Angular already contains locale data for `en-US`.
The Angular CLI automatically includes the locale data and sets the `LOCALE_ID` value when you use the `--localize` option with [`ng build`][AioCliBuild].

To manually set the source locale of an application to one other than the automatic value, complete the following actions.

1.  Search for the ID in the language-locale combination in [the Angular repository][GithubAngularAngularTreeMasterPackagesCommonLocales].
1.  Set the [`LOCALE_ID`][AioApiCoreLocaleId] token.
    
The following example sets the value of `LOCALE_ID` to `fr` for French.

<code-example path="i18n/doc-files/app.module.ts" header="src/app/app.module.ts"></code-example>

<!-- links -->

[AioApiCoreLocaleId]: api/core/LOCALE_ID "LOCALE_ID | Core - API | Angular"

[AioCliBuild]: cli/build "ng build | CLI | Angular"

<!-- external links -->

[GithubAngularAngularTreeMasterPackagesCommonLocales]: https://github.com/angular/angular/tree/master/packages/common/locales "angular/packages/common/locales | angular/angular | GitHub"

<!-- end links -->

@reviewed 2021-08-23
