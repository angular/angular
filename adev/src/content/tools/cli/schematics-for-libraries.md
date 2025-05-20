# Schematics for libraries

When you create an Angular library, you can provide and package it with schematics that integrate it with the Angular CLI.
With your schematics, your users can use `ng add` to install an initial version of your library,
`ng generate` to create artifacts defined in your library, and `ng update` to adjust their project for a new version of your library that introduces breaking changes.

All three types of schematics can be part of a collection that you package with your library.

## Creating a schematics collection

To start a collection, you need to create the schematic files.
The following steps show you how to add initial support without modifying any project files.

1. In your library's root folder, create a `schematics` folder.
1. In the `schematics/` folder, create an `ng-add` folder for your first schematic.
1. At the root level of the `schematics` folder, create a `collection.json` file.
1. Edit the `collection.json` file to define the initial schema for your collection.

    <docs-code header="projects/my-lib/schematics/collection.json (Schematics Collection)" path="adev/src/content/examples/schematics-for-libraries/projects/my-lib/schematics/collection.1.json"/>

    * The `$schema` path is relative to the Angular Devkit collection schema.
    * The `schematics` object describes the named schematics that are part of this collection.
    * The first entry is for a schematic named `ng-add`.
        It contains the description, and points to the factory function that is called when your schematic is executed.

1. In your library project's `package.json` file, add a "schematics" entry with the path to your schema file.
    The Angular CLI uses this entry to find named schematics in your collection when it runs commands.

    <docs-code header="projects/my-lib/package.json (Schematics Collection Reference)" path="adev/src/content/examples/schematics-for-libraries/projects/my-lib/package.json" visibleRegion="collection"/>

The initial schema that you have created tells the CLI where to find the schematic that supports the `ng add` command.
Now you are ready to create that schematic.

## Providing installation support

A schematic for the `ng add` command can enhance the initial installation process for your users.
The following steps define this type of schematic.

1. Go to the `<lib-root>/schematics/ng-add` folder.
1. Create the main file, `index.ts`.
1. Open `index.ts` and add the source code for your schematic factory function.

    <docs-code header="projects/my-lib/schematics/ng-add/index.ts (ng-add Rule Factory)" path="adev/src/content/examples/schematics-for-libraries/projects/my-lib/schematics/ng-add/index.ts"/>

The Angular CLI will install the latest version of the library automatically, and this example is taking it a step further by adding the `MyLibModule` to the root of the application. The `addRootImport` function accepts a callback that needs to return a code block. You can write any code inside of the string tagged with the `code` function and any external symbol have to be wrapped with the `external` function to ensure that the appropriate import statements are generated.

### Define dependency type

Use the `save` option of `ng-add` to configure if the library should be added to the `dependencies`, the `devDependencies`, or not saved at all in the project's `package.json` configuration file.

<docs-code header="projects/my-lib/package.json (ng-add Reference)" path="adev/src/content/examples/schematics-for-libraries/projects/my-lib/package.json" visibleRegion="ng-add"/>

Possible values are:

| Values              | Details |
|:---                 |:---     |
| `false`             | Don't add the package to `package.json` |
| `true`              | Add the package to the dependencies     |
| `"dependencies"`    | Add the package to the dependencies     |
| `"devDependencies"` | Add the package to the devDependencies  |

## Building your schematics

To bundle your schematics together with your library, you must configure the library to build the schematics separately, then add them to the bundle.
You must build your schematics *after* you build your library, so they are placed in the correct directory.

* Your library needs a custom Typescript configuration file with instructions on how to compile your schematics into your distributed library
* To add the schematics to the library bundle, add scripts to the library's `package.json` file

Assume you have a library project `my-lib` in your Angular workspace.
To tell the library how to build the schematics, add a `tsconfig.schematics.json` file next to the generated `tsconfig.lib.json` file that configures the library build.

1. Edit the `tsconfig.schematics.json` file to add the following content.

    <docs-code header="projects/my-lib/tsconfig.schematics.json (TypeScript Config)" path="adev/src/content/examples/schematics-for-libraries/projects/my-lib/tsconfig.schematics.json"/>

    | Options | Details |
    |:---     |:---     |
    | `rootDir` | Specifies that your `schematics` folder contains the input files to be compiled.                                 |
    | `outDir`  | Maps to the library's output folder. By default, this is the `dist/my-lib` folder at the root of your workspace. |

1. To make sure your schematics source files get compiled into the library bundle, add the following scripts to the `package.json` file in your library project's root folder \(`projects/my-lib`\).

    <docs-code header="projects/my-lib/package.json (Build Scripts)" path="adev/src/content/examples/schematics-for-libraries/projects/my-lib/package.json"/>

    * The `build` script compiles your schematic using the custom `tsconfig.schematics.json` file
    * The `postbuild` script copies the schematic files after the `build` script completes
    * Both the `build` and the `postbuild` scripts require the `copyfiles` and `typescript` dependencies.
        To install the dependencies, navigate to the path defined in `devDependencies` and run `npm install` before you run the scripts.

