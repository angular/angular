# Creating libraries

This page provides a conceptual overview of how you can create and publish new libraries to extend Angular functionality.

If you find that you need to solve the same problem in more than one application (or want to share your solution with other developers), you have a candidate for a library.
A simple example might be a button that sends users to your company website, that would be included in all applications that your company builds.

## Getting started

Use the Angular CLI to generate a new library skeleton in a new workspace with the following commands.

<code-example language="bash">
 ng new my-workspace --create-application=false
 cd my-workspace
 ng generate library my-lib
</code-example>

<div class="callout is-important">

<header>Naming your library</header>

  You should be very careful when choosing the name of your library if you want to publish it later in a public package registry such as npm. See [Publishing your library](guide/creating-libraries#publishing-your-library).
  
  Avoid using a name that is prefixed with `ng-`, such as `ng-library`. The `ng-` prefix is a reserved keyword used from the Angular framework and its libraries. The `ngx-` prefix is preferred as a convention used to denote that the library is suitable for use with Angular. It is also an excellent indication to consumers of the registry to differentiate between libraries of different JavaScript frameworks.

</div>

The `ng generate` command creates the `projects/my-lib` folder in your workspace, which contains a component and a service inside an NgModule.

<div class="alert is-helpful">

     For more details on how a library project is structured, refer to the [Library project files](guide/file-structure#library-project-files) section of the [Project File Structure guide](guide/file-structure).

     You can use the monorepo model to use the same workspace for multiple projects.
     See [Setting up for a multi-project workspace](guide/file-structure#multiple-projects).

</div>

When you generate a new library, the workspace configuration file, `angular.json`, is updated with a project of type `library`.

<code-example format="json">
"projects": {
  ...
  "my-lib": {
    "root": "projects/my-lib",
    "sourceRoot": "projects/my-lib/src",
    "projectType": "library",
    "prefix": "lib",
    "architect": {
      "build": {
        "builder": "@angular-devkit/build-angular:ng-packagr",
        ...
</code-example>

You can build, test, and lint the project with CLI commands:

<code-example language="bash">
 ng build my-lib --configuration development
 ng test my-lib
 ng lint my-lib
</code-example>

Notice that the configured builder for the project is different from the default builder for application projects.
This builder, among other things, ensures that the library is always built with the [AOT compiler](guide/aot-compiler).

To make library code reusable you must define a public API for it. This "user layer" defines what is available to consumers of your library. A user of your library should be able to access public functionality (such as NgModules, service providers and general utility functions) through a single import path.

The public API for your library is maintained in the `public-api.ts` file in your library folder.
Anything exported from this file is made public when your library is imported into an application.
Use an NgModule to expose services and components.

Your library should supply documentation (typically a README file) for installation and maintenance.

## Refactoring parts of an app into a library

To make your solution reusable, you need to adjust it so that it does not depend on app-specific code.
Here are some things to consider in migrating application functionality to a library.

* Declarations such as components and pipes should be designed as stateless, meaning they don’t rely on or alter external variables. If you do rely on state, you need to evaluate every case and decide whether it is application state or state that the library would manage.

* Any observables that the components subscribe to internally should be cleaned up and disposed of during the lifecycle of those components.

* Components should expose their interactions through inputs for providing context, and outputs for communicating events to other components.

* Check all internal dependencies.
   * For custom classes or interfaces used in components or service, check whether they depend on additional classes or interfaces that also need to be migrated.
   * Similarly, if your library code depends on a service, that service needs to be migrated.
   * If your library code or its templates depend on other libraries (such as Angular Material, for instance), you must configure your library with those dependencies.

* Consider how you provide services to client applications.

   * Services should declare their own providers, rather than declaring providers in the NgModule or a component. Declaring a provider makes that service *tree-shakable*. This practice allows the compiler to leave the service out of the bundle if it never gets injected into the application that imports the library. For more about this, see [Tree-shakable providers](guide/architecture-services#providing-services).

   * If you register global service providers or share providers across multiple NgModules, use the [`forRoot()` and `forChild()` design patterns](guide/singleton-services) provided by the [RouterModule](api/router/RouterModule).

   * If your library provides optional services that might not be used by all client applications, support proper tree-shaking for that case by using the [lightweight token design pattern](guide/lightweight-injection-tokens).

{@a integrating-with-the-cli}

## Integrating with the CLI using code-generation schematics

A library typically includes *reusable code* that defines components, services, and other Angular artifacts (pipes, directives) that you import into a project.
A library is packaged into an npm package for publishing and sharing.
This package can also include [schematics](guide/glossary#schematic) that provide instructions for generating or transforming code directly in your project, in the same way that the CLI creates a generic new component with `ng generate component`.
A schematic that is packaged with a library can, for example, provide the Angular CLI with the information it needs to generate a component that configures and uses a particular feature, or set of features, defined in that library.
One example of this is [Angular Material's navigation schematic](https://material.angular.io/guide/schematics#navigation-schematic) which configures the CDK's [BreakpointObserver](https://material.angular.io/cdk/layout/overview#breakpointobserver) and uses it with Material's [MatSideNav](https://material.angular.io/components/sidenav/overview) and [MatToolbar](https://material.angular.io/components/toolbar/overview) components.

You can create and include the following kinds of schematics:

* Include an installation schematic so that `ng add` can add your library to a project.

* Include generation schematics in your library so that `ng generate` can scaffold your defined artifacts (components, services, tests) in a project.

* Include an update schematic so that `ng update` can update your library’s dependencies and provide migrations for breaking changes in new releases.

What you include in your library depends on your task.
For example, you could define a schematic to create a dropdown that is pre-populated with canned data to show how to add it to an application.
If you want a dropdown that would contain different passed-in values each time, your library could define a schematic to create it with a given configuration. Developers could then use `ng generate` to configure an instance for their own application.

Suppose you want to read a configuration file and then generate a form based on that configuration.
If that form will need additional customization by the developer who is using your library, it might work best as a schematic.
However, if the form will always be the same and not need much customization by developers, then you could create a dynamic component that takes the configuration and generates the form.
In general, the more complex the customization, the more useful the schematic approach.

To learn more, see [Schematics Overview](guide/schematics) and [Schematics for Libraries](guide/schematics-for-libraries).

## Publishing your library

Use the Angular CLI and the npm package manager to build and publish your library as an npm package.


Angular CLI uses a tool called [ng-packagr](https://github.com/ng-packagr/ng-packagr/blob/master/README.md) to create packages
from your compiled code that can be published to npm.
See [Building libraries with Ivy](guide/creating-libraries#ivy-libraries) for information on the
distribution formats supported by `ng-packagr` and guidance on how
to choose the right format for your library.

You should always build libraries for distribution using the `production` configuration.
This ensures that generated output uses the appropriate optimizations and the correct package format for npm.

<code-example language="bash">
ng build my-lib
cd dist/my-lib
npm publish
</code-example>


{@a lib-assets}

## Managing assets in a library

Starting with version 9.x of the [ng-packagr](https://github.com/ng-packagr/ng-packagr/blob/master/README.md) tool, you can configure the tool to automatically copy assets into your library package as part of the build process.
You can use this feature when your library needs to publish optional theming files, Sass mixins, or documentation (like a changelog).

* Learn how to [copy assets into your library as part of the build](https://github.com/ng-packagr/ng-packagr/blob/master/docs/copy-assets.md).

* Learn more about how to use the tool to [embed assets in CSS](https://github.com/ng-packagr/ng-packagr/blob/master/docs/embed-assets-css.md).

## Linked libraries

While working on a published library, you can use [npm link](https://docs.npmjs.com/cli/link) to avoid reinstalling the library on every build.

The library must be rebuilt on every change.
When linking a library, make sure that the build step runs in watch mode, and that the library's `package.json` configuration points at the correct entry points.
For example, `main` should point at a JavaScript file, not a TypeScript file.

### Use TypeScript path mapping for peer dependencies

Angular libraries should list any `@angular/*` dependencies the library depends on as peer dependencies.
This ensures that when modules ask for Angular, they all get the exact same module.
If a library lists `@angular/core` in `dependencies` instead of `peerDependencies`, it might get a different Angular module instead, which would cause your application to break.

While developing a library, you must install all peer dependencies through `devDependencies` to ensure that the library compiles properly.
A linked library will then have its own set of Angular libraries that it uses for building, located in its `node_modules` folder.
However, this can cause problems while building or running your application.

To get around this problem you can use TypeScript path mapping to tell TypeScript that it should load some modules from a specific location.
List all the peer dependencies that your library uses in the workspace TypeScript configuration file `./tsconfig.json`, and point them at the local copy in the application's `node_modules` folder.

```
{
  "compilerOptions": {
    // ...
    // paths are relative to `baseUrl` path.
    "paths": {
      "@angular/*": [
        "./node_modules/@angular/*"
      ]
    }
  }
}
```

This mapping ensures that your library always loads the local copies of the modules it needs.


## Using your own library in apps

You don't have to publish your library to the npm package manager in order to use it in your own applications, but you do have to build it first.

To use your own library in an app:

* Build the library. You cannot use a library before it is built.
 <code-example language="bash">
 ng build my-lib
 </code-example>

* In your applications, import from the library by name:
 ```
 import { myExport } from 'my-lib';
 ```

### Building and rebuilding your library

The build step is important if you haven't published your library as an npm package and then installed the package back into your application from npm.
For instance, if you clone your git repository and run `npm install`, your editor will show the `my-lib` imports as missing if you haven't yet built your library.

<div class="alert is-helpful">

When you import something from a library in an Angular app, Angular looks for a mapping between the library name and a location on disk.
When you install a library package, the mapping is in the `node_modules` folder. When you build your own library, it has to find the mapping in your `tsconfig` paths.

Generating a library with the Angular CLI automatically adds its path to the `tsconfig` file.
The Angular CLI uses the `tsconfig` paths to tell the build system where to find the library.

</div>

If you find that changes to your library are not reflected in your application, your app is probably using an old build of the library.

You can rebuild your library whenever you make changes to it, but this extra step takes time.
*Incremental builds* functionality improves the library-development experience.
Every time a file is changed a partial build is performed that emits the amended files.

Incremental builds can be run as a background process in your development environment. To take advantage of this feature add the `--watch` flag to the build command:

<code-example language="bash">
ng build my-lib --watch
</code-example>

<div class="alert is-important">

The CLI `build` command uses a different builder and invokes a different build tool for libraries than it does for applications.

* The build system for applications, `@angular-devkit/build-angular`, is based on `webpack`, and is included in all new Angular CLI projects.
* The build system for libraries is based on `ng-packagr`. It is only added to your dependencies when you add a library using `ng generate library my-lib`.

The two build systems support different things, and even where they support the same things, they do those things differently.
This means that the TypeScript source can result in different JavaScript code in a built library than it would in a built application.

For this reason, an application that depends on a library should only use TypeScript path mappings that point to the *built library*.
TypeScript path mappings should *not* point to the library source `.ts` files.

</div>

{@a ivy-libraries}

## Building libraries with Ivy

There are three distribution formats that you can use when publishing a library:

* View Engine _(deprecated)_&mdash;legacy format, slated for removal in Angular version 13.
  Only use this format if you must support View Engine applications.
* partial-Ivy **(recommended)**&mdash;contains portable code that can be consumed by Ivy applications built with any version of Angular from v12 onwards.
* full-Ivy&mdash;contains private Angular Ivy instructions, which are not guaranteed to work across different versions of Angular. This format requires that the library and application are built with the _exact_ same version of Angular. This format is useful for environments where all library and application code is built directly from source.

New libraries created with Angular CLI default to partial-Ivy format.
If you are creating a new library with `ng generate library`, Angular uses Ivy by default with no further action on your part.

### Transitioning libraries to partial-Ivy format

Existing libraries, which are configured to generate the View Engine format, do not change when upgrading to later versions of Angular that use Ivy.

If you intend to publish your library to npm, compile with partial-Ivy code by setting `"compilationMode": "partial"` in `tsconfig.prod.json`.

A library that uses View Engine, rather than Ivy, has a `tsconfig.prod.json` file that contains the following:

<code-example>

"angularCompilerOptions": {
  "enableIvy": false
}

</code-example>

To convert such libraries to use the partial-Ivy format, change the `tsconfig.prod.json` file by removing the `enableIvy` option and adding the `compilationMode` option.

Enable partial-Ivy compilation by replacing `"enableIvy": false` with `"compilationMode": "partial"` as follows:

<code-example>

"angularCompilerOptions": {
  "compilationMode": "partial"
}

</code-example>

For publishing to npm use the partial-Ivy format as it is stable between patch versions of Angular.

Avoid compiling libraries with full-Ivy code if you are publishing to npm because the generated Ivy instructions are not part of Angular's public API, and so may change between patch versions.

Partial-Ivy code is not backward compatible with View Engine.
If you use the library in a View Engine application, you must compile the library into the View Engine format by setting `"enableIvy": false` in the `tsconfig.json` file.

Ivy applications can still consume the View Engine format because the Angular compatibility compiler, or `ngcc`, can convert it to Ivy.

## Ensuring library version compatibility

The Angular version used to build an application should always be the same or greater than the Angular versions used to build any of its dependent libraries.
For example, if you had a library using Angular version 12, the application that depends on that library should use Angular version 12 or later.
Angular does not support using an earlier version for the application.

<div class="alert is-helpful">

The Angular CLI uses Ivy to build applications and no longer uses View Engine.
A library or an application built with View Engine cannot consume a partial-Ivy library.

</div>

Because this process happens during the application build, it uses the same version of the Angular compiler, ensuring that the application and all of its libraries use a single version of Angular.

If you intend to publish your library to npm, compile with partial-Ivy code by setting `"compilationMode": "partial"` in `tsconfig.prod.json`.
This partial format is stable between different versions of Angular, so is safe to publish to npm.

Avoid compiling libraries with full-Ivy code if you are publishing to npm because the generated Ivy instructions are not part of Angular's public API, and so might change between patch versions.

Partial-Ivy code is not backward compatible with View Engine.
If you use the library in a View Engine application, you must compile the library into the View Engine format by setting `"enableIvy": false` in the `tsconfig.json` file.

Ivy applications can still consume the View Engine format because the Angular compatibility compiler, or `ngcc`, can convert it to Ivy in the Angular CLI.

If you've never published a package in npm before, you must create a user account. Read more in [Publishing npm Packages](https://docs.npmjs.com/getting-started/publishing-npm-packages).


## Consuming partial-Ivy code outside the Angular CLI

An application installs many Angular libraries from npm into its `node_modules` directory.
However, the code in these libraries cannot be bundled directly along with the built application as it is not fully compiled.
To finish compilation, you can use the Angular linker.

For applications that don't use the Angular CLI, the linker is available as a Babel plugin.
You can use the Babel plugin using the module `@angular/compiler-cli/linker/babel` to incorporate into your builds.
For example, you can integrate the plugin into a custom Webpack build by registering the linker as a plugin for `babel-loader`.

Previously, if you ran `yarn install` or `npm install` you had to re-run `ngcc`.
Now, libraries only need to be processed by the linker a single time, regardless of other npm operations.

The Angular linker Babel plugin supports build caching, meaning that libraries only need to be processed by the linker a single time, regardless of other npm operations.

<div class="alert is-helpful">

The Angular CLI integrates the linker plugin automatically, so if consumers of your library are using the CLI, they can install Ivy-native libraries from npm without any additional configuration.

</div>
