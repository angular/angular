# Angular workspace configuration

The `angular.json` file at the root level of an Angular workspace provides workspace-wide and project-specific configuration defaults. These are used for build and development tools provided by the Angular CLI.
Path values given in the configuration are relative to the root workspace directory.

## General JSON structure

At the top-level of `angular.json`, a few properties configure the workspace and a `projects` section contains the remaining per-project configuration options.
You can override Angular CLI defaults set at the workspace level through defaults set at the project level.
You can also override defaults set at the project level using the command line.

The following properties, at the top-level of the file, configure the workspace.

| Properties       | Details                                                                                                                                                                                        |
|:---              |:---                                                                                                                                                                                            |
| `version`        | The configuration-file version.                                                                                                                                                                |
| `newProjectRoot` | Path where new projects are created through tools like `ng generate application` or `ng generate library`. Path can be absolute or relative to the workspace directory. Defaults to `projects` |
| `cli`            | A set of options that customize the [Angular CLI](tools/cli). See [Angular CLI configuration options](#angular-cli-configuration-options) below.                                               |
| `schematics`     | A set of [schematics](tools/cli/schematics) that customize the `ng generate` sub-command option defaults for this workspace. See [schematics](#schematics) below.                              |
| `projects`       | Contains a subsection for each application or library in the workspace, with project-specific configuration options.                                                                           |

The initial application that you create with `ng new app-name` is listed under "projects":

When you create a library project with `ng generate library`, the library project is also added to the `projects` section.

HELPFUL: The `projects` section of the configuration file does not correspond exactly to the workspace file structure.
<!-- markdownlint-disable-next-line MD032 -->
* The initial application created by `ng new` is at the top level of the workspace file structure.
* Other applications and libraries are under the `projects` directory by default.

For more information, see [Workspace and project file structure](reference/configs/file-structure).

## Angular CLI configuration options

The following properties are a set of options that customize the Angular CLI.

| Property              | Details                                                                                                                                                                    | Value type                                  | Default value |
|:---                   |:---                                                                                                                                                                        |:---                                         |:---           |
| `analytics`           | Share anonymous usage data with the Angular Team. A boolean value indicates whether or not to share data, while a UUID string shares data using a pseudonymous identifier. | `boolean` \| `string`                       | `false`       |
| `cache`               | Control [persistent disk cache](cli/cache) used by [Angular CLI Builders](tools/cli/cli-builder).                                                                          | [Cache options](#cache-options)             | `{}`          |
| `schematicCollections`| List schematics collections to use in `ng generate`.                                                                                                                       | `string[]`                                  | `[]`          |
| `packageManager`      | The preferred package manager tool to use.                                                                                                                                 | `npm` \| `cnpm` \| `pnpm` \| `yarn`\| `bun` | `npm`         |
| `warnings`            | Control Angular CLI specific console warnings.                                                                                                                             | [Warnings options](#warnings-options)       | `{}`          |

### Cache options

| Property      | Details                                                                                                                                                                                                                                      | Value type               | Default value    |
|:---           |:---                                                                                                                                                                                                                                          |:---                      |:---              |
| `enabled`     | Configure whether disk caching is enabled for builds.                                                                                                                                                                                        | `boolean`                | `true`           |
| `environment` | Configure in which environment disk cache is enabled.<br><br>* `ci` enables caching only in continuous integration (CI) environments.<br>* `local` enables caching only *outside* of CI environments.<br>* `all` enables caching everywhere. | `local` \| `ci` \| `all` | `local`          |
| `path`        | The directory used to stored cache results.                                                                                                                                                                                                  | `string`                 | `.angular/cache` |

### Warnings options

| Property          | Details                                                                         | Value type | Default value |
|:---               |:---                                                                             |:---        |:---           |
| `versionMismatch` | Show a warning when the global Angular CLI version is newer than the local one. | `boolean`  | `true`        |

## Project configuration options

The following top-level configuration properties are available for each project, under `projects['project-name']`.

| Property      | Details                                                                                                                                                                              | Value type                                                      | Default value   |
|:---           |:---                                                                                                                                                                                  |:---                                                             |:---             |
| `root`        | The root directory for this project's files, relative to the workspace directory. Empty for the initial application, which resides at the top level of the workspace.                | `string`                                                        | None (required) |
| `projectType` | One of "application" or "library" An application can run independently in a browser, while a library cannot.                                                                         | `application` \| `library`                                      | None (required) |
| `sourceRoot`  | The root directory for this project's source files.                                                                                                                                  | `string`                                                        | `''`            |
| `prefix`      | A string that Angular prepends to selectors when generating new components, directives, and pipes using `ng generate`. Can be customized to identify an application or feature area. | `string`                                                        | `'app'`         |
| `schematics`  | A set of schematics that customize the `ng generate` sub-command option defaults for this project. See the [Generation schematics](#schematics) section.                             | See [schematics](#schematics)                                   | `{}`            |
| `architect`   | Configuration defaults for Architect builder targets for this project.                                                                                                               | See [Configuring builder targets](#configuring-builder-targets) | `{}`            |

## Schematics

[Angular schematics](tools/cli/schematics) are instructions for modifying a project by adding new files or modifying existing files.
These can be configured by mapping the schematic name to a set of default options.

The "name" of a schematic is in the format: `<schematic-package>:<schematic-name>`.
Schematics for the default Angular CLI `ng generate` sub-commands are collected in the package [`@schematics/angular`](https://github.com/angular/angular-cli/blob/main/packages/schematics/angular/application/schema.json).
For example, the schematic for generating a component with `ng generate component` is `@schematics/angular:component`.

The fields given in the schematic's schema correspond to the allowed command-line argument values and defaults for the Angular CLI sub-command options.
You can update your workspace schema file to set a different default for a sub-command option. For example, to disable `standalone` in `ng generate component` by default:

<docs-code language="json">

{
  "projects": {
    "my-app": {
      "schematics": {
        "@schematics/angular:component": {
          "standalone": false
        }
      }
    }
  }
}

</docs-code>

## Configuring CLI builders

Architect is the tool that the Angular CLI uses to perform complex tasks, such as compilation and test running.
Architect is a shell that runs a specified builder to perform a given task, according to a target configuration.
You can define and configure new builders and targets to extend the Angular CLI.
See [Angular CLI Builders](tools/cli/cli-builder).

### Default Architect builders and targets

Angular defines default builders for use with specific commands, or with the general `ng run` command.
The JSON schemas that define the options and defaults for each of these builders are collected in the [`@angular-devkit/build-angular`](https://github.com/angular/angular-cli/blob/main/packages/angular_devkit/build_angular/builders.json) package.
The schemas configure options for the following builders.

### Configuring builder targets

The `architect` section of `angular.json` contains a set of Architect targets.
Many of the targets correspond to the Angular CLI commands that run them.
Other targets can be executed using the `ng run` command, and you can define your own targets.

Each target object specifies the `builder` for that target, which is the npm package for the tool that Architect runs.
Each target also has an `options` section that configures default options for the target, and a `configurations` section that names and specifies alternative configurations for the target.
See the example in [Build target](#build-target) below.

| Property       | Details                                                                                                                                                                                              |
|:---            |:---                                                                                                                                                                                                  |
| `build`        | Configures defaults for options of the `ng build` command. See the [Build target](#build-target) section for more information.                                                                       |
| `serve`        | Overrides build defaults and supplies extra serve defaults for the `ng serve` command. Besides the options available for the `ng build` command, it adds options related to serving the application. |
| `e2e`          | Overrides build defaults for building end-to-end testing applications using the `ng e2e` command.                                                                                                    |
| `test`         | Overrides build defaults for test builds and supplies extra test-running defaults for the `ng test` command.                                                                                         |
| `lint`         | Configures defaults for options of the `ng lint` command, which performs static code analysis on project source files.                                                                               |
| `extract-i18n` | Configures defaults for options of the `ng extract-i18n` command, which extracts localized message strings from source code and outputs translation files for internationalization.                  |

HELPFUL: All options in the configuration file must use `camelCase`, rather than `dash-case` as used on the command line.

## Build target

Each target under `architect` has the following properties:

| Property        | Details                                                                                                                                                                                                                                                |
|:---             |:---                                                                                                                                                                                                                                                    |
| `builder`       | The CLI builder used to create this target in the form of `<package-name>:<builder-name>`.                                                                                                                                                             |
| `options`       | Build target default options.                                                                                                                                                                                                                          |
| `configurations`| Alternative configurations for executing the target. Each configuration sets the default options for that intended environment, overriding the associated value under `options`. See [Alternate build configurations](#alternate-build-configurations) below. |

For example, to configure a build with optimizations disabled:

<docs-code language="json">

{
  "projects": {
    "my-app": {
      "architect": {
        "build": {
          "builder": "@angular-devkit/build-angular:application",
          "options": {
            "optimization": false
          }
        }
      }
    }
  }
}

</docs-code>

### Alternate build configurations

Angular CLI comes with two build configurations: `production` and `development`.
By default, the `ng build` command uses the `production` configuration, which applies several build optimizations, including:

* Bundling files
* Minimizing excess whitespace
* Removing comments and dead code
* Minifying code to use short, mangled names

You can define and name extra alternate configurations (such as `staging`, for instance) appropriate to your development process.
You can select an alternate configuration by passing its name to the `--configuration` command line flag.

For example, to configure a build where optimization is enabled only for production builds (`ng build --configuration production`):

<docs-code language="json">

{
  "projects": {
    "my-app": {
      "architect": {
        "build": {
          "builder": "@angular-devkit/build-angular:application",
          "options": {
            "optimization": false
          },
          "configurations": {
            "production": {
              "optimization": true
            }
          }
        }
      }
    }
  }
}

</docs-code>

You can also pass in more than one configuration name as a comma-separated list.
For example, to apply both `staging` and `french` build configurations, use the command `ng build --configuration staging,french`.
In this case, the command parses the named configurations from left to right.
If multiple configurations change the same setting, the last-set value is the final one.
In this example, if both `staging` and `french` configurations set the output path, the value in `french` would get used.

### Extra build and test options

The configurable options for a default or targeted build generally correspond to the options available for the [`ng build`](cli/build), [`ng serve`](cli/serve), and [`ng test`](cli/test) commands.
For details of those options and their possible values, see the [Angular CLI Reference](cli).

| Options properties         | Details                                                                                                                                                                                                                                                                |
|:---                        |:---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `assets`                   | An object containing paths to static assets to serve with the application. The default paths point to the project's `public` directory. See more in the [Assets configuration](#assets-configuration) section.                                       |
| `styles`                   | An array of CSS files to add to the global context of the project. Angular CLI supports CSS imports and all major CSS preprocessors. See more in the [Styles and scripts configuration](#styles-and-scripts-configuration) section.                                    |
| `stylePreprocessorOptions` | An object containing option-value pairs to pass to style preprocessors. See more in the [Styles and scripts configuration](#styles-and-scripts-configuration) section.                                                                                                 |
| `scripts`                  | An object containing JavaScript files to add to the application. The scripts are loaded exactly as if you had added them in a `<script>` tag inside `index.html`. See more in the [Styles and scripts configuration](#styles-and-scripts-configuration) section.       |
| `budgets`                  | Default size-budget type and thresholds for all or parts of your application. You can configure the builder to report a warning or an error when the output reaches or exceeds a threshold size. See [Configure size budgets](tools/cli/build#configure-size-budgets). |
| `fileReplacements`         | An object containing files and their compile-time replacements. See more in [Configure target-specific file replacements](tools/cli/build#configure-target-specific-file-replacements).                                                                                |
| `index`                    | A base HTML document which loads the application. See more in [Index configuration](#index-configuration).                                                                                                                                                                    |

## Complex configuration values

The `assets`, `index`, `outputPath`, `styles`, and `scripts` options can have either simple path string values, or object values with specific fields.
The `sourceMap` and `optimization` options can be set to a simple boolean value. They can also be given a complex value using the configuration file.

The following sections provide more details of how these complex values are used in each case.

### Assets configuration

Each `build` target configuration can include an `assets` array that lists files or folders you want to copy as-is when building your project.
By default, the contents of the `public/` directory are copied over.

To exclude an asset, you can remove it from the assets configuration.

You can further configure assets to be copied by specifying assets as objects, rather than as simple paths relative to the workspace root.
An asset specification object can have the following fields.

| Fields           | Details                                                                                                                                   |
|:---              |:---                                                                                                                                       |
| `glob`           | A [node-glob](https://github.com/isaacs/node-glob/blob/master/README.md) using `input` as base directory.                                 |
| `input`          | A path relative to the workspace root.                                                                                                    |
| `output`         | A path relative to `outDir`. Because of the security implications, the Angular CLI never writes files outside of the project output path. |
| `ignore`         | A list of globs to exclude.                                                                                                               |
| `followSymlinks` | Allow glob patterns to follow symlink directories. This allows subdirectories of the symlink to be searched. Defaults to `false`.         |

For example, the default asset paths can be represented in more detail using the following objects.

<docs-code language="json">

{
  "projects": {
    "my-app": {
      "architect": {
        "build": {
          "builder": "@angular-devkit/build-angular:application",
          "options": {
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
          }
        }
      }
    }
  }
}

</docs-code>

The following example uses the `ignore` field to exclude certain files in the assets directory from being copied into the build:

<docs-code language="json">

{
  "projects": {
    "my-app": {
      "architect": {
        "build": {
          "builder": "@angular-devkit/build-angular:application",
          "options": {
            "assets": [
              {
                "glob": "**/*",
                "input": "src/assets/",
                "ignore": ["**/*.svg"],
                "output": "/assets/"
              }
            ]
          }
        }
      }
    }
  }
}

</docs-code>

### Styles and scripts configuration

An array entry for the `styles` and `scripts` options can be a simple path string, or an object that points to an extra entry-point file.
The associated builder loads that file and its dependencies as a separate bundle during the build.
With a configuration object, you have the option of naming the bundle for the entry point, using a `bundleName` field.

The bundle is injected by default, but you can set `inject` to `false` to exclude the bundle from injection.
For example, the following object values create and name a bundle that contains styles and scripts, and excludes it from injection:

<docs-code language="json">

{
  "projects": {
    "my-app": {
      "architect": {
        "build": {
          "builder": "@angular-devkit/build-angular:application",
          "options": {
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
          }
        }
      }
    }
  }
}

</docs-code>

#### Style preprocessor options

In Sass, you can make use of the `includePaths` feature for both component and global styles. This allows you to add extra base paths that are checked for imports.

To add paths, use the `stylePreprocessorOptions` option:

<docs-code language="json">

{
  "projects": {
    "my-app": {
      "architect": {
        "build": {
          "builder": "@angular-devkit/build-angular:application",
          "options": {
            "stylePreprocessorOptions": {
              "includePaths": [
                "src/style-paths"
              ]
            }
          }
        }
      }
    }
  }
}

</docs-code>

Files in that directory, such as `src/style-paths/_variables.scss`, can be imported from anywhere in your project without the need for a relative path:

<docs-code language="scss">

// src/app/app.component.scss
// A relative path works
@import '../style-paths/variables';

// But now this works as well
@import 'variables';

</docs-code>

HELPFUL: You also need to add any styles or scripts to the `test` builder if you need them for unit tests.
See also [Using runtime-global libraries inside your application](tools/libraries/using-libraries#using-runtime-global-libraries-inside-your-app).

### Optimization configuration

The `optimization` option can be either a boolean or an object for more fine-tune configuration.
This option enables various optimizations of the build output, including:

* Minification of scripts and styles
* Tree-shaking
* Dead-code elimination
* Inlining of critical CSS
* Fonts inlining

Several options can be used to fine-tune the optimization of an application.

| Options   | Details                                                        | Value type                                                                     | Default value |
|:---       |:---                                                            |:---                                                                            |:---           |
| `scripts` | Enables optimization of the scripts output.                    | `boolean`                                                                      | `true`        |
| `styles`  | Enables optimization of the styles output.                     | `boolean` \| [Styles optimization options](#styles-optimization-options) | `true`        |
| `fonts`   | Enables optimization for fonts. This requires internet access. | `boolean` \| [Fonts optimization options](#fonts-optimization-options)   | `true`        |

#### Styles optimization options

| Options          | Details                                                                                                                  | Value type | Default value |
|:---              |:---                                                                                                                      |:---        |:---           |
| `minify`         | Minify CSS definitions by removing extraneous whitespace and comments, merging identifiers, and minimizing values.       | `boolean`  | `true`        |
| `inlineCritical` | Extract and inline critical CSS definitions to improve [First Contentful Paint](https://web.dev/first-contentful-paint). | `boolean`  | `true`        |
| `removeSpecialComments` | Remove comments in global CSS that contains `@license` or `@preserve` or that starts with `//!` or `/*!`.         | `boolean`  | `true`        |

#### Fonts optimization options

| Options  | Details                                                                                                                                                                                                             | Value type | Default value |
|:---      |:---                                                                                                                                                                                                                 |:---        |:---           |
| `inline` | Reduce [render blocking requests](https://web.dev/render-blocking-resources) by inlining external Google Fonts and Adobe Fonts CSS definitions in the application's HTML index file. This requires internet access. | `boolean`  | `true`        |

You can supply a value such as the following to apply optimization to one or the other:

<docs-code language="json">

{
  "projects": {
    "my-app": {
      "architect": {
        "build": {
          "builder": "@angular-devkit/build-angular:application",
          "options": {
            "optimization": {
              "scripts": true,
              "styles": {
                "minify": true,
                "inlineCritical": true
              },
              "fonts": true
            }
          }
        }
      }
    }
  }
}

</docs-code>

### Source map configuration

The `sourceMap` builder option can be either a boolean or an object for more fine-tune configuration to control the source maps of an application.

| Options   | Details                                             | Value type | Default value |
|:---       |:---                                                 |:---        |:---           |
| `scripts` | Output source maps for all scripts.                 | `boolean`  | `true`        |
| `styles`  | Output source maps for all styles.                  | `boolean`  | `true`        |
| `vendor`  | Resolve vendor packages source maps.                | `boolean`  | `false`       |
| `hidden`  | Omit link to sourcemaps from the output JavaScript. | `boolean`  | `false`       |

The example below shows how to toggle one or more values to configure the source map outputs:

<docs-code language="json">

{
  "projects": {
    "my-app": {
      "architect": {
        "build": {
          "builder": "@angular-devkit/build-angular:application",
          "options": {
            "sourceMap": {
              "scripts": true,
              "styles": false,
              "hidden": true,
              "vendor": true
            }
          }
        }
      }
    }
  }
}

</docs-code>

HELPFUL: When using hidden source maps, source maps are not referenced in the bundle.
These are useful if you only want source maps to map stack traces in error reporting tools without showing up in browser developer tools.
Note that even though `hidden` prevents the source map from being linked in the output bundle, your deployment process must take care not to serve the generated sourcemaps in production, or else the information is still leaked.

### Index configuration

Configures generation of the application's HTML index.

The `index` option can be either a string or an object for more fine-tune configuration.

When supplying the value as a string the filename of the specified path will be used for the generated file and will be created in the root of the application's configured output path.

#### Index options

| Options  | Details                                                                                                                                                                          | Value type | Default value   |
|:---      |:---                                                                                                                                                                              |:---        |:---             |
| `input`  | The path of a file to use for the application's generated HTML index.                                                                                                            | `string`   | None (required) |
| `output` | The output path of the application's generated HTML index file. The full provided path will be used and will be considered relative to the application's configured output path. | `string`   | `index.html`    |

### Output path configuration

The `outputPath` option can be either a String which will be used as the `base` value or an Object for more fine-tune configuration.

Several options can be used to fine-tune the output structure of an application.

| Options   | Details                                                                            | Value type | Default value |
|:---       |:---                                                                                |:---        |:---           |
| `base`    | Specify the output path relative to workspace root.                                | `string`   |               |
| `browser` | The output directory name for your browser build is within the base output path. This can be safely served to users.       | `string`   | `browser`     |
| `server`  | The output directory name of your server build within the output path base.        | `string`   | `server`      |
| `media`   | The output directory name for your media files located within the output browser directory. These media files are commonly referred to as resources in CSS files. | `string`   | `media`       |
