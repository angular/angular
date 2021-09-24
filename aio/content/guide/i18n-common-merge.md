# Merge translations into the application

{@a merge}
{@a merge-aot}

To merge the completed translations into your application, use the [Angular CLI][AioGuideGlossaryCommandLineInterfaceCli] to build a copy of the distributable files of your application for each locale.

The build process replaces the original text with translated text, and sets the `LOCALE_ID` token for each distributable copy of your application.
It also loads and registers the locale data.

After you merge the translations, serve each distributable copy of the application using server-side language detection or different subdirectories.
For more information about how to serve each distributable copy of the application, see [deploying multiple locales][AioGuideI18nCommonDeployMultipleLocales].

The build process uses [ahead-of-time (AOT) compilation][AioGuideGlossaryAheadOfTimeAotCompilation] to produce a small, fast, ready-to-run application.
With Ivy in Angular version 9, AOT is used by default for both development and production builds, and AOT is required to localize component templates.

<div class="alert is-helpful">

For a detailed explanation of the build process, see [Building and serving Angular apps][AioGuideBuild].
This build process works for translation files in the `.xlf` format or in another format that Angular understands, such as `.xtb`.

</div>

<div class="alert is-important">

Ivy does not support merging i18n translations when using JIT mode.
If you [disable Ivy][AioGuideIvyOptingOutOfIvyInVersion9] and are using JIT mode, navigate [merging with the JIT compiler][AngularV8GuideI18nMergeWithTheJitCompiler].

</div>

To build a separate distributable copy of the application for each locale, [define the locales in the build configuration][AioGuideI18nCommonMergeDefineLocalesInTheBuildConfiguration] in the workspace configuration file [`angular.json`][AioGuideWorkspaceConfig] of your project.

This method shortens the build process by removing the requirement to perform a full application build for each locale.

Then, to [generate application versions for each locale][AioGuideI18nCommonMergeGenerateApplicationVersionsForEachLocale], use the `"localize"` option in `angular.json`.
Also, to [build from the command line][AioGuideI18nCommonMergeBuildFromTheCommandLine], use the [`build`][AioCliBuild] Angular CLI command with the `--localize` option.

<div class="alert is-helpful">

Optionally, [apply specific build options for just one locale][AioGuideI18nCommonMergeApplySpecificBuildOptionsForJustOneLocale] for a custom locale configuration.

</div>

### Define locales in the build configuration

{@a localize-config}

Use the `i18n` project option in the build configuration file ([`angular.json`][AioGuideWorkspaceConfig]) of your application to define locales for a project.

The following sub-options identify the source language and tell the compiler where to find supported translations for the project:

*   `sourceLocale`: The locale you use within the application source code (`en-US` by default)
*   `locales`: A map of locale identifiers to translation files

For example, the following excerpt of an `angular.json` file sets the source locale to `en-US` and provides the path to the `fr` (French) locale translation file:

<code-example language="json" header="angular.json" path="i18n/angular.json" region="locale-config"></code-example>

### Generate application versions for each locale

{@a localize-generate}

To use your locale definition in the build configuration, use the `"localize"` option in `angular.json` to tell the CLI which locales to generate for the build configuration:

*   Set `"localize"` to `true` for *all* the locales previously defined in the build configuration.
*   Set `"localize"` to an array of a subset of the previously defined locale identifiers to build only those locale versions.
*   Set `"localize"` to `false` to disable localization and not generate any locale-specific versions.

<div class="alert is-helpful">

**NOTE**: [Ahead-of-time (AOT) compilation][AioGuideGlossaryAheadOfTimeAotCompilation] is required to localize component templates.

If you changed this setting, set `"aot"` to `true` in order to use AOT.

</div>

The following example displays the `"localize"` option set to `true` in `angular.json`, so that all locales defined in the build configuration are built.

<code-example language="json" header="angular.json" path="i18n/angular.json" region="build-localize-true"></code-example>

<div class="alert is-helpful">

Due to the deployment complexities of i18n and the need to minimize rebuild time, the development server only supports localizing a single locale at a time.
If you set the `"localize"` option to `true`, define more than one locale, and use `ng serve`; then an error occurs.
If you want to develop against a specific locale, set the `"localize"` option to a specific locale.  
For example, for French (`fr`), specify `"localize": ["fr"]`.

</div>

The CLI loads and registers the locale data, places each generated version in a locale-specific directory to keep it separate from other locale versions, and puts the directories within the configured `outputPath` for the project.
For each application variant the `lang` attribute of the `html` element is set to the locale.
The CLI also adjusts the HTML base HREF for each version of the application by adding the locale to the configured `baseHref`.

