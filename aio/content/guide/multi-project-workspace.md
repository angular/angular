# Multi-project workspace

A multi-project workspace is suitable for an enterprise that uses a single repository and global configuration for all Angular projects (the "monorepo" model). A multi-project workspace also supports library development.

<div class="alert is-helpful">

  For the sample app that this page describes, see the <live-example></live-example>.

</div>

### Setting up for a multi-project workspace

If you intend to have multiple projects in a workspace, you can skip the initial application generation when you create the workspace, and give the workspace a unique name.
The following command creates a workspace with all of the workspace-wide configuration files, but no root-level application.

<code-example language="bash">
ng new my-workspace --create-application false
</code-example>

You can then generate apps and libraries with names that are unique within the workspace.

<code-example language="bash">
cd my-workspace
ng generate application my-first-app
</code-example>

### Multiple project file structure

The first explicitly generated application goes into the `projects/` folder along with all other projects in the workspace.
Newly generated libraries are also added under `projects/`.
When you create projects this way, the file structure of the workspace is entirely consistent with the structure of the [workspace configuration file](guide/workspace-config), `angular.json`.

<code-example language="none">
my-workspace/
  ...             (workspace-wide config files)
  projects/       (generated applications and libraries)
    my-first-app/ --(an explicitly generated application)
      ...         --(application-specific config)
      e2e/        ----(corresponding e2e tests)
         src/     ----(e2e tests source)
         ...      ----(e2e-specific config)
      src/        --(source and support files for application)
    my-lib/       --(a generated library)
      ...         --(library-specific config)
      src/        --source and support files for library)
</code-example>

## Library project files

When you generate a library using the CLI (with a command such as `ng generate library my-lib`), the generated files go into the projects/ folder of the workspace. For more information about creating your own libraries, see  [Creating Libraries](guide/creating-libraries).

Libraries (unlike applications and their associated e2e projects) have their own `package.json` configuration files.

Under the `projects/` folder, the `my-lib` folder contains your library code.

| LIBRARY SOURCE FILES | PURPOSE                                                                      |
| :------------------- | :----------------------------------------------------------------------------|
| `src/lib`           |  Contains your library project's logic and data. Like an application project, a library project can contain components, services, modules, directives, and pipes.                                                            |
| `src/test.ts`       | The main entry point for your unit tests, with some library-specific configuration. You don't typically need to edit this file.                                                                                            |
| `src/public-api.ts`  | Specifies all files that are exported from your library.                                                                                                                                                                     |
| `karma.conf.js`      | Library-specific [Karma](https://karma-runner.github.io/2.0/config/configuration-file.html) configuration.                                                                                                                   |
| `ng-package.json`    | Configuration file used by [ng-packagr](https://github.com/ng-packagr/ng-packagr) for building your library.                                                                                                                 |
| `package.json`       | Configures [npm package dependencies](guide/npm-packages) that are required for this library.                                                                                                                                |
| `tsconfig.lib.json`  | Library-specific [TypeScript](https://www.typescriptlang.org/) configuration, including TypeScript and Angular template compiler options. See [TypeScript Configuration](guide/typescript-configuration).            |
| `tsconfig.spec.json` | [TypeScript](https://www.typescriptlang.org/) configuration for the library tests. See [TypeScript Configuration](guide/typescript-configuration).                                                                     |
| `tslint.json`        | Library-specific [TSLint](https://palantir.github.io/tslint/) configuration. |