## Providing generation support

You can add a named schematic to your collection that lets your users use the `ng generate` command to create an artifact that is defined in your library.

We'll assume that your library defines a service, `my-service`, that requires some setup.
You want your users to be able to generate it using the following CLI command.

<docs-code language="shell">

ng generate my-lib:my-service

</docs-code>

To begin, create a new subfolder, `my-service`, in the `schematics` folder.

### Configure the new schematic

When you add a schematic to the collection, you have to point to it in the collection's schema, and provide configuration files to define options that a user can pass to the command.

1. Edit the `schematics/collection.json` file to point to the new schematic subfolder, and include a pointer to a schema file that specifies inputs for the new schematic.

    <docs-code header="projects/my-lib/schematics/collection.json (Schematics Collection)" path="adev/src/content/examples/schematics-for-libraries/projects/my-lib/schematics/collection.json"/>

1. Go to the `<lib-root>/schematics/my-service` folder.
1. Create a `schema.json` file and define the available options for the schematic.

    <docs-code header="projects/my-lib/schematics/my-service/schema.json (Schematic JSON Schema)" path="adev/src/content/examples/schematics-for-libraries/projects/my-lib/schematics/my-service/schema.json"/>

    * *id*: A unique ID for the schema in the collection.
    * *title*: A human-readable description of the schema.
    * *type*: A descriptor for the type provided by the properties.
    * *properties*: An object that defines the available options for the schematic.

    Each option associates key with a type, description, and optional alias.
    The type defines the shape of the value you expect, and the description is displayed when the user requests usage help for your schematic.

    See the workspace schema for additional customizations for schematic options.

1. Create a `schema.ts` file and define an interface that stores the values of the options defined in the `schema.json` file.

    <docs-code header="projects/my-lib/schematics/my-service/schema.ts (Schematic Interface)" path="adev/src/content/examples/schematics-for-libraries/projects/my-lib/schematics/my-service/schema.ts"/>

    | Options | Details |
    |:---     |:---     |
    | name    | The name you want to provide for the created service.                                                                                       |
    | path    | Overrides the path provided to the schematic. The default path value is based on the current working directory.                             |
    | project | Provides a specific project to run the schematic on. In the schematic, you can provide a default if the option is not provided by the user. |

### Add template files

To add artifacts to a project, your schematic needs its own template files.
Schematic templates support special syntax to execute code and variable substitution.

1. Create a `files/` folder inside the `schematics/my-service/` folder.
1. Create a file named `__name@dasherize__.service.ts.template` that defines a template to use for generating files.
    This template will generate a service that already has Angular's `HttpClient` injected into an `http` property.

    <docs-code lang="typescript" header="projects/my-lib/schematics/my-service/files/__name@dasherize__.service.ts.template (Schematic Template)">

    import { Injectable } from '@angular/core';
    import { HttpClient } from '@angular/common/http';

    @Injectable({
      providedIn: 'root'
    })
    export class <%= classify(name) %>Service {
      private http = inject(HttpClient);
    }

    </docs-code>

    * The `classify` and `dasherize` methods are utility functions that your schematic uses to transform your source template and filename.

    * The `name` is provided as a property from your factory function.
        It is the same `name` you defined in the schema.

### Add the factory function

Now that you have the infrastructure in place, you can define the main function that performs the modifications you need in the user's project.

The Schematics framework provides a file templating system, which supports both path and content templates.
The system operates on placeholders defined inside files or paths that loaded in the input `Tree`.
It fills these in using values passed into the `Rule`.

