# Refer to locales by ID

{@a setting-up-locale}
{@a setting-up-the-locale-of-your-app}

Refer to a locale using the Unicode *locale identifier* (ID), which specifies the language, country, and an optional code for further variants or subdivisions.

<div class="callout is-helpful">
<header>Unicode locale identifiers</header>

*   For a list of language codes, see [ISO 639-2][LocStandardsIso6392].
*   IDs conform to the Unicode Common Locale Data Repository (CLDR).
    For more information about Unicode locale identifiers, see [CLDR core specification][UnicodeCldrCoreSpecUnicodeLanguageAndLocaleIdentifiers].
*   CLDR and Angular base their identifiers on [BCP47 tags][RfcEditorInfoBcp47].

</div>

The ID consists of a language identifier, such as `en` for English or `fr` for French, followed by a dash (`-`) and a locale extension, such as `US` for the United States or `CA` for Canada.
For example, `en-US` refers to English in the United States, and `fr-CA` refers to French in Canada.
Angular uses this ID to find the correct corresponding locale data.

<div class="alert is-helpful">

Many countries, such as France and Canada, use the same language (French, identified as `fr`) but differ in grammar, punctuation, and formats for currency, decimal numbers, and dates.
Use a more specific locale ID, such as French for Canada (`fr-CA`), when localizing your application.

</div>

Angular by default uses `en-US` (English in the United States) as the source locale of your application.

The [Angular repository][GithubAngularAngularTreeMasterPackagesCommonLocales] includes common locales.
To change the source locale of your application for the build, set the source locale in the `sourceLocale` field in the [workspace configuration][AioGuideWorkspaceConfig] file (`angular.json`) of your application.
The build process (described in [Merge translations into the app][AioGuideI18nCommonMerge] in this guide) uses the `angular.json` file of your application to automatically set the [`LOCALE_ID`][AioApiCoreLocaleId] token and load the locale data.

<!-- links -->

[AioGuideI18nCommonMerge]: guide/i18n-common-merge "Merge translations into the application | Angular"

[AioApiCoreLocaleId]: api/core/LOCALE_ID "LOCALE_ID | Core - API | Angular"

[AioGuideWorkspaceConfig]: guide/workspace-config "Angular workspace configuration | Angular"

<!-- external links -->

[GithubAngularAngularTreeMasterPackagesCommonLocales]: https://github.com/angular/angular/tree/master/packages/common/locales "angular/packages/common/locales | angular/angular | GitHub"

[LocStandardsIso6392]: http://www.loc.gov/standards/iso639-2 "ISO 639-2 Registration Authority | Library of Congress"

[RfcEditorInfoBcp47]: https://www.rfc-editor.org/info/bcp47 "BCP 47 | RFC Editor"

[UnicodeCldrCoreSpecUnicodeLanguageAndLocaleIdentifiers]: http://cldr.unicode.org/core-spec#Unicode_Language_and_Locale_Identifiers "Unicode Language and Locale Identifiers - Core Specification | CLDR - Unicode Common Locale Data Repository | Unicode"

<!-- end links -->

@reviewed 2021-08-23
