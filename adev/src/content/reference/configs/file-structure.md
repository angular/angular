# Workspace and project file structure

You develop applications in the context of an Angular workspace.
A workspace contains the files for one or more projects.
A project is the set of files that comprise an application or a shareable library.

The Angular CLI `ng new` command creates a workspace.

<docs-code language="shell">

ng new my-project

</docs-code>

When you run this command, the CLI installs the necessary Angular npm packages and other dependencies in a new workspace, with a root-level application named *my-project*.

By default, `ng new` creates an initial skeleton application at the root level of the workspace, along with its end-to-end tests.
The skeleton is for a simple welcome application that is ready to run and easy to modify.
The root-level application has the same name as the workspace, and the source files reside in the `src/` subfolder of the workspace.

This default behavior is suitable for a typical "multi-repo" development style where each application resides in its own workspace.
Beginners and intermediate users are encouraged to use `ng new` to create a separate workspace for each application.

Angular also supports workspaces with [multiple projects](#multiple-projects).
This type of development environment is suitable for advanced users who are developing shareable libraries,
and for enterprises that use a "monorepo" development style, with a single repository and global configuration for all Angular projects.

To set up a monorepo workspace, you should skip creating the root application.
See [Setting up for a multi-project workspace](#multiple-projects) below.

## Workspace configuration files

All projects within a workspace share a [configuration](reference/configs/workspace-config).
The top level of the workspace contains workspace-wide configuration files, configuration files for the root-level application, and subfolders for the root-level application source and test files.

| Workspace configuration files | Purpose                                                                                                                                                                                                                                                                                                          |
|:---                           |:---                                                                                                                                                                                                                                                                                                              |
| `.editorconfig`               | Configuration for code editors. See [EditorConfig](https://editorconfig.org).                                                                                                                                                                                                                                    |
| `.gitignore`                  | Specifies intentionally untracked files that [Git](https://git-scm.com) should ignore.                                                                                                                                                                                                                           |
| `README.md`                   | Documentation for the workspace.                                                                                                                                                                                                                                                                                 |
| `angular.json`                | CLI configuration for all projects in the workspace, including configuration options for how to build, serve, and test each project. For details, see [Angular Workspace Configuration](reference/configs/workspace-config).                                                                                     |
| `package.json`                | Configures [npm package dependencies](reference/configs/npm-packages) that are available to all projects in the workspace. See [npm documentation](https://docs.npmjs.com/files/package.json) for the specific format and contents of this file.                                                                 |
| `package-lock.json`           | Provides version information for all packages installed into `node_modules` by the npm client. See [npm documentation](https://docs.npmjs.com/files/package-lock.json) for details.                                                                                                                              |
| `src/`                        | Source files for the root-level application project.                                                                                                                                                                                                                                                             |
| `public/`                     | Contains image and other asset files to be served as static files by the dev server and copied as-is when you build your application.                                                                                             |
| `node_modules/`               | Installed [npm packages](reference/configs/npm-packages) for the entire workspace. Workspace-wide `node_modules` dependencies are visible to all projects.                                                                                                                                                       |
| `tsconfig.json`               | The base [TypeScript](https://www.typescriptlang.org) configuration for projects in the workspace. All other configuration files inherit from this base file. For more information, see the [relevant TypeScript documentation](https://www.typescriptlang.org/docs/handbook/tsconfig-json.html#tsconfig-bases). |

## Application project files

By default, the CLI command `ng new my-app` creates a workspace folder named "my-app" and generates a new application skeleton in a `src/` folder at the top level of the workspace.
A newly generated application contains source files for a root module, with a root component and template.

When the workspace file structure is in place, you can use the `ng generate` command on the command line to add functionality and data to the application.
This initial root-level application is the *default app* for CLI commands (unless you change the default after creating [additional apps](#multiple-projects)).

For a single-application workspace, the `src` subfolder of the workspace contains the source files (application logic, data, and assets) for the root application.
For a multi-project workspace, additional projects in the `projects` folder contain a `project-name/src/` subfolder with the same structure.

### Application source files

Files at the top level of `src/` support running your application.
Subfolders contain the application source and application-specific configuration.

| Application support files | Purpose                                                                                                                                                                                                                           |
|:---                       |:---                                                                                                                                                                                                                               |
| `app/`                    | Contains the component files in which your application logic and data are defined. See details [below](#app-src).                                                                                                                 |
| `favicon.ico`             | An icon to use for this application in the bookmark bar.                                                                                                                                                                          |
| `index.html`              | The main HTML page that is served when someone visits your site. The CLI automatically adds all JavaScript and CSS files when building your app, so you typically don't need to add any `<script>` or`<link>` tags here manually. |
| `main.ts`                 | The main entry point for your application.                                                                                                                                                                                        |
| `styles.css`              | Global CSS styles applied to the entire application.                                                                                                                                                                              |

Inside the `src` folder, the `app` folder contains your project's logic and data.
Angular components, templates, and styles go here.

| `src/app/` files        | Purpose                                                                                                                                                                                                                                                                            |
|:---                     |:---                                                                                                                                                                                                                                                                                |
| `app.config.ts`         | Defines the application configuration that tells Angular how to assemble the application. As you add more providers to the app, they should be declared here.<br><br>*Only generated when using the `--standalone` option.*                                                        |
| `app.component.ts`      | Defines the application's root component, named `AppComponent`. The view associated with this root component becomes the root of the view hierarchy as you add components and services to your application.                                                                        |
| `app.component.html`    | Defines the HTML template associated with `AppComponent`.                                                                                                                                                                                                                          |
| `app.component.css`     | Defines the CSS stylesheet for `AppComponent`.                                                                                                                                                                                                                                     |
| `app.component.spec.ts` | Defines a unit test for `AppComponent`.                                                                                                                                                                                                                                            |
| `app.module.ts`         | Defines the root module, named `AppModule`, that tells Angular how to assemble the application. Initially declares only the `AppComponent`. As you add more components to the app, they must be declared here.<br><br>*Only generated when using the `--standalone false` option.* |
| `app.routes.ts`         | Defines the application's routing configuration.                                                                                                                                                                                                                                   |

### Application configuration files

Application-specific configuration files for the root application reside at the workspace root level.
For a multi-project workspace, project-specific configuration files are in the project root, under `projects/project-name/`.

Project-specific [TypeScript](https://www.typescriptlang.org) configuration files inherit from the workspace-wide `tsconfig.json`.

| Application-specific configuration files | Purpose                                                                                                                                                                                             |
|:---                                      |:---                                                                                                                                                                                                 |
| `tsconfig.app.json`                      | Application-specific [TypeScript configuration](https://www.typescriptlang.org/docs/handbook/tsconfig-json.html), including [Angular compiler options](reference/configs/angular-compiler-options). |
| `tsconfig.spec.json`                     | [TypeScript configuration](https://www.typescriptlang.org/docs/handbook/tsconfig-json.html) for application tests.                                                                                  |

## Multiple projects

A multi-project workspace is suitable for an organization that uses a single repository and global configuration for multiple Angular projects (the "monorepo" model).
A multi-project workspace also supports library development.

### Setting up for a multi-project workspace

If you intend to have multiple projects in a workspace, you can skip the initial application generation when you create the workspace, and give the workspace a unique name.
The following command creates a workspace with all of the workspace-wide configuration files, but no root-level application.

<docs-code language="shell">

ng new my-workspace --no-create-application

</docs-code>

You can then generate applications and libraries with names that are unique within the workspace.

<docs-code language="shell">

cd my-workspace
ng generate application my-app
ng generate library my-lib

</docs-code>

### Multiple project file structure

The first explicitly generated application goes into the `projects` folder along with all other projects in the workspace.
Newly generated libraries are also added under `projects`.
When you create projects this way, the file structure of the workspace is entirely consistent with the structure of the [workspace configuration file](reference/configs/workspace-config), `angular.json`.

```markdown
my-workspace/
  ├── …                (workspace-wide configuration files)
  └── projects/        (applications and libraries)
      ├── my-app/      (an explicitly generated application)
      │   └── …        (application-specific code and configuration)
      └── my-lib/      (a generated library)
          └── …        (library-specific code and configuration)
```

## Library project files

When you generate a library using the CLI (with a command such as `ng generate library my-lib`), the generated files go into the `projects/` folder of the workspace.
For more information about creating your own libraries, see  [Creating Libraries](tools/libraries/creating-libraries).

Unlike an application, a library has its own `package.json` configuration file.

Under the `projects/` folder, the `my-lib` folder contains your library code.

| Library source files     | Purpose                                                                                                                                                                                         |
|:---                      |:---                                                                                                                                                                                             |
| `src/lib`                | Contains your library project's logic and data. Like an application project, a library project can contain components, services, modules, directives, and pipes.                                |
| `src/public-api.ts`      | Specifies all files that are exported from your library.                                                                                                                                        |
| `ng-package.json`        | Configuration file used by [ng-packagr](https://github.com/ng-packagr/ng-packagr) for building your library.                                                                                    |
| `package.json`           | Configures [npm package dependencies](reference/configs/npm-packages) that are required for this library.                                                                                       |
| `tsconfig.lib.json`      | Library-specific [TypeScript Configuration](https://www.typescriptlang.org/docs/handbook/tsconfig-json.html), including [Angular compiler options](reference/configs/angular-compiler-options). |
| `tsconfig.lib.prod.json` | Library-specific [TypeScript Configuration](https://www.typescriptlang.org/docs/handbook/tsconfig-json.html) that is used when building the library in production mode.                         |
| `tsconfig.spec.json`     | [TypeScript Configuration](https://www.typescriptlang.org/docs/handbook/tsconfig-json.html) for the library's unit tests.                                                                       |