For details of these data structures and syntax, see the [Schematics README](https://github.com/angular/angular-cli/blob/main/packages/angular_devkit/schematics/README.md).

1. Create the main file `index.ts` and add the source code for your schematic factory function.
1. First, import the schematics definitions you will need.
    The Schematics framework offers many utility functions to create and use rules when running a schematic.

    <docs-code header="projects/my-lib/schematics/my-service/index.ts (Imports)" path="adev/src/content/examples/schematics-for-libraries/projects/my-lib/schematics/my-service/index.ts" visibleRegion="schematics-imports"/>

1. Import the defined schema interface that provides the type information for your schematic's options.

    <docs-code header="projects/my-lib/schematics/my-service/index.ts (Schema Import)" path="adev/src/content/examples/schematics-for-libraries/projects/my-lib/schematics/my-service/index.ts" visibleRegion="schema-imports"/>

1. To build up the generation schematic, start with an empty rule factory.

    <docs-code header="projects/my-lib/schematics/my-service/index.ts (Initial Rule)" path="adev/src/content/examples/schematics-for-libraries/projects/my-lib/schematics/my-service/index.1.ts" visibleRegion="factory"/>

This rule factory returns the tree without modification.
The options are the option values passed through from the `ng generate` command.

## Define a generation rule

You now have the framework in place for creating the code that actually modifies the user's application to set it up for the service defined in your library.

The Angular workspace where the user installed your library contains multiple projects \(applications and libraries\).
The user can specify the project on the command line, or let it default.
In either case, your code needs to identify the specific project to which this schematic is being applied, so that you can retrieve information from the project configuration.

Do this using the `Tree` object that is passed in to the factory function.
The `Tree` methods give you access to the complete file tree in your workspace, letting you read and write files during the execution of the schematic.

### Get the project configuration

1. To determine the destination project, use the `workspaces.readWorkspace` method to read the contents of the workspace configuration file, `angular.json`.
    To use `workspaces.readWorkspace` you need to create a `workspaces.WorkspaceHost` from the `Tree`.
    Add the following code to your factory function.

    <docs-code header="projects/my-lib/schematics/my-service/index.ts (Schema Import)" path="adev/src/content/examples/schematics-for-libraries/projects/my-lib/schematics/my-service/index.ts" visibleRegion="workspace"/>

    Be sure to check that the context exists and throw the appropriate error.

1. Now that you have the project name, use it to retrieve the project-specific configuration information.

    <docs-code header="projects/my-lib/schematics/my-service/index.ts (Project)" path="adev/src/content/examples/schematics-for-libraries/projects/my-lib/schematics/my-service/index.ts" visibleRegion="project-info"/>

    The `workspace.projects` object contains all the project-specific configuration information.

1. The `options.path` determines where the schematic template files are moved to once the schematic is applied.

    The `path` option in the schematic's schema is substituted by default with the current working directory.
    If the `path` is not defined, use the `sourceRoot` from the project configuration along with the `projectType`.

    <docs-code header="projects/my-lib/schematics/my-service/index.ts (Project Info)" path="adev/src/content/examples/schematics-for-libraries/projects/my-lib/schematics/my-service/index.ts" visibleRegion="path"/>

### Define the rule

A `Rule` can use external template files, transform them, and return another `Rule` object with the transformed template.
Use the templating to generate any custom files required for your schematic.

1. Add the following code to your factory function.

    <docs-code header="projects/my-lib/schematics/my-service/index.ts (Template transform)" path="adev/src/content/examples/schematics-for-libraries/projects/my-lib/schematics/my-service/index.ts" visibleRegion="template"/>

    | Methods            | Details |
    |:---                |:---     |
    | `apply()`          | Applies multiple rules to a source and returns the transformed source. It takes 2 arguments, a source and an array of rules.                                                                                                                     |
    | `url()`            | Reads source files from your filesystem, relative to the schematic.                                                                                                                                                                              |
    | `applyTemplates()` | Receives an argument of methods and properties you want make available to the schematic template and the schematic filenames. It returns a `Rule`. This is where you define the `classify()` and `dasherize()` methods, and the `name` property. |
    | `classify()`       | Takes a value and returns the value in title case. For example, if the provided name is `my service`, it is returned as `MyService`.                                                                                                             |
    | `dasherize()`      | Takes a value and returns the value in dashed and lowercase. For example, if the provided name is MyService, it is returned as `my-service`.                                                                                                     |
    | `move()`           | Moves the provided source files to their destination when the schematic is applied.                                                                                                                                                              |

1. Finally, the rule factory must return a rule.

    <docs-code header="projects/my-lib/schematics/my-service/index.ts (Chain Rule)" path="adev/src/content/examples/schematics-for-libraries/projects/my-lib/schematics/my-service/index.ts" visibleRegion="chain"/>

    The `chain()` method lets you combine multiple rules into a single rule, so that you can perform multiple operations in a single schematic.
    Here you are only merging the template rules with any code executed by the schematic.

See a complete example of the following schematic rule function.

<docs-code header="projects/my-lib/schematics/my-service/index.ts" path="adev/src/content/examples/schematics-for-libraries/projects/my-lib/schematics/my-service/index.ts"/>

For more information about rules and utility methods, see [Provided Rules](https://github.com/angular/angular-cli/tree/main/packages/angular_devkit/schematics#provided-rules).

## Running your library schematic

After you build your library and schematics, you can install the schematics collection to run against your project.
The following steps show you how to generate a service using the schematic you created earlier.

### Build your library and schematics

From the root of your workspace, run the `ng build` command for your library.

<docs-code language="shell">

ng build my-lib

</docs-code>

Then, you change into your library directory to build the schematic

<docs-code language="shell">

cd projects/my-lib
npm run build

</docs-code>

### Link the library

Your library and schematics are packaged and placed in the `dist/my-lib` folder at the root of your workspace.
For running the schematic, you need to link the library into your `node_modules` folder.
From the root of your workspace, run the `npm link` command with the path to your distributable library.

<docs-code language="shell">

npm link dist/my-lib

</docs-code>

### Run the schematic

Now that your library is installed, run the schematic using the `ng generate` command.

<docs-code language="shell">

ng generate my-lib:my-service --name my-data

</docs-code>

In the console, you see that the schematic was run and the `my-data.service.ts` file was created in your application folder.

<docs-code language="shell" hideCopy>

CREATE src/app/my-data.service.ts (208 bytes)

</docs-code>
