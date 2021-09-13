# Common Internationalization tasks

Use Angular to internationalize your application

*   Use built-in pipes to display dates, numbers, percentages, and currencies in a local format.
*   Mark text in component templates for translation.
*   Mark plural forms of expressions for translation.
*   Mark alternate text for translation.

After you prepare your application for an international audience, use the [Angular CLI][AioCliMain] to localize your application.
Complete the following tasks to localize your application.

*   Use the CLI to extract marked text to a *source language* file.
*   Make a copy of this file for each language, and send these *translation files* to a translator or service.
*   Use the CLI to merge the finished translation files when building your application for one or more locales.

<div class="alert is-helpful">

To explore the sample application with French translations used in this guide, see <live-example></live-example>.

</div>

## Prerequisites

To prepare your application for translations, you should have a basic understanding of the following subjects.

*   [Templates][AioGuideGlossaryTemplate]
*   [Components][AioGuideGlossaryComponent]
*   [Angular CLI][AioGuideGlossaryCommandLineInterfaceCli] command-line tool for managing the Angular development cycle
*   [Extensible Markup Language (XML)][W3Xml] used for translation files

## Steps to localize your app

To localize your application, complete the following general actions.

1.  [Add the localize package][AioGuideI18nCommonAddPackage].
1.  [Refer to locales by ID][AioGuideI18nCommonLocaleId].
1.  [Format data based on locale][AioGuideI18nCommonFormatDataLocale].
1.  [Prepare templates for translations][AioGuideI18nCommonPrepare].
1.  [Work with translation files][AioGuideI18nCommonTranslationFiles].
1.  [Merge translations into the app][AioGuideI18nCommonMerge].
1.  [Deploy multiple locales][AioGuideI18nCommonDeploy].

While you follow the actions, [explore the translated example app][AioGuideI18nExample].

In special cases, the following actions are required.

*   [Set the source locale manually][AioGuideI18nOptionalManualSourceLocale], if you need to set the [LOCALE_ID][AioApiCoreLocaleId] token.
*   [Import global variants of the locale data][AioGuideI18nOptionalImportGlobalVariants] for extra locale data.
*   [Manage marked text with custom IDs][AioGuideI18nOptionalManageMarkedText], if you require more control over matching translations.

<!-- links -->

[AioApiCoreLocaleId]: api/core/LOCALE_ID "LOCALE_ID | Core - API | Angular"

[AioCliMain]: cli "CLI Overview and Command Reference | Angular"

[AioGuideGlossaryCommandLineInterfaceCli]: guide/glossary#command-line-interface-cli "command-line interface (CLI) - Glossary | Angular"
[AioGuideGlossaryComponent]: guide/glossary#component "component - Glossary | Angular"
[AioGuideGlossaryTemplate]: guide/glossary#template "template - Glossary | Angular"

[AioGuideI18nCommonAddPackage]: guide/i18n-common-add-package "Common Internationalization task #1: Add the localize package | Angular"
[AioGuideI18nCommonDeploy]: guide/i18n-common-deploy "Deploy multiple locales | Angular"
[AioGuideI18nCommonFormatDataLocale]: guide/i18n-common-format-data-locale "Format data based on locale | Angular"
[AioGuideI18nCommonLocaleId]: guide/i18n-common-locale-id "Refer to locales by ID | Angular"
[AioGuideI18nCommonMerge]: guide/i18n-common-merge "Merge translations into the application | Angular"
[AioGuideI18nCommonPrepare]: guide/i18n-common-prepare "Prepare templates for translations | Angular"
[AioGuideI18nCommonTranslationFiles]: guide/i18n-common-translation-files "Work with translation files | Angular"
[AioGuideI18nExample]: guide/i18n-example "Example Angular application: Explore the translated example application | Angular"

[AioGuideI18nOptionalManageMarkedText]: guide/i18n-optional-manage-marked-text "Manage marked text with custom IDs | Angular"
[AioGuideI18nOptionalImportGlobalVariants]: guide/i18n-optional-import-global-variants "Import global variants of the locale data | Angular"
[AioGuideI18nOptionalManualSourceLocale]: guide/i18n-optional-manual-source-locale "Set the source locale manually | Angular"

<!-- externla links -->

[W3Xml]: https://www.w3.org/XML "Extensible Markup Language (XML) | W3C"

<!-- end links -->

@reviewed 2021-08-23
