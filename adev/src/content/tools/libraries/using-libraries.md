# Usage of Angular libraries published to npm

When you build your Angular application, take advantage of sophisticated first-party libraries, as well as a rich ecosystem of third-party libraries.
[Angular Material][AngularMaterialMain] is an example of a sophisticated first-party library.

## Install libraries

Libraries are published as [npm packages][GuideNpmPackages], usually together with schematics that integrate them with the Angular CLI.
To integrate reusable library code into an application, you need to install the package and import the provided functionality in the location you use it.
For most published Angular libraries, use the `ng add <lib_name>` Angular CLI command.

The `ng add` Angular CLI command uses a package manager to install the library package and invokes schematics that are included in the package to other scaffolding within the project code.
Examples of package managers include [npm][NpmjsMain] or [yarn][YarnpkgMain].
Additional scaffolding within the project code includes import statements, fonts, and themes.

A published library typically provides a `README` file or other documentation on how to add that library to your application.
For an example, see the [Angular Material][AngularMaterialMain] documentation.

### Library typings

Typically, library packages include typings in `.d.ts` files; see examples in `node_modules/@angular/material`.
If the package of your library does not include typings and your IDE complains, you might need to install the `@types/<lib_name>` package with the library.

For example, suppose you have a library named `d3`:

<docs-code language="shell">

npm install d3 --save
npm install @types/d3 --save-dev

</docs-code>

Types defined in a `@types/` package for a library installed into the workspace are automatically added to the TypeScript configuration for the project that uses that library.
TypeScript looks for types in the `node_modules/@types` directory by default, so you do not have to add each type package individually.

If a library does not have typings available at `@types/`, you may use it by manually adding typings for it.
To do this:

1. Create a `typings.d.ts` file in your `src/` directory.
    This file is automatically included as global type definition.

1. Add the following code in `src/typings.d.ts`:

    <docs-code language="typescript">

    declare module 'host' {
      export interface Host {
        protocol?: string;
        hostname?: string;
        pathname?: string;
      }
      export function parse(url: string, queryString?: string): Host;
    }

    </docs-code>

1. In the component or file that uses the library, add the following code:

    <docs-code language="typescript">

    import * as host from 'host';
    const parsedUrl = host.parse('https://angular.dev');
    console.log(parsedUrl.hostname);

    </docs-code>

Define more typings as needed.

## Updating libraries

A library is able to be updated by the publisher, and also has individual dependencies which need to be kept current.
To check for updates to your installed libraries, use the [`ng update`][CliUpdate] Angular CLI command.

Use `ng update <lib_name>` Angular CLI command to update individual library versions.
The Angular CLI checks the latest published release of the library, and if the latest version is newer than your installed version, downloads it and updates your `package.json` to match the latest version.

When you update Angular to a new version, you need to make sure that any libraries you are using are current.
If libraries have interdependencies, you might have to update them in a particular order.
See the [Angular Update Guide][AngularUpdateMain] for help.

## Adding a library to the runtime global scope

If a legacy JavaScript library is not imported into an application, you may add it to the runtime global scope and load it as if it was added in a script tag.
Configure the Angular CLI to do this at build time using the `scripts` and `styles` options of the build target in the [`angular.json`][GuideWorkspaceConfig] workspace build configuration file.

For example, to use the [Bootstrap 4][GetbootstrapDocs40GettingStartedIntroduction] library

1. Install the library and the associated dependencies using the npm package manager:

    <docs-code language="shell">

    npm install jquery --save
    npm install popper.js --save
    npm install bootstrap --save

    </docs-code>

1. In the `angular.json` configuration file, add the associated script files to the `scripts` array:

    <docs-code language="json">

    "scripts": [
      "node_modules/jquery/dist/jquery.slim.js",
      "node_modules/popper.js/dist/umd/popper.js",
      "node_modules/bootstrap/dist/js/bootstrap.js"
    ],

    </docs-code>

1. Add the `bootstrap.css` CSS file to the `styles` array:

    <docs-code language="css">

    "styles": [
      "node_modules/bootstrap/dist/css/bootstrap.css",
      "src/styles.css"
    ],

    </docs-code>

1. Run or restart the `ng serve` Angular CLI command to see Bootstrap 4 work in your application.

### Using runtime-global libraries inside your app

After you import a library using the "scripts" array, do **not** import it using an import statement in your TypeScript code.
The following code snippet is an example import statement.

<docs-code language="typescript">

import * as $ from 'jquery';

</docs-code>

If you import it using import statements, you have two different copies of the library: one imported as a global library, and one imported as a module.
This is especially bad for libraries with plugins, like JQuery, because each copy includes different plugins.

Instead, run the `npm install @types/jquery` Angular CLI command to download typings for your library and then follow the library installation steps.
This gives you access to the global variables exposed by that library.

### Defining typings for runtime-global libraries

If the global library you need to use does not have global typings, you can declare them manually as `any` in `src/typings.d.ts`.

For example:

<docs-code language="typescript">

declare var libraryName: any;

</docs-code>

Some scripts extend other libraries; for instance with JQuery plugins:

<docs-code language="typescript">

$('.test').myPlugin();

</docs-code>

In this case, the installed `@types/jquery` does not include `myPlugin`, so you need to add an interface in `src/typings.d.ts`.
For example:

<docs-code language="typescript">

interface JQuery {
  myPlugin(options?: any): any;
}

</docs-code>

If you do not add the interface for the script-defined extension, your IDE shows an error:

<docs-code language="text">

[TS][Error] Property 'myPlugin' does not exist on type 'JQuery'

</docs-code>

[CliUpdate]: cli/update "ng update | CLI |Angular"

[GuideNpmPackages]: reference/configs/npm-packages "Workspace npm dependencies | Angular"

[GuideWorkspaceConfig]: reference/configs/workspace-config "Angular workspace configuration | Angular"

[Resources]: resources "Explore Angular Resources | Angular"

[AngularMaterialMain]: https://material.angular.dev "Angular Material | Angular"

[AngularUpdateMain]: https://angular.dev/update-guide "Angular Update Guide | Angular"

[GetbootstrapDocs40GettingStartedIntroduction]: https://getbootstrap.com/docs/4.0/getting-started/introduction "Introduction | Bootstrap"

[NpmjsMain]: https://www.npmjs.com "npm"

[YarnpkgMain]: https://yarnpkg.com " Yarn"
