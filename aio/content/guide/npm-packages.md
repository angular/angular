# Workspace npm dependencies

The Angular Framework, Angular CLI, and components used by Angular applications are packaged as [npm packages](https://docs.npmjs.com/getting-started/what-is-npm "What is npm?") and distributed using the [npm registry](https://docs.npmjs.com/).

You can download and install these npm packages by using the [npm CLI client](https://docs.npmjs.com/cli/install), which is installed with and runs as a [Node.js®](https://nodejs.org "Nodejs.org") application. By default, the Angular CLI uses the npm client.

Alternatively, you can use the [yarn client](https://yarnpkg.com/) for downloading and installing npm packages.


<div class="alert is-helpful">

See [Local Environment Setup](guide/setup-local "Setting up for Local Development") for information about the required versions and installation of `Node.js` and `npm`.

If you already have projects running on your machine that use other versions of Node.js and npm, consider using [nvm](https://github.com/creationix/nvm) to manage the multiple versions of Node.js and npm.

</div>


## `package.json`

Both `npm` and `yarn` install the packages that are identified in a [`package.json`](https://docs.npmjs.com/files/package.json) file.

The CLI command `ng new` creates a `package.json` file when it creates the new workspace.
This `package.json` is used by all projects in the workspace, including the initial application project that is created by the CLI when it creates the workspace.

Initially, this `package.json` includes _a starter set of packages_, some of which are required by Angular and others that support common application scenarios.
You add packages to `package.json` as your application evolves.
You may even remove some.

The `package.json` is organized into two groups of packages:

* [Dependencies](guide/npm-packages#dependencies) are essential to *running* applications.
* [DevDependencies](guide/npm-packages#dev-dependencies) are only necessary to *develop* applications.

<div class="alert is-helpful">

**Library developers:** By default, the CLI command [`ng generate library`](cli/generate) creates a `package.json` for the new library. That `package.json` is used when publishing the library to npm.
For more information, see the CLI wiki page [Library Support](https://github.com/angular/angular-cli/wiki/stories-create-library).
</div>


{@a dependencies}
## Dependencies

The packages listed in the `dependencies` section of `package.json` are essential to *running* applications.

The `dependencies` section of `package.json` contains:

* [**Angular packages**](#angular-packages): Angular core and optional modules; their package names begin `@angular/`.

* [**Support packages**](#support-packages): 3rd party libraries that must be present for Angular applications to run.

* [**Polyfill packages**](#polyfills): Polyfills plug gaps in a browser's JavaScript implementation.

To add a new dependency, use the [`ng add`](cli/add) command.

{@a angular-packages}
### Angular packages

The following Angular packages are included as dependencies in the default `package.json` file for a new Angular workspace.
For a complete list of Angular packages, see the [API reference](https://angular.io/api?type=package).

Package name                               | Description
----------------------------------------   | --------------------------------------------------
[**@angular/animations**](api/animations) | Angular's animations library makes it easy to define and apply animation effects such as page and list transitions. For more information, see the [Animations guide](guide/animations).
[**@angular/common**](api/common) | The commonly-needed services, pipes, and directives provided by the Angular team. The [`HttpClientModule`](api/common/http/HttpClientModule) is also here, in the [`@angular/common/http`](api/common/http) subfolder. For more information, see the [HttpClient guide](guide/http).
**@angular/compiler** | Angular's template compiler. It understands templates and can convert them to code that makes the application run and render. Typically you don’t interact with the compiler directly; rather, you use it indirectly using `platform-browser-dynamic` when JIT compiling in the browser. For more information, see the [Ahead-of-time Compilation guide](guide/aot-compiler).
[**@angular/core**](api/core) | Critical runtime parts of the framework that are needed by every application. Includes all metadata decorators, `Component`, `Directive`,  dependency injection, and the component lifecycle hooks.
[**@angular/forms**](api/forms) | Support for both [template-driven](guide/forms) and [reactive forms](guide/reactive-forms). For information about choosing the best forms approach for your app, see [Introduction to forms](guide/forms-overview).
[**@angular/<br />platform&#8209;browser**](api/platform-browser) | Everything DOM and browser related, especially the pieces that help render into the DOM. This package also includes the `bootstrapModuleFactory()` method for bootstrapping applications for production builds that pre-compile with [AOT](guide/aot-compiler).
[**@angular/<br />platform&#8209;browser&#8209;dynamic**](api/platform-browser-dynamic) | Includes [providers](api/core/Provider) and methods to compile and run the application on the client using the [JIT compiler](guide/aot-compiler).
[**@angular/router**](api/router) | The router module navigates among your application pages when the browser URL changes. For more information, see [Routing and Navigation](guide/router).


{@a support-packages}
### Support packages

The following support packages are included as dependencies in the default `package.json` file for a new Angular workspace.


Package name                               | Description
----------------------------------------   | --------------------------------------------------
[**rxjs**](https://github.com/ReactiveX/rxjs) | Many Angular APIs return [_observables_](guide/glossary#observable). RxJS is an implementation of the proposed [Observables specification](https://github.com/tc39/proposal-observable) currently before the [TC39](https://www.ecma-international.org/memento/tc39.htm) committee, which determines standards for the JavaScript language.
[**zone.js**](https://github.com/angular/zone.js) | Angular relies on zone.js to run Angular's change detection processes when native JavaScript operations raise events. Zone.js is an implementation of a [specification](https://gist.github.com/mhevery/63fdcdf7c65886051d55) currently before the [TC39](https://www.ecma-international.org/memento/tc39.htm) committee that determines standards for the JavaScript language.


{@a polyfills}
### Polyfill packages

Many browsers lack native support for some features in the latest HTML standards,
features that Angular requires.
[_Polyfills_](https://en.wikipedia.org/wiki/Polyfill_(programming)) can emulate the missing features.
The [Browser Support](guide/browser-support) guide explains which browsers need polyfills and
how you can add them.


{@a dev-dependencies}

## DevDependencies

The packages listed in the `devDependencies` section of `package.json` help you develop the application on your local machine. You don't deploy them with the production application.

To add a new `devDependency`, use either one of the following commands:

<code-example language="sh">
  npm install --save-dev &lt;package-name&gt;
</code-example>

<code-example language="sh">
  yarn add --dev &lt;package-name&gt;
</code-example>

The following `devDependencies` are provided in the default `package.json` file for a new Angular workspace.


Package name                               | Description
----------------------------------------   | -----------------------------------
[**@angular&#8209;devkit/<br />build&#8209;angular**](https://github.com/angular/angular-cli/) | The Angular build tools.
[**@angular/cli**](https://github.com/angular/angular-cli/) | The Angular CLI tools.
**@angular/<br />compiler&#8209;cli** | The Angular compiler, which is invoked by the Angular CLI's `ng build` and `ng serve` commands.
**@types/... ** | TypeScript definition files for 3rd party libraries such as Jasmine and Node.js.
**jasmine/... ** | Packages to support the [Jasmine](https://jasmine.github.io/) test library.
**karma/... ** | Packages to support the [karma](https://www.npmjs.com/package/karma) test runner.
[**typescript**](https://www.npmjs.com/package/typescript) | The TypeScript language server, including the *tsc* TypeScript compiler.


## Related information

 For information about how the Angular CLI handles packages see the following guides:

 * [Building and serving](guide/build) describes how packages come together to create a development build.
 * [Deployment](guide/deployment) describes how packages come together to create a production build.
