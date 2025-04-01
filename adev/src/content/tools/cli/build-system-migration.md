# Angular application build system

In v17 and higher, the new build system provides an improved way to build Angular applications. This new build system includes:

- A modern output format using ESM, with dynamic import expressions to support lazy module loading.
- Faster build-time performance for both initial builds and incremental rebuilds.
- Newer JavaScript ecosystem tools such as [esbuild](https://esbuild.github.io/) and [Vite](https://vitejs.dev/).
- Integrated SSR and prerendering capabilities.
- Automatic global and component stylesheet hot replacement.

This new build system is stable and fully supported for use with Angular applications.
You can migrate to the new build system with applications that use the `browser` builder.
If using a custom builder, please refer to the documentation for that builder on possible migration options.

IMPORTANT: The existing webpack-based build system is still considered stable and fully supported.
Applications can continue to use the `browser` builder and projects can opt-out of migrating during an update.

## For new applications

New applications will use this new build system by default via the `application` builder.

## For existing applications

Both automated and manual procedures are available depending on the requirements of the project.
Starting with v18, the update process will ask if you would like to migrate existing applications to use the new build system via the automated migration.
Prior to migrating, please consider reviewing the [Known Issues](#known-issues) section as it may contain relevant information for your project.

HELPFUL: Remember to remove any CommonJS assumptions in the application server code if using SSR such as `require`, `__filename`, `__dirname`, or other constructs from the [CommonJS module scope](https://nodejs.org/api/modules.html#the-module-scope). All application code should be ESM compatible. This does not apply to third-party dependencies.

### Automated migration (Recommended)

The automated migration will adjust both the application configuration within `angular.json` as well as code and stylesheets to remove previous webpack-specific feature usage.
While many changes can be automated and most applications will not require any further changes, each application is unique and there may be some manual changes required.
After the migration, please attempt a build of the application as there could be new errors that will require adjustments within the code.
The errors will attempt to provide solutions to the problem when possible and the later sections of this guide describe some of the more common situations that you may encounter.
When updating to Angular v18 via `ng update`, you will be asked to execute the migration.
This migration is entirely optional for v18 and can also be run manually at anytime after an update via the following command:

<docs-code language="shell">

ng update @angular/cli --name use-application-builder

</docs-code>

The migration does the following:

* Converts existing `browser` or `browser-esbuild` target to `application`
* Removes any previous SSR builders (because `application` does that now).
* Updates configuration accordingly.
* Merges `tsconfig.server.json` with `tsconfig.app.json` and adds the TypeScript option `"esModuleInterop": true` to ensure `express` imports are [ESM compliant](#esm-default-imports-vs-namespace-imports).
* Updates application server code to use new bootstrapping and output directory structure.
* Removes any webpack-specific builder stylesheet usage such as the tilde or caret in `@import`/`url()` and updates the configuration to provide equivalent behavior
* Converts to use the new lower dependency `@angular/build` Node.js package if no other `@angular-devkit/build-angular` usage is found.

### Manual migration

Additionally for existing projects, you can manually opt-in to use the new builder on a per-application basis with two different options.
Both options are considered stable and fully supported by the Angular team.
The choice of which option to use is a factor of how many changes you will need to make to migrate and what new features you would like to use in the project.

- The `browser-esbuild` builder builds only the client-side bundle of an application designed to be compatible with the existing `browser` builder that provides the preexisting build system.
This builder provides equivalent build options, and in many cases, it serves as a drop-in replacement for existing `browser` applications.
- The `application` builder covers an entire application, such as the client-side bundle, as well as optionally building a server for server-side rendering and performing build-time prerendering of static pages.

The `application` builder is generally preferred as it improves server-side rendered (SSR) builds, and makes it easier for client-side rendered projects to adopt SSR in the future.
However it requires a little more migration effort, particularly for existing SSR applications if performed manually.
If the `application` builder is difficult for your project to adopt, `browser-esbuild` can be an easier solution which gives most of the build performance benefits with fewer breaking changes.

#### Manual migration to the compatibility builder

A builder named `browser-esbuild` is available within the `@angular-devkit/build-angular` package that is present in an Angular CLI generated application.
You can try out the new build system for applications that use the `browser` builder.
If using a custom builder, please refer to the documentation for that builder on possible migration options.

The compatibility option was implemented to minimize the amount of changes necessary to initially migrate your applications.
This is provided via an alternate builder (`browser-esbuild`).
You can update the `build` target for any application target to migrate to the new build system.

The following is what you would typically find in `angular.json` for an application:

<docs-code language="json">
...
"architect": {
  "build": {
    "builder": "@angular-devkit/build-angular:browser",
...
</docs-code>

Changing the `builder` field is the only change you will need to make.

<docs-code language="json">
...
"architect": {
  "build": {
    "builder": "@angular-devkit/build-angular:browser-esbuild",
...
</docs-code>

#### Manual migration to the new `application` builder

A builder named `application` is also available within the `@angular-devkit/build-angular` package that is present in an Angular CLI generated application.
This builder is the default for all new applications created via `ng new`.

The following is what you would typically find in `angular.json` for an application:

<docs-code language="json">
...
"architect": {
  "build": {
    "builder": "@angular-devkit/build-angular:browser",
...
</docs-code>

Changing the `builder` field is the first change you will need to make.

<docs-code language="json">
...
"architect": {
  "build": {
    "builder": "@angular-devkit/build-angular:application",
...
</docs-code>

Once the builder name has been changed, options within the `build` target will need to be updated.
The following list discusses all the `browser` builder options that will need to be adjusted.

- `main` should be renamed to `browser`.
- `polyfills` should be an array, rather than a single file.
- `buildOptimizer` should be removed, as this is covered by the `optimization` option.
- `resourcesOutputPath` should be removed, this is now always `media`.
- `vendorChunk` should be removed, as this was a performance optimization which is no longer needed.
- `commonChunk` should be removed, as this was a performance optimization which is no longer needed.
- `deployUrl` should be removed and is not supported. Prefer [`<base href>`](guide/routing/common-router-tasks) instead. See [deployment documentation](tools/cli/deployment#--deploy-url) for more information.
- `ngswConfigPath` should be renamed to `serviceWorker`.

If the application is not using SSR currently, this should be the final step to allow `ng build` to function.
After executing `ng build` for the first time, there may be new warnings or errors based on behavioral differences or application usage of webpack-specific features.
Many of the warnings will provide suggestions on how to remedy that problem.
If it appears that a warning is incorrect or the solution is not apparent, please open an issue on [GitHub](https://github.com/angular/angular-cli/issues).
Also, the later sections of this guide provide additional information on several specific cases as well as current known issues.

For applications new to SSR, the [Angular SSR Guide](guide/ssr) provides additional information regarding the setup process for adding SSR to an application.

For applications that are already using SSR, additional adjustments will be needed to update the application server to support the new integrated SSR capabilities.
The `application` builder now provides the integrated functionality for all of the following preexisting builders:

- `app-shell`
- `prerender`
- `server`
- `ssr-dev-server`

The `ng update` process will automatically remove usages of the `@nguniversal` scope packages where some of these builders were previously located.
The new `@angular/ssr` package will also be automatically added and used with configuration and code being adjusted during the update.
The `@angular/ssr` package supports the `browser` builder as well as the `application` builder.

## Executing a build

Once you have updated the application configuration, builds can be performed using `ng build` as was previously done.
Depending on the choice of builder migration, some of the command line options may be different.
If the build command is contained in any `npm` or other scripts, ensure they are reviewed and updated.
For applications that have migrated to the `application` builder and that use SSR and/or prererending, you also may be able to remove extra `ng run` commands from scripts now that `ng build` has integrated SSR support.

<docs-code language="shell">

ng build

</docs-code>

## Starting the development server

The development server will automatically detect the new build system and use it to build the application.
To start the development server no changes are necessary to the `dev-server` builder configuration or command line.

<docs-code language="shell">

ng serve

</docs-code>

You can continue to use the [command line options](/cli/serve) you have used in the past with the development server.

HELPFUL: With the development server, you may see a small Flash of Unstyled Content (FOUC) on startup as the server initializes.
The development server attempts to defer processing of stylesheets until first use to improve rebuild times.
This will not occur in builds outside the development server.

### Hot module replacement

Hot Module Replacement (HMR) is a technique used by development servers to avoid reloading the entire page when only part of an application is changed.
The changes in many cases can be immediately shown in the browser which allows for an improved edit/refresh cycle while developing an application.
While general JavaScript-based hot module replacement (HMR) is currently not supported, several more specific forms of HMR are available:
- **global stylesheet** (`styles` build option)
- **component stylesheet** (inline and file-based)
- **component template** (inline and file-based)

The HMR capabilities are automatically enabled and require no code or configuration changes to use.
Angular provides HMR support for both file-based (`templateUrl`/`styleUrl`/`styleUrls`) and inline (`template`/`styles`) component styles and templates.
The build system will attempt to compile and process the minimal amount of application code when it detects a stylesheet only change.

If preferred, the HMR capabilities can be disabled by setting the `hmr` development server option to `false`.
This can also be changed on the command line via:

<docs-code language="shell">

ng serve --no-hmr

</docs-code>

### Vite as a development server

The usage of Vite in the Angular CLI is currently within a _development server capacity only_. Even without using the underlying Vite build system, Vite provides a full-featured development server with client side support that has been bundled into a low dependency npm package. This makes it an ideal candidate to provide comprehensive development server functionality. The current development server process uses the new build system to generate a development build of the application in memory and passes the results to Vite to serve the application. The usage of Vite, much like the Webpack-based development server, is encapsulated within the Angular CLI `dev-server` builder and currently cannot be directly configured.

### Prebundling

Prebundling provides improved build and rebuild times when using the development server.
Vite provides [prebundling capabilities](https://vite.dev/guide/dep-pre-bundling) that are enabled by default when using the Angular CLI.
The prebundling process analyzes all the third-party project dependencies within a project and processes them the first time the development server is executed.
This process removes the need to rebuild and bundle the project's dependencies each time a rebuild occurs or the development server is executed.

In most cases, no additional customization is required. However, some situations where it may be needed include:
- Customizing loader behavior for imports within the dependency such as the [`loader` option](#file-extension-loader-customization)
- Symlinking a dependency to local code for development such as [`npm link`](https://docs.npmjs.com/cli/v10/commands/npm-link)
- Working around an error encountered during prebundling of a dependency

The prebundling process can be fully disabled or individual dependencies can be excluded if needed by a project.
The `dev-server` builder's `prebundle` option can be used for these customizations.
To exclude specific dependencies, the `prebundle.exclude` option is available:

<docs-code language="json">
    "serve": {
      "builder": "@angular/build:dev-server",
      "options": {
        "prebundle": {
          "exclude": ["some-dep"]
        }
      },
</docs-code>

By default, `prebundle` is set to `true` but can be set to `false` to fully disable prebundling.
However, excluding specific dependencies is recommended instead since rebuild times will increase with prebundling disabled.

<docs-code language="json">
    "serve": {
      "builder": "@angular/build:dev-server",
      "options": {
        "prebundle": false
      },
</docs-code>

## New features

One of the main benefits of the application build system is the improved build and rebuild speed.
However, the new application build system also provides additional features not present in the `browser` builder.

IMPORTANT: The new features of the `application` builder described here are incompatible with the `karma` test builder by default because it is using the `browser` builder internally.
Users can opt-in to use the `application` builder by setting the `builderMode` option to `application` for the `karma` builder.
This option is currently in developer preview.
If you notice any issues, please report them [here](https://github.com/angular/angular-cli/issues).

### Build-time value replacement (define)

The `define` option allows identifiers present in the code to be replaced with another value at build time.
This is similar to the behavior of Webpack's `DefinePlugin` which was previously used with some custom Webpack configurations that used third-party builders.
The option can either be used within the `angular.json` configuration file or on the command line.
Configuring `define` within `angular.json` is useful for cases where the values are constant and able to be checked in to source control.

Within the configuration file, the option is in the form of an object.
The keys of the object represent the identifier to replace and the values of the object represent the corresponding replacement value for the identifier.
An example is as follows:

<docs-code language="json">
  "build": {
    "builder": "@angular/build:application",
    "options": {
      ...
      "define": {
          "SOME_NUMBER": "5",
          "ANOTHER": "'this is a string literal, note the extra single quotes'",
          "REFERENCE": "globalThis.someValue.noteTheAbsentSingleQuotes"
      }
    }
  }
</docs-code>

HELPFUL: All replacement values are defined as strings within the configuration file.
If the replacement is intended to be an actual string literal, it should be enclosed in single quote marks.
This allows the flexibility of using any valid JSON type as well as a different identifier as a replacement.

The command line usage is preferred for values that may change per build execution such as the git commit hash or an environment variable.
The CLI will merge `--define` values from the command line with `define` values from `angular.json`, including both in a build.
Command line usage takes precedence if the same identifier is present for both.
For command line usage, the `--define` option uses the format of `IDENTIFIER=VALUE`.

<docs-code language="shell">
ng build --define SOME_NUMBER=5 --define "ANOTHER='these will overwrite existing'"
</docs-code>

Environment variables can also be selectively included in a build.
For non-Windows shells, the quotes around the hash literal can be escaped directly if preferred.
This example assumes a bash-like shell but similar behavior is available for other shells as well.

<docs-code language="shell">
export MY_APP_API_HOST="http://example.com"
export API_RETRY=3
ng build --define API_HOST=\'$MY_APP_API_HOST\' --define API_RETRY=$API_RETRY
</docs-code>

For either usage, TypeScript needs to be aware of the types for the identifiers to prevent type-checking errors during the build.
This can be accomplished with an additional type definition file within the application source code (`src/types.d.ts`, for example) with similar content:

```ts
declare const SOME_NUMBER: number;
declare const ANOTHER: string;
declare const GIT_HASH: string;
declare const API_HOST: string;
declare const API_RETRY: number;
```

The default project configuration is already setup to use any type definition files present in the project source directories.
If the TypeScript configuration for the project has been altered, it may need to be adjusted to reference this newly added type definition file.

IMPORTANT: This option will not replace identifiers contained within Angular metadata such as a Component or Directive decorator.

### File extension loader customization

IMPORTANT: This feature is only available with the `application` builder.

Some projects may need to control how all files with a specific file extension are loaded and bundled into an application.
When using the `application` builder, the `loader` option can be used to handle these cases.
The option allows a project to define the type of loader to use with a specified file extension.
A file with the defined extension can then be used within the application code via an import statement or dynamic import expression.
The available loaders that can be used are:
* `text` - inlines the content as a `string` available as the default export
* `binary` - inlines the content as a `Uint8Array` available as the default export
* `file` - emits the file at the application output path and provides the runtime location of the file as the default export
* `empty` - considers the content to be empty and will not include it in bundles

The `empty` value, while less common, can be useful for compatibility of third-party libraries that may contain bundler-specific import usage that needs to be removed.
One case for this is side-effect imports (`import 'my.css';`) of CSS files which has no effect in a browser.
Instead, the project can use `empty` and then the CSS files can be added to the `styles` build option or use some other injection method.

The loader option is an object-based option with the keys used to define the file extension and the values used to define the loader type.

An example of the build option usage to inline the content of SVG files into the bundled application would be as follows:

<docs-code language="json">
  "build": {
    "builder": "@angular/build:application",
    "options": {
      ...
      "loader": {
        ".svg": "text"
      }
    }
  }
</docs-code>

An SVG file can then be imported:
```ts
import contents from './some-file.svg';

console.log(contents); // <svg>...</svg>
```

Additionally, TypeScript needs to be aware of the module type for the import to prevent type-checking errors during the build. This can be accomplished with an additional type definition file within the application source code (`src/types.d.ts`, for example) with the following or similar content:
```ts
declare module "*.svg" {
  const content: string;
  export default content;
}
```

The default project configuration is already setup to use any type definition files (`.d.ts` files) present in the project source directories. If the TypeScript configuration for the project has been altered, the tsconfig may need to be adjusted to reference this newly added type definition file.

### Import attribute loader customization

For cases where only certain files should be loaded in a specific way, per file control over loading behavior is available.
This is accomplished with a `loader` [import attribute](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import/with) that can be used with both import statements and expressions.
The presence of the import attribute takes precedence over all other loading behavior including JS/TS and any `loader` build option values.
For general loading for all files of an otherwise unsupported file type, the [`loader`](#file-extension-loader-customization) build option is recommended.

For the import attribute, the following loader values are supported:
* `text` - inlines the content as a `string` available as the default export
* `binary` - inlines the content as a `Uint8Array` available as the default export
* `file` - emits the file at the application output path and provides the runtime location of the file as the default export

An additional requirement to use import attributes is that the TypeScript `module` option must be set to `esnext` to allow TypeScript to successfully build the application code.
Once `ES2025` is available within TypeScript, this change will no longer be needed.

At this time, TypeScript does not support type definitions that are based on import attribute values.
The use of `@ts-expect-error`/`@ts-ignore` or the use of individual type definition files (assuming the file is only imported with the same loader attribute) is currently required.
As an example, an SVG file can be imported as text via:
```ts
// @ts-expect-error TypeScript cannot provide types based on attributes yet
import contents from './some-file.svg' with { loader: 'text' };
```

The same can be accomplished with an import expression inside an async function.
```ts
async function loadSvg(): Promise<string> {
  // @ts-expect-error TypeScript cannot provide types based on attributes yet
  return import('./some-file.svg', { with: { loader: 'text' } }).then((m) => m.default);
}
```
For the import expression, the `loader` value must be a string literal to be statically analyzed.
A warning will be issued if the value is not a string literal.

The `file` loader is useful when a file will be loaded at runtime through either a `fetch()`, setting to an image elements `src`, or other similar method.
```ts
// @ts-expect-error TypeScript cannot provide types based on attributes yet
import imagePath from './image.webp' with { loader: 'file' };

console.log(imagePath); // media/image-ULK2SIIB.webp
```
For production builds as shown in the code comment above, hashing will be automatically added to the path for long-term caching.

HELPFUL: When using the development server and using a `loader` attribute to import a file from a Node.js package, that package must be excluded from prebundling via the development server `prebundle` option.

### Import/export conditions

Projects may need to map certain import paths to different files based on the type of build.
This can be particularly useful for cases such as `ng serve` needing to use debug/development specific code but `ng build` needing to use code without any development features/information.
Several import/export [conditions](https://nodejs.org/api/packages.html#community-conditions-definitions) are automatically applied to support these project needs:
* For optimized builds, the `production` condition is enabled.
* For non-optimized builds, the `development` condition is enabled.
* For browser output code, the `browser` condition is enabled.

An optimized build is determined by the value of the `optimization` option.
When `optimization` is set to `true` or more specifically if `optimization.scripts` is set to `true`, then the build is considered optimized.
This classification applies to both `ng build` and `ng serve`.
In a new project, `ng build` defaults to optimized and `ng serve` defaults to non-optimized.

A useful method to leverage these conditions within application code is to combine them with [subpath imports](https://nodejs.org/api/packages.html#subpath-imports).
By using the following import statement:
```ts
import {verboseLogging} from '#logger';
```

The file can be switched in the `imports` field in `package.json`:

<docs-code language="json">
{
  ...
  "imports": {
    "#logger": {
      "development": "./src/logging/debug.ts",
      "default": "./src/logging/noop.ts"
    }
  }
}
</docs-code>

For applications that are also using SSR, browser and server code can be switched by using the `browser` condition:

<docs-code language="json">
{
  ...
  "imports": {
    "#crashReporter": {
      "browser": "./src/browser-logger.ts",
      "default": "./src/server-logger.ts"
    }
  }
}
</docs-code>

These conditions also apply to Node.js packages and any defined [`exports`](https://nodejs.org/api/packages.html#conditional-exports) within the packages.

HELPFUL: If currently using the `fileReplacements` build option, this feature may be able to replace its usage.

## Known Issues

There are currently several known issues that you may encounter when trying the new build system. This list will be updated to stay current. If any of these issues are currently blocking you from trying out the new build system, please check back in the future as it may have been solved.

### Type-checking of Web Worker code and processing of nested Web Workers

Web Workers can be used within application code using the same syntax (`new Worker(new URL('<workerfile>', import.meta.url))`) that is supported with the `browser` builder.
However, the code within the Worker will not currently be type-checked by the TypeScript compiler. TypeScript code is supported just not type-checked.
Additionally, any nested workers will not be processed by the build system. A nested worker is a Worker instantiation within another Worker file.

### ESM default imports vs. namespace imports

TypeScript by default allows default exports to be imported as namespace imports and then used in call expressions.
This is unfortunately a divergence from the ECMAScript specification.
The underlying bundler (`esbuild`) within the new build system expects ESM code that conforms to the specification.
The build system will now generate a warning if your application uses an incorrect type of import of a package.
However, to allow TypeScript to accept the correct usage, a TypeScript option must be enabled within the application's `tsconfig` file.
When enabled, the [`esModuleInterop`](https://www.typescriptlang.org/tsconfig#esModuleInterop) option provides better alignment with the ECMAScript specification and is also recommended by the TypeScript team.
Once enabled, you can update package imports where applicable to an ECMAScript conformant form.

Using the [`moment`](https://npmjs.com/package/moment) package as an example, the following application code will cause runtime errors:

```ts
import * as moment from 'moment';

console.log(moment().format());
```

The build will generate a warning to notify you that there is a potential problem. The warning will be similar to:

<docs-code language="text">
▲ [WARNING] Calling "moment" will crash at run-time because it's an import namespace object, not a function [call-import-namespace]

    src/main.ts:2:12:
      2 │ console.log(moment().format());
        ╵             ~~~~~~

Consider changing "moment" to a default import instead:

    src/main.ts:1:7:
      1 │ import * as moment from 'moment';
        │        ~~~~~~~~~~~
        ╵        moment

</docs-code>

However, you can avoid the runtime errors and the warning by enabling the `esModuleInterop` TypeScript option for the application and changing the import to the following:

```ts
import moment from 'moment';

console.log(moment().format());
```

### Order-dependent side-effectful imports in lazy modules

Import statements that are dependent on a specific ordering and are also used in multiple lazy modules can cause top-level statements to be executed out of order.
This is not common as it depends on the usage of side-effectful modules and does not apply to the `polyfills` option.
This is caused by a [defect](https://github.com/evanw/esbuild/issues/399) in the underlying bundler but will be addressed in a future update.

IMPORTANT: Avoiding the use of modules with non-local side effects (outside of polyfills) is recommended whenever possible regardless of the build system being used and avoids this particular issue. Modules with non-local side effects can have a negative effect on both application size and runtime performance as well.

## Bug reports

Report issues and feature requests on [GitHub](https://github.com/angular/angular-cli/issues).

Please provide a minimal reproduction where possible to aid the team in addressing issues.