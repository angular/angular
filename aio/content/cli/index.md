# CLI Overview and Command Reference

The Angular CLI is a command-line interface tool that you use to initialize, develop, scaffold, and maintain Angular applications directly from a command shell.

## Installing Angular CLI

Major versions of Angular CLI follow the supported major version of Angular, but minor versions can be released separately.

Install the CLI using the `npm` package manager:
<code-example language="bash">
npm install -g @angular/cli
</code-example>

For details about changes between versions, and information about updating from previous releases,
see the Releases tab on GitHub: https://github.com/angular/angular-cli/releases

## Basic workflow

Invoke the tool on the command line through the `ng` executable.
Online help is available on the command line.
Enter the following to list commands or options for a given command (such as [generate](cli/generate)) with a short description.

<code-example language="bash">
ng help
ng generate --help
</code-example>

To create, build, and serve a new, basic Angular project on a development server, go to the parent directory of your new workspace use the following commands:

<code-example language="bash">
ng new my-first-project
cd my-first-project
ng serve
</code-example>

In your browser, open http://localhost:4200/ to see the new app run.
When you use the [ng serve](cli/serve) command to build an app and serve it locally, the server automatically rebuilds the app and reloads the page when you change any of the source files.

<div class="alert is-helpful">

   When you run `ng new my-first-project` a new folder, named `my-first-project`, will be created in the current working directory. Since you want to be able to create files inside that folder, make sure you have sufficient rights in the current working directory before running the command.

   If the current working directory is not the right place for your project, you can change to a more appropriate directory by running `cd <path-to-other-directory>` first.

</div>

## Workspaces and project files

The [ng new](cli/new) command creates an *Angular workspace* folder and generates a new app skeleton.
A workspace can contain multiple apps and libraries.
The initial app created by the [ng new](cli/new) command is at the top level of the workspace.
When you generate an additional app or library in a workspace, it goes into a `projects/` subfolder.

A newly generated app contains the source files for a root module, with a root component and template.
Each app has a `src` folder that contains the logic, data, and assets.

You can edit the generated files directly, or add to and modify them using CLI commands.
Use the [ng generate](cli/generate) command to add new files for additional components and services, and code for new pipes, directives, and so on.
Commands such as [add](cli/add) and [generate](cli/generate), which create or operate on apps and libraries, must be executed from within a workspace or project folder.

* See more about the [Workspace file structure](guide/file-structure).

### Workspace and project configuration

A single workspace configuration file, `angular.json`, is created at the top level of the workspace.
This is where you can set per-project defaults for CLI command options, and specify configurations to use when the CLI builds a project for different targets.

The [ng config](cli/config) command lets you set and retrieve configuration values from the command line, or you can edit the `angular.json` file directly.
Note that option names in the configuration file must use [camelCase](guide/glossary#case-types), while option names supplied to commands can use either camelCase or dash-case.

* See more about [Workspace Configuration](guide/workspace-config).
* See the [complete schema](https://github.com/angular/angular-cli/wiki/angular-workspace) for `angular.json`.

## CLI command-language syntax

Command syntax is shown as follows:

`ng` *commandNameOrAlias* *requiredArg* [*optionalArg*] `[options]`

* Most commands, and some options, have aliases. Aliases are shown in the syntax statement for each command.

* Option names are prefixed with a double dash (--).
    Option aliases are prefixed with a single dash (-).
    Arguments are not prefixed.
    For example:
    <code-example language="bash">
        ng build my-app -c production
    </code-example>

* Typically, the name of a generated artifact can be given as an argument to the command or specified with the --name option.

* Argument and option names can be given in either
[camelCase or dash-case](guide/glossary#case-types).
`--myOptionName` is equivalent to `--my-option-name`.

### Boolean options

Boolean options have two forms: `--this-option` sets the flag to `true`, `--no-this-option` sets it to `false`.
If neither option is supplied, the flag remains in its default state, as listed in the reference documentation.


### Relative paths

Options that specify files can be given as absolute paths, or as paths relative to the current working directory, which is generally either the workspace or project root.

### Schematics

The [ng generate](cli/generate) and  [ng add](cli/add) commands take as an argument the artifact or library to be generated or added to the current project.
In addition to any general options, each artifact or library defines its own options in a *schematic*.
Schematic options are supplied to the command in the same format as immediate command options.
