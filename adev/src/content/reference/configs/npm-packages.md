# Workspace npm dependencies

The Angular Framework, Angular CLI, and components used by Angular applications are packaged as [npm packages](https://docs.npmjs.com/getting-started/what-is-npm "What is npm?") and distributed using the [npm registry](https://docs.npmjs.com).

You can download and install these npm packages by using the [npm CLI client](https://docs.npmjs.com/cli/install).
By default, Angular CLI uses the npm client.

HELPFUL: See [Local Environment Setup](tools/cli/setup-local "Setting up for Local Development") for information about the required versions and installation of `Node.js` and `npm`.

If you already have projects running on your machine that use other versions of Node.js and npm, consider using [nvm](https://github.com/creationix/nvm) to manage the multiple versions of Node.js and npm.

## `package.json`

`npm` installs the packages identified in a [`package.json`](https://docs.npmjs.com/files/package.json) file.

The CLI command `ng new` creates a `package.json` file when it creates the new workspace.
This `package.json` is used by all projects in the workspace, including the initial application project that is created by the CLI when it creates the workspace.
Libraries created with `ng generate library` will include their own `package.json` file.

Initially, this `package.json` includes *a starter set of packages*, some of which are required by Angular and others that support common application scenarios.
You add packages to `package.json` as your application evolves.

## Default Dependencies

The following Angular packages are included as dependencies in the default `package.json` file for a new Angular workspace.
For a complete list of Angular packages, see the [API reference](api).

| Package name                                                              | Details                                                                                                                                                                                        |
|:---                                                                       |:---                                                                                                                                                                                            |
| [`@angular/animations`](api#animations)                                   | Angular's legacy animations library makes it easy to define and apply animation effects such as page and list transitions. For more information, see the [Legacy Animations guide](guide/legacy-animations).        |
| [`@angular/common`](api#common)                                           | The commonly-needed services, pipes, and directives provided by the Angular team.                                                                                                              |
| `@angular/compiler`                                                       | Angular's template compiler. It understands Angular templates and can convert them to code that makes the application run.                                                                     |
| `@angular/compiler-cli`                                                   | Angular's compiler which is invoked by the Angular CLI's `ng build` and `ng serve` commands. It processes Angular templates with `@angular/compiler` inside a standard TypeScript compilation. |
| [`@angular/core`](api#core)                                               | Critical runtime parts of the framework that are needed by every application. Includes all metadata decorators such as `@Component`, dependency injection, and component lifecycle hooks.      |
| [`@angular/forms`](api#forms)                                             | Support for both [template-driven](guide/forms) and [reactive forms](guide/forms/reactive-forms). See [Introduction to forms](guide/forms).                                                    |
| [`@angular/platform-browser`](api#platform-browser)                       | Everything DOM and browser related, especially the pieces that help render into the DOM.                                                                                                       |
| [`@angular/platform-browser-dynamic`](api#platform-browser-dynamic)       | Includes [providers](api/core/Provider) and methods to compile and run the application on the client using the [JIT compiler](tools/cli/aot-compiler#choosing-a-compiler).                     |
| [`@angular/router`](api#router)                                           | The router module navigates among your application pages when the browser URL changes. For more information, see [Routing and Navigation](guide/routing).                                       |
| [`@angular/cli`](https://github.com/angular/angular-cli)                  | Contains the Angular CLI binary for running `ng` commands.                                                                                                                                     |
| [`@angular-devkit/build-angular`](https://github.com/angular/angular-cli) | Contains default CLI builders for bundling, testing, and serving Angular applications and libraries.                                                                                           |
| `rxjs`                                                                    | A library for reactive programming using `Observables`.                                                                                                                                        |
| [`zone.js`](https://github.com/angular/zone.js)                           | Angular relies on `zone.js`` to run Angular's change detection processes when native JavaScript operations raise events.                                                                       |
| [`typescript`](https://www.npmjs.com/package/typescript)                  | The TypeScript compiler, language server, and built-in type definitions.                                                                                                                       |
