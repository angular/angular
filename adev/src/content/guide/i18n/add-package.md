# Add the localize package

To take advantage of the localization features of Angular, use the [Angular CLI][CliMain] to add the `@angular/localize` package to your project.

To add the `@angular/localize` package, use the following command to update the `package.json` and TypeScript configuration files in your project.

<docs-code path="adev/src/content/examples/i18n/doc-files/commands.sh" visibleRegion="add-localize"/>

It adds `types: ["@angular/localize"]` in the TypeScript configuration files.
It also adds line `/// <reference types="@angular/localize" />` at the top of the `main.ts` file which is the reference to the type definition.

HELPFUL: For more information about `package.json` and `tsconfig.json` files, see [Workspace npm dependencies][GuideNpmPackages] and [TypeScript Configuration][GuideTsConfig]. To learn about Triple-slash Directives visit [Typescript Handbook](https://www.typescriptlang.org/docs/handbook/triple-slash-directives.html#-reference-types-).

If `@angular/localize` is not installed and you try to build a localized version of your project (for example, while using the `i18n` attributes in templates), the [Angular CLI][CliMain] will generate an error, which would contain the steps that you can take to enable i18n for your project.

## Options

| OPTION           | DESCRIPTION | VALUE TYPE | DEFAULT VALUE
|:---              |:---    |:------     |:------
| `--project`      | The name of the project. | `string` |
| `--use-at-runtime` | If set, then `$localize` can be used at runtime. Also `@angular/localize` gets included in the `dependencies` section of `package.json`, rather than `devDependencies`, which is the default.  | `boolean` | `false`

For more available options, see `ng add` in [Angular CLI][CliMain].

## What's next

<docs-pill-row>
  <docs-pill href="guide/i18n/locale-id" title="Refer to locales by ID"/>
</docs-pill-row>

[CliMain]: cli "CLI Overview and Command Reference | Angular"

[GuideNpmPackages]: reference/configs/npm-packages "Workspace npm dependencies | Angular"

[GuideTsConfig]: https://www.typescriptlang.org/docs/handbook/tsconfig-json.html "TypeScript Configuration"