Set the `"localize"` property as a shared configuration to effectively inherit for all the configurations. 
Also, set the property to override other configurations.

### Build from the command line

{@a localize-build-command}

Also, use the `--localize` option with the [`ng build`][AioCliBuild] command and your existing `production` configuration.
The CLI builds all locales defined in the build configuration.
If you set the locales in build configuration, it is similar to when you set the `"localize"` option to `true`.
For more information about how to set the locales, see [Generate application versions for each locale][AioGuideI18nCommonMergeGenerateApplicationVersionsForEachLocale].

<code-example path="i18n/doc-files/commands.sh" region="build-localize" language="sh"></code-example>

### Apply specific build options for just one locale

{@a localize-build-one-locale}

To apply specific build options to only one locale, specify a single locale to create a custom locale-specific configuration.
The following example displays a custom locale-specific configuration using a single locale.

<code-example language="json" header="angular.json" path="i18n/angular.json" region="build-single-locale"></code-example>

Pass this configuration to the `ng serve` or `ng build` commands.
The following code example displays how to serve the French language file.

<code-example path="i18n/doc-files/commands.sh" region="serve-french" language="sh"></code-example>

<div class="alert is-important">

Use the CLI development server (`ng serve`) with only a single locale.

</div>

For production builds, use configuration composition to run both configurations.

<code-example path="i18n/doc-files/commands.sh" region="build-production-french" language="sh"></code-example>

<code-example language="json" header="angular.json" path="i18n/angular.json" region="build-production-french" ></code-example>

### Report missing translations

{@a missing-translation}

When a translation is missing, the build succeeds but generates a warning such as `Missing translation for message "{translation_text}"`.
To configure the level of warning that is generated by the Angular compiler, specify one of the following levels.

*   `error`: Throw an error.
    If you are using AOT compilation, the build will fail.
    If you are using JIT compilation, the application will fail to load.
*   `warning` (default): Displays a `Missing translation` warning in the console or shell.
*   `ignore`: Do nothing.

Specify the warning level in the `options` section for the `build` target of your Angular CLI configuration file (`angular.json`).
The following example displays how to set the warning level to `error`.

<code-example language="json" header="angular.json" path="i18n/angular.json" region="missing-translation-error" ></code-example>

<!-- links -->

[AioGuideI18nCommonMergeApplySpecificBuildOptionsForJustOneLocale]: guide/i18n-common-merge#apply-specific-build-options-for-just-one-locale "Apply specific build options for just one locale - Merge translations into the application | Angular"
[AioGuideI18nCommonMergeBuildFromTheCommandLine]: guide/i18n-common-merge#build-from-the-command-line "Build from the command line - Merge translations into the application | Angular"
[AioGuideI18nCommonMergeDefineLocalesInTheBuildConfiguration]: guide/i18n-common-merge#define-locales-in-the-build-configuration "Define locales in the build configuration - Merge translations into the application | Angular"
[AioGuideI18nCommonDeployMultipleLocales]: guide/i18n-common-deploy "Deploy multiple locales | Angular"
[AioGuideI18nCommonMergeGenerateApplicationVersionsForEachLocale]: guide/i18n-common-merge#generate-application-versions-for-each-locale "Generate application versions for each locale - Merge translations into the application | Angular"

[AioCliBuild]: cli/build "ng build | CLI | Angular"

[AioGuideBuild]: guide/build "Building and serving Angular apps | Angular"

[AioGuideGlossaryAheadOfTimeAotCompilation]: guide/glossary#ahead-of-time-aot-compilation "ahead-of-time (AOT) compilation - Glossary | Angular"
[AioGuideGlossaryCommandLineInterfaceCli]: guide/glossary#command-line-interface-cli "command-line interface (CLI) - Glossary | Angular"

[AioGuideIvyOptingOutOfIvyInVersion9]: guide/ivy#opting-out-of-ivy-in-version-9 "Opting out of Ivy in version 9 - Angular Ivy | Angular"

[AioGuideWorkspaceConfig]: guide/workspace-config "Angular workspace configuration | Angular"

<!-- external links -->

<!--[AngularV8GuideI18nMergeWithTheJitCompiler]: https://v8.angular.io/guide/i18n-common#merge-translations-into-the-app-with-the-jit-compiler "Merge with the JIT compiler - Internationalization (i18n) | Angular v8" -->

<!-- end links -->

@reviewed 2021-09-15
