# Angular workspace configuration

The `angular.json` file at the root level of an Angular [workspace](guide/glossary#workspace) provides workspace-wide and project-specific configuration defaults. These are used for build and development tools provided by the Angular CLI.
Path values given in the configuration are relative to the root workspace directory.

## General JSON structure

At the top-level of `angular.json`, a few properties configure the workspace and a `projects` section contains the remaining per-project configuration options.
You can override Angular CLI defaults set at the workspace level through defaults set at the project level.
You can also override defaults set at the project level using the command line.

The following properties, at the top-level of the file, configure the workspace.

| Properties       | Details |
|:---              |:---     |
| `version`        | The configuration-file version.                                                                                                                                                                                                       |
| `newProjectRoot` | Path where new projects are created. Absolute or relative to the workspace directory.                                                                                                                                                    |
| `cli`            | A set of options that customize the [Angular CLI](cli). See the [Angular CLI configuration options](#cli-configuration-options) section.                                                                                                      |
| `schematics`     | A set of [schematics](guide/glossary#schematic) that customize the `ng generate` sub-command option defaults for this workspace. See the [Generation schematics](#schematics) section.                                                |
| `projects`       | Contains a subsection for each library or application in the workspace, with the per-project configuration options.                                                                                                       |

The initial application that you create with `ng new app_name` is listed under "projects":

<code-example language="json">

"projects": {
  "app_name": {
    &hellip;
  }
  &hellip;
}

</code-example>

When you create a library project with `ng generate library`, the library project is also added to the `projects` section.

<div class="alert is-helpful">

**NOTE**: <br />
The `projects` section of the configuration file does not correspond exactly to the workspace file structure.

*   The initial application created by `ng new` is at the top level of the workspace file structure
*   Other applications and libraries go into a `projects` directory in the workspace

For more information, see [Workspace and project file structure](guide/file-structure).

</div>

<a id="cli-configuration-options"></a>

## Angular CLI configuration options

The following configuration properties are a set of options that customize the Angular CLI.

| Property              | Details                                                                                       | Value type                                              |
|:---                   |:---                                                                                           |:---                                                     |
| `analytics`           | Share anonymous [usage data](cli/analytics) with the Angular Team.                            | `boolean` &verbar; `ci`                                 |
| `cache`               | Control [persistent disk cache](cli/cache) used by [Angular CLI Builders](guide/cli-builder). | [Cache options](#cache-options)                         |
| `schematicCollections`| A list of default schematics collections to use.                                              | `string[]`                                              |
| `packageManager`      | The preferred package manager tool to use.                                                    | `npm` &verbar; `cnpm` &verbar; `pnpm` &verbar;`yarn`    |
| `warnings`            | Control Angular CLI specific console warnings.                                                        | [Warnings options](#warnings-options)                   |


### Cache options

| Property      | Details                                               | Value type                           | Default value    |
|:---           | :---                                                  |:---                                  |:---              |
| `enabled`     | Configure whether disk caching is enabled.            | `boolean`                            | `true`           |
| `environment` | Configure in which environment disk cache is enabled. | `local` &verbar; `ci` &verbar; `all` | `local`          |
| `path`        | The directory used to stored cache results.           | `string`                             | `.angular/cache` |

### Warnings options

| Property          | Details                                                                         | Value type | Default value |
|:---               |:---                                                                             |:---        |:---           |
| `versionMismatch` | Show a warning when the global Angular CLI version is newer than the local one. | `boolean`  | `true`        |

## Project configuration options

The following top-level configuration properties are available for each project, under `projects:<project_name>`.

<code-example language="json">

"my-app": {
  "root": "",
  "sourceRoot": "src",
  "projectType": "application",
  "prefix": "app",
  "schematics": {},
  "architect": {}
}

</code-example>

| Property      | Details |
|:---           |:---     |
| `root`        | The root directory for this project's files, relative to the workspace directory. Empty for the initial application, which resides at the top level of the workspace. |
| `sourceRoot`  | The root directory for this project's source files.                                                                                                        |
| `projectType` | One of "application" or "library" An application can run independently in a browser, while a library cannot.                                           |
| `prefix`      | A string that Angular prepends to created selectors. Can be customized to identify an application or feature area.                                    |
| `schematics`  | A set of schematics that customize the `ng generate` sub-command option defaults for this project. See the [Generation schematics](#schematics) section.|
| `architect`   | Configuration defaults for Architect builder targets for this project.                                                                                  |

<a id="schematics"></a>

## Generation schematics

Angular generation [schematics](guide/glossary#schematic) are instructions for modifying a project by adding files or modifying existing files.
Individual schematics for the default Angular CLI `ng generate` sub-commands are collected in the package `@schematics/angular`.
Specify the schematic name for a subcommand in the format `schematic-package:schematic-name`;
for example, the schematic for generating a component is `@schematics/angular:component`.

The JSON schemas for the default schematics used by the Angular CLI to create projects and parts of projects are collected in the package [`@schematics/angular`](https://github.com/angular/angular-cli/blob/main/packages/schematics/angular/application/schema.json).
The schema describes the options available to the Angular CLI for each of the `ng generate` sub-commands, as shown in the `--help` output.

The fields given in the schema correspond to the allowed argument values and defaults for the Angular CLI sub-command options.
You can update your workspace schema file to set a different default for a sub-command option.

<a id="architect"></a>

## Project tool configuration options

Architect is the tool that the Angular CLI uses to perform complex tasks, such as compilation and test running.
Architect is a shell that runs a specified [builder](guide/glossary#builder) to perform a given task, according to a [target](guide/glossary#target) configuration.
You can define and configure new builders and targets to extend the Angular CLI.
See [Angular CLI Builders](guide/cli-builder).

<a id="default-build-targets"></a>

### Default Architect builders and targets

Angular defines default builders for use with specific commands, or with the general `ng run` command.
The JSON schemas that define the options and defaults for each of these default builders are collected in the [`@angular-devkit/build-angular`](https://github.com/angular/angular-cli/blob/main/packages/angular_devkit/build_angular/builders.json) package.
The schemas configure options for the following builders.

<!-- vale Angular.Google_WordListWarnings = NO -->

*   [app-shell](https://github.com/angular/angular-cli/blob/main/packages/angular_devkit/build_angular/src/builders/app-shell/schema.json)
*   [browser](https://github.com/angular/angular-cli/blob/main/packages/angular_devkit/build_angular/src/builders/browser/schema.json)
*   [dev-server](https://github.com/angular/angular-cli/blob/main/packages/angular_devkit/build_angular/src/builders/dev-server/schema.json)
*   [extract-i18n](https://github.com/angular/angular-cli/blob/main/packages/angular_devkit/build_angular/src/builders/extract-i18n/schema.json)
*   [karma](https://github.com/angular/angular-cli/blob/main/packages/angular_devkit/build_angular/src/builders/karma/schema.json)
*   [server](https://github.com/angular/angular-cli/blob/main/packages/angular_devkit/build_angular/src/builders/server/schema.json)

<!-- vale Angular.Google_WordListWarnings = YES -->

### Configuring builder targets

The `architect` section of `angular.json` contains a set of Architect targets.
Many of the targets correspond to the Angular CLI commands that run them.
Some extra predefined targets can be run using the `ng run` command, and you can define your own targets.

Each target object specifies the `builder` for that target, which is the npm package for the tool that Architect runs.
Each target also has an `options` section that configures default options for the target, and a `configurations` section that names and specifies alternative configurations for the target.
See the example in [Build target](#build-target) below.

<code-example language="json">

"architect": {
  "build": {},
  "serve": {},
  "e2e" : {},
  "test": {},
  "lint": {},
  "extract-i18n": {},
  "server": {},
  "app-shell": {}
}

</code-example>

| Sections                 | Details |
|:---                      |:---     |
| `architect/build`        | Configures defaults for options of the `ng build` command. See the [Build target](#build-target) section for more information.                                                                                   |
| `architect/serve`        | Overrides build defaults and supplies extra serve defaults for the `ng serve` command. Besides the options available for the `ng build` command, it adds options related to serving the application. |
| `architect/e2e`          | Overrides build-option defaults for building end-to-end testing applications using the `ng e2e` command.                                                                                                         |
| `architect/test`         | Overrides build-option defaults for test builds and supplies extra test-running defaults for the `ng test` command.                                                                                         |
| `architect/lint`         | Configures defaults for options of the `ng lint` command, which performs code analysis on project source files.                                                                                                  |
| `architect/extract-i18n` | Configures defaults for options of the `ng extract-i18n` command, which extracts marked message strings from source code and outputs translation files.                                                          |
| `architect/server`       | Configures defaults for creating a Universal application with server-side rendering, using the `ng run <project>:server` command.                                                                                |
| `architect/app-shell`    | Configures defaults for creating an application shell for a progressive web application \(PWA\), using the `ng run <project>:app-shell` command.                                                                 |

In general, the options for which you can configure defaults correspond to the command options listed in the [Angular CLI reference page](cli) for each command.

<div class="alert is-helpful">

**NOTE**: <br />
All options in the configuration file must use [camelCase](guide/glossary#case-conventions), rather than dash-case.

</div>

<a id="build-target"></a>

## Build target

The `architect/build` section configures defaults for options of the `ng build` command.
It has the following top-level properties.

| PROPERTY        | Details                                                                                                                                                                                                                                                                                                              |
|:---             |:---                                                                                                                                                                                                                                                                                                                      |
| `builder`       | The npm package for the build tool used to create this target. The default builder for an application \(`ng build myApp`\) is `@angular-devkit/build-angular:browser`, which uses the [webpack](https://webpack.js.org) package bundler. <div class="alert is-helpful"> **NOTE**: A different builder is used for building a library \(`ng build myLib`\). </div> |
| `options`       | This section contains default build target options, used when no named alternative configuration is specified. See the [Default build targets](#default-build-targets) section.                                                                                                                                                |
| `configurations`| This section defines and names alternative configurations for different intended destinations. It contains a section for each named configuration, which sets the default options for that intended environment. See the [Alternate build configurations](#build-configs) section.                                             |

<a id="build-configs"></a>

### Alternate build configurations

Angular CLI comes with two build configurations: `production` and `development`.
By default, the `ng build` command uses the `production` configuration, which applies several build optimizations, including:

*   Bundling files
*   Minimizing excess whitespace
*   Removing comments and dead code
*   Rewriting code to use short, mangled names, also known as minification

You can define and name extra alternate configurations \(such as `stage`, for instance\) appropriate to your development process.
Some examples of different build configurations are `stable`, `archive`, and `next` used by Angular.io itself, and the individual locale-specific configurations required for building localized versions of an application.
For details, see [Internationalization (i18n)][AioGuideI18nCommonMerge].

You can select an alternate configuration by passing its name to the `--configuration` command line flag.

You can also pass in more than one configuration name as a comma-separated list.
For example, to apply both `stage` and `fr` build configurations, use the command `ng build --configuration stage,fr`.
In this case, the command parses the named configurations from left to right.
If multiple configurations change the same setting, the last-set value is the final one.
In this example, if both `stage` and `fr` configurations set the output path the value in `fr` would get used.

<a id="build-props"></a>

### Extra build and test options

The configurable options for a default or targeted build generally correspond to the options available for the [`ng build`](cli/build), [`ng serve`](cli/serve), and [`ng test`](cli/test) commands.
For details of those options and their possible values, see the [Angular CLI Reference](cli).

Some extra options can only be set through the configuration file, either by direct editing or with the [`ng config`](cli/config) command.

| Options properties         | Details |
|:---                        |:---     |
| `assets`                   | An object containing paths to static assets to add to the global context of the project. The default paths point to the project's icon file and its `assets` directory. See more in the [Assets configuration](#asset-config) section.                                                                     |
| `styles`                   | An array of style files to add to the global context of the project. Angular CLI supports CSS imports and all major CSS preprocessors: [sass/scss](https://sass-lang.com) and [less](http://lesscss.org). See more in the [Styles and scripts configuration](#style-script-config) section.             |
| `stylePreprocessorOptions` | An object containing option-value pairs to pass to style preprocessors. See more in the [Styles and scripts configuration](#style-script-config) section.                                                                                                                                               |
| `scripts`                  | An object containing JavaScript script files to add to the global context of the project. The scripts are loaded exactly as if you had added them in a `<script>` tag inside `index.html`. See more in the [Styles and scripts configuration](#style-script-config) section.                            |
| `budgets`                  | Default size-budget type and thresholds for all or parts of your application. You can configure the builder to report a warning or an error when the output reaches or exceeds a threshold size. See [Configure size budgets](guide/build#configure-size-budgets). \(Not available in `test` section.\) |
| `fileReplacements`         | An object containing files and their compile-time replacements. See more in [Configure target-specific file replacements](guide/build#configure-target-specific-file-replacements).                                                                                                                     |
`index`                    | Configures the generation of the application's HTML index. See more in [Index configuration](#index-config). \(Only available in `browser` section.\)                                                                                                         |                                                                                                        |                                                                                                      


<a id="complex-config"></a>

## Complex configuration values

The `assets`, `index`, `styles`, and `scripts` options can have either simple path string values, or object values with specific fields.
The `sourceMap` and `optimization` options can be set to a simple Boolean value with a command flag. They can also be given a complex value using the configuration file.

The following sections provide more details of how these complex values are used in each case.

<a id="asset-config"></a>

### Assets configuration

Each `build` target configuration can include an `assets` array that lists files or folders you want to copy as-is when building your project.
By default, the `src/assets/` directory and `src/favicon.ico` are copied over.

<code-example language="json">

"assets": [
  "src/assets",
  "src/favicon.ico"
]

</code-example>

<!-- vale off -->

To exclude an asset, you can remove it from the assets configuration.

You can further configure assets to be copied by specifying assets as objects, rather than as simple paths relative to the workspace root.
An asset specification object can have the following fields.

| Fields           | Details |
|:---              |:---     |
| `glob`           | A [node-glob](https://github.com/isaacs/node-glob/blob/master/README.md) using `input` as base directory.                                                              |
| `input`          | A path relative to the workspace root.                                                                                                                                 |
| `output`         | A path relative to `outDir` \(default is `dist/project-name`\). Because of the security implications, the Angular CLI never writes files outside of the project output path. |
| `ignore`         | A list of globs to exclude.                                                                                                                                            |
| `followSymlinks` | Allow glob patterns to follow symlink directories. This allows subdirectories of the symlink to be searched. Defaults to `false`.                                      |

For example, the default asset paths can be represented in more detail using the following objects.

<!-- vale on -->

<code-example language="json">

"assets": [
  {
    "glob": "**/*",
    "input": "src/assets/",
    "output": "/assets/"
  },
  {
    "glob": "favicon.ico",
    "input": "src/",
    "output": "/"
  }
]

</code-example>

You can use this extended configuration to copy assets from outside your project.
For example, the following configuration copies assets from a node package:

<code-example language="json">

"assets": [
  {
    "glob": "**/*",
    "input": "./node_modules/some-package/images",
    "output": "/some-package/"
  }
]

</code-example>

<!-- vale Angular.Google_Will = NO -->

The contents of `node_modules/some-package/images/` will be available in `dist/some-package/`.

<!-- vale Angular.Google_Will = YES -->

The following example uses the `ignore` field to exclude certain files in the assets directory from being copied into the build:

<code-example language="json">

"assets": [
  {
    "glob": "**/*",
    "input": "src/assets/",
    "ignore": ["**/*.svg"],
    "output": "/assets/"
  }
]

</code-example>

<a id="style-script-config"></a>

### Styles and scripts configuration

An array entry for the `styles` and `scripts` options can be a simple path string, or an object that points to an extra entry-point file.
The associated builder loads that file and its dependencies as a separate bundle during the build.
With a configuration object, you have the option of naming the bundle for the entry point, using a `bundleName` field.

The bundle is injected by default, but you can set `inject` to `false` to exclude the bundle from injection.
For example, the following object values create and name a bundle that contains styles and scripts, and excludes it from injection:

<code-example language="json">

"styles": [
  {
    "input": "src/external-module/styles.scss",
    "inject": false,
    "bundleName": "external-module"
  }
],
"scripts": [
  {
    "input": "src/external-module/main.js",
    "inject": false,
    "bundleName": "external-module"
  }
]

</code-example>

You can mix simple and complex file references for styles and scripts.

<code-example language="json">

"styles": [
  "src/styles.css",
  "src/more-styles.css",
  { "input": "src/lazy-style.scss", "inject": false },
  { "input": "src/pre-rename-style.scss", "bundleName": "renamed-style" },
]

</code-example>

<a id="style-preprocessor"></a>

#### Style preprocessor options

In Sass you can make use of the `includePaths` feature for both component and global styles. This allows you to add extra base paths that are checked for imports.

To add paths, use the `stylePreprocessorOptions` option:

<code-example language="json">

"stylePreprocessorOptions": {
  "includePaths": [
    "src/style-paths"
  ]
}

</code-example>

Files in that directory, such as `src/style-paths/_variables.scss`, can be imported from anywhere in your project without the need for a relative path:

<code-example language="typescript">

// src/app/app.component.scss
// A relative path works
&commat;import '../style-paths/variables';
// But now this works as well
&commat;import 'variables';

</code-example>

<div class="alert is-helpful">

**NOTE**: <br />
You also need to add any styles or scripts to the `test` builder if you need them for unit tests.
See also [Using runtime-global libraries inside your application](guide/using-libraries#using-runtime-global-libraries-inside-your-app).

</div>

### Optimization configuration

The `optimization` browser builder option can be either a Boolean or an Object for more fine-tune configuration.
This option enables various optimizations of the build output, including:

<!-- vale Angular.Angular_Spelling = NO-->

*   Minification of scripts and styles
*   Tree-shaking
*   Dead-code elimination
*   Inlining of critical CSS
*   Fonts inlining

<!-- vale Angular.Angular_Spelling = YES-->

Several options can be used to fine-tune the optimization of an application.

| Options   | Details                                                                                                               | Value type                                                                     | Default value |
|:---       |:---                                                                                                                   |:---                                                                            |:---           |
| `scripts` | Enables optimization of the scripts output.                                                                           | `boolean`                                                                      | `true`        |
| `styles`  | Enables optimization of the styles output.                                                                            | `boolean` &verbar; [Styles optimization options](#styles-optimization-options) | `true`        |
| `fonts`   | Enables optimization for fonts. <div class="alert is-helpful"> **NOTE**: <br /> This requires internet access. </div> | `boolean` &verbar; [Fonts optimization options](#fonts-optimization-options)   | `true`        |

#### Styles optimization options

<!-- vale Angular.Angular_Spelling = NO -->

| Options          | Details                                                                                                                  | Value type | Default value |
|:---              |:---                                                                                                                      |:---        |:---           |
| `minify`         | Minify CSS definitions by removing extraneous whitespace and comments, merging identifiers, and minimizing values.        | `boolean`  | `true`        |
| `inlineCritical` | Extract and inline critical CSS definitions to improve [First Contentful Paint](https://web.dev/first-contentful-paint). | `boolean`  | `true`        |

#### Fonts optimization options

| Options  | Details                                                                                                                                                                                                                                                                    | Value type | Default value |
|:---      |:---                                                                                                                                                                                                                                                                        |:---        |:---           |
| `inline` | Reduce [render blocking requests](https://web.dev/render-blocking-resources) by inlining external Google Fonts and Adobe Fonts CSS definitions in the application's HTML index file. <div class="alert is-helpful"> **NOTE**: <br /> This requires internet access. </div> | `boolean`  | `true`        |

<!-- vale Angular.Angular_Spelling = YES -->

You can supply a value such as the following to apply optimization to one or the other:

<code-example language="json">

"optimization": {
  "scripts": true,
  "styles": {
    "minify": true,
    "inlineCritical": true
  },
  "fonts": true
}

</code-example>

<div class="alert is-helpful">

For [Universal](guide/glossary#universal), you can reduce the code rendered in the HTML page by setting styles optimization to `true`.

</div>

### Source map configuration

The `sourceMap` browser builder option can be either a Boolean or an Object for more fine-tune configuration to control the source maps of an application.

| Options   | Details                                            | Value type | Default value |
|:---       |:---                                                |:---        |:---           |
| `scripts` | Output source maps for all scripts.                | `boolean`  | `true`        |
| `styles`  | Output source maps for all styles.                 | `boolean`  | `true`        |
| `vendor`  | Resolve vendor packages source maps.               | `boolean`  | `false`       |
| `hidden`  | Output source maps used for error reporting tools. | `boolean`  | `false`       |

The example below shows how to toggle one or more values to configure the source map outputs:

<code-example language="json">

"sourceMap": {
  "scripts": true,
  "styles": false,
  "hidden": true,
  "vendor": true
}

</code-example>

<div class="alert is-helpful">

When using hidden source maps, source maps are not referenced in the bundle.
These are useful if you only want source maps to map error stack traces in error reporting tools. Hidden source maps don't expose your source maps in the browser developer tools.

</div>

<a id="index-config"></a>

### Index configuration

Configures the generation of the application's HTML index.

The `index` option can be either a String or an Object for more fine-tune configuration.

When supplying the value as a String the filename of the specified path will be used for the generated file and will be created in the root of the application's configured output path.

#### Index options
| Options  | Details                                                                                                                                                                          | Value type | Default value |
|:---      |:---                                                                                                                                                                              |:---        |:---           |
| `input`  | The path of a file to use for the application's generated HTML index.                                                                                                            | `string`   |               |
| `output` | The output path of the application's generated HTML index file. The full provided path will be used and will be considered relative to the application's configured output path. | `string`   | `index.html`  |


<!-- links -->

[AioGuideI18nCommonMerge]: guide/i18n-common-merge "Common Internationalization task #6: Merge translations into the application | Angular"

<!-- external links -->

<!-- end links -->

@reviewed 2022-02-28