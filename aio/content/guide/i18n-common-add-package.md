# Add the localize package

To take advantage of the localization features of Angular, use the [Angular CLI][AioCliMain] to add the `@angular/localize` package to your project.

To add the `@angular/localize` package, use the following command to update the `package.json` and TypeScript configuration files in your project.

<code-example path="i18n/doc-files/commands.sh" region="add-localize"></code-example>

It adds `types: ["@angular/localize"]` in the TypeScript configuration files as well as the reference to the type definition of `@angular/localize` at the top of the `main.ts` file.

<div class="alert is-helpful">

For more information about `package.json` and `tsconfig.json` files, see [Workspace npm dependencies][AioGuideNpmPackages] and [TypeScript Configuration][AioGuideTsConfig].

</div>

If `@angular/localize` is not installed and you try to build a localized version of your project (for example, while using the `i18n` attributes in templates), the [Angular CLI][AioCliMain] will generate an error, which would contain the steps that you can take to enable i18n for your project.

## Options

| OPTION           | DESCRIPTION | VALUE TYPE | DEFAULT VALUE
|:---              |:---    |:------     |:------
| `--project`      | The name of the project. | `string` |
| `--use-at-runtime` | If set, then `$localize` can be used at runtime. Also `@angular/localize` gets included in the `dependencies` section of `package.json`, rather than `devDependencies`, which is the default.  | `boolean` | `false`

For more available options, see [ng add][AioCliAdd] in [Angular CLI][AioCliMain].
## What's next

*   [@angular/localize API][AioApiLocalize]
*   [Refer to locales by ID][AioGuideI18nCommonLocaleId]

<!-- links -->

[AioCliMain]: cli "CLI Overview and Command Reference | Angular"

[AioGuideI18nCommonLocaleId]: guide/i18n-common-locale-id "Refer to locales by ID | Angular"

[AioGuideNpmPackages]: guide/npm-packages "Workspace npm dependencies | Angular"

[AioGuideTsConfig]: guide/typescript-configuration "TypeScript Configuration | Angular"

[AioCliAdd]: cli/add "ng add | CLI | Angular"

[AioApiLocalize]: api/localize "$localize | @angular/localize - API | Angular"

<!-- external links -->

<!-- end links -->

@reviewed 2023-03-10
