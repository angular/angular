# Getting started with the CLI's esbuild-based build system

<div class="alert is-important">

The esbuild-based ECMAScript module (ESM) application build system feature is available for [developer preview](/guide/releases#developer-preview).
It's ready for you to try, but it might change before it is stable and is not yet recommended for production builds.

</div>

In v16 and higher, the new build system provides a way to build Angular applications. This new build system includes:

- A modern output format using ESM, with dynamic import expressions to support lazy module loading.
- Faster build-time performance for both initial builds and incremental rebuilds.
- Newer JavaScript ecosystem tools such as [esbuild](https://esbuild.github.io/) and [Vite](https://vitejs.dev/).

You can opt-in to use the new builder on a per application basis with minimal configuration updates required.

## Trying the ESM build system in an Angular CLI application

A new builder named `browser-esbuild` is available within the `@angular-devkit/build-angular` package that is present in an Angular CLI generated application. The build is a drop-in replacement for the existing `browser` builder that provides the current stable browser application build system.
You can try out the new build system for applications that use the `browser` builder.

### Updating the application configuration

The new build system was implemented to minimize the amount of changes necessary to transition your applications. Currently, the new build system is provided via an alternate builder (`browser-esbuild`). You can update the `build` target for any application target to try out the new build system.

The following is what you would typically find in `angular.json` for an application:

<code-example language="json" hideCopy="true">
...
"architect": {
  "build": {
    "builder": "@angular-devkit/build-angular:browser",
...
</code-example>

Changing the `builder` field is the only change you will need to make.

<code-example language="json" hideCopy="true">
...
"architect": {
  "build": {
    "builder": "@angular-devkit/build-angular:browser-esbuild",
...
</code-example>

### Executing a build

Once you have updated the application configuration, builds can be performed using the `ng build` as was previously done. For the remaining options that are currently not yet implemented in the developer preview, a warning will be issued for each and the option will be ignored during the build.

<code-example language="shell">

ng build

</code-example>

### Starting the development server

The development server now has the ability to automatically detect the new build system and use it to build the application. To start the development server no changes are necessary to the `dev-server` builder configuration or command line.

<code-example language="shell">

ng serve

</code-example>

You can continue to use the [command line options](/cli/serve) you have used in the past with the development server.

<div class="alert is-important">

The developer preview currently does not provide HMR support and the HMR related options will be ignored if used. Angular focused HMR capabilities are currently planned and will be introduced in a future version.

</div>

### Unimplemented options and behavior

Several build options are not yet implemented but will be added in the future as the build system moves towards a stable status. If your application uses these options, you can still try out the build system without removing them. Warnings will be issued for any unimplemented options but they will otherwise be ignored. However, if your application relies on any of these options to function, you may want to wait to try.

- [Bundle budgets](https://github.com/angular/angular-cli/issues/25100) (`budgets`)
- [Localization](https://github.com/angular/angular-cli/issues/25099) (`localize`/`i18nDuplicateTranslation`/`i18nMissingTranslation`)
- [Web workers](https://github.com/angular/angular-cli/issues/25101) (`webWorkerTsConfig`)
- [WASM imports](https://github.com/angular/angular-cli/issues/25102) -- WASM can still be loaded manually via [standard web APIs](https://developer.mozilla.org/en-US/docs/WebAssembly/Loading_and_running).

Building libraries with the new build system via `ng-packagr` is also not yet possible but library build support will be available in a future release.

### ESM default imports vs. namespace imports

TypeScript by default allows default exports to be imported as namespace imports and then used in call expressions. This is unfortunately a divergence from the ECMAScript specification. The underlying bundler (`esbuild`) within the new build system expects ESM code that conforms to the specification. The build system will now generate a warning if your application uses an incorrect type of import of a package. However, to allow TypeScript to accept the correct usage, a TypeScript option must be enabled within the application's `tsconfig` file. When enabled, the [`esModuleInterop`](https://www.typescriptlang.org/tsconfig#esModuleInterop) option provides better alignment with the ECMAScript specification and is also recommended by the TypeScript team. Once enabled, you can update package imports where applicable to an ECMAScript conformant form.

Using the [`moment`](https://npmjs.com/package/moment) package as an example, the following application code will cause runtime errors:

```ts
import * as moment from 'moment';

console.log(moment().format());
```

The build will generate a warning to notify you that there is a potential problem. The warning will be similar to:

<code-example format="shell" language="shell" hideCopy="true">
▲ [WARNING] Calling "moment" will crash at run-time because it's an import namespace object, not a function [call-import-namespace]

    src/main.ts:2:12:
      2 │ console.log(moment().format());
        ╵             ~~~~~~

Consider changing "moment" to a default import instead:

    src/main.ts:1:7:
      1 │ import * as moment from 'moment';
        │        ~~~~~~~~~~~
        ╵        moment

</code-example>

However, you can avoid the runtime errors and the warning by enabling the `esModuleInterop` TypeScript option for the application and changing the import to the following:

```ts
import moment from 'moment';

console.log(moment().format());
```

## Vite as a development server

The usage of Vite in the Angular CLI is currently only within a _development server capacity only_. Even without using the underlying Vite build system, Vite provides a full-featured development server with client side support that has been bundled into a low dependency npm package. This makes it an ideal candidate to provide comprehensive development server functionality. The current development server process uses the new build system to generate a development build of the application in memory and passes the results to Vite to serve the application. The usage of Vite, much like the Webpack-based development server, is encapsulated within the Angular CLI `dev-server` builder and currently cannot be directly configured.

## Known Issues

There are currently several known issues that you may encounter when trying the new build system. This list will be updated to stay current. If any of these issues are currently blocking you from trying out the new build system, please check back in the future as it may have been solved.

### Runtime-evaluated dynamic import expressions

Dynamic import expressions that do not contain static values will be kept in their original form and not processed at build time. This is a limitation of the underlying bundler but is [planned](https://github.com/evanw/esbuild/pull/2508) to be implemented in the future. In many cases, application code can be made to work by changing the import expressions into static strings with some form of conditional statement such as an `if` or `switch` for the known potential files.

Unsupported:

```ts
return await import(`/abc/${name}.json`);
```

Supported:

```ts
switch (name) {
  case 'x':
    return await import('/abc/x.json');
  case 'y':
    return await import('/abc/y.json');
  case 'z':
    return await import('/abc/z.json');
}
```

### Order-dependent side-effectful imports in lazy modules

Import statements that are dependent on a specific ordering and are also used in multiple lazy modules can cause top-level statements to be executed out of order.
This is not common as it depends on the usage of side-effectful modules and does not apply to the `polyfills` option.
This is caused by a [defect](https://github.com/evanw/esbuild/issues/399) in the underlying bundler but will be addressed in a future update.

<div class="alert is-important">

Avoiding the use of modules with non-local side effects (outside of polyfills) is recommended whenever possible regardless of the build system being used and avoids this particular issue. Modules with non-local side effects can have a negative effect on both application size and runtime performance as well.

</div>

### Hashed filenames for non-injected global styles/scripts

If your application currently uses the [`inject`](guide/workspace-config#styles-and-scripts-configuration) sub-option for any global styles and scripts via the `styles` or `scripts` build options, the output file names for those styles/scripts will incorrectly contain a hash. Depending on the usage of the output files, this may cause runtime failures for your application. See the related [issue](https://github.com/angular/angular-cli/issues/25098) for more information.

## Bug reports

Report issues and feature requests on [GitHub](https://github.com/angular/angular-cli/issues).

Please provide a minimal reproduction where possible to aid the team in addressing issues.
