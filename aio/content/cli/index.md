<h1 class="no-toc">CLI Command Reference</h1>

The Angular CLI is a command-line tool that you use to initialize, develop, scaffold, and maintain Angular applications.

## Getting Started

### Installing Angular CLI

The current version of Angular CLI is 6.x.

* Both the CLI and the projects that you generate with the tool have dependencies that require Node 8.9 or higher, together with NPM 5.5.1 or higher.
* Install the CLI using npm:
  `npm install -g @angular/cli`
* The CLI is an open-source tool:
  https://github.com/angular/angular-cli/tree/master/packages/angular/cli

For details about changes between versions, and information about updating from previous releases, see the Releases tab on GitHub.

### Basic workflow

Invoke the tool on the command line through the ng executable. Online help is available on the command line:

```
> ng help               Lists commands with short descriptions
> ng <command> --help   Lists options for a command.
```

To create, build, and serve a new, basic Angular project on a development server, use the following commands:

```
cd <parent of new workspace>
ng new my-project
cd my-project
ng serve
```

In your browser, open http://localhost:4200/ to see the new app run.

### Workspaces and project files

Angular 6 introduced the workspace directory structure for Angular apps. A workspace defines a project. A project can contain multiple apps, as well as libraries that can be used in any of the apps.

Some commands (such as build) must be executed from within a workspace folder, and others (such as new) must be executed from outside any workspace. This requirement is called out in the description of each command where it applies.The `new` command creates a [workspace](guide/glossary#workspace) to contain [projects](guide/glossary#project). A project can be an app or a library, and a workspace can contain multiple apps and libraries.

A newly generated app project contains the source files for a root module, with a root component and template, which you can edit directly, or add to and modify using CLI commands. Use the generate command to add new files for additional components and services, and code for new pipes, directives, and so on.

* Commands such as `add` and `generate`, that create or operate on apps and libraries, must be executed from within a workspace folder.
* Apps in a workspace can use libraries in the same workspace.
* Each project has a `src` folder that contains the logic, data, and assets.
  See an example of the [file structure](guide/quickstart#project-file-review) in [Getting Started](guide/quickstart).

When you use the `serve` command to build an app, the server automatically rebuilds the app and reloads the page when you change any of the source files.

### Configuring the CLI

Configuration files let you customize your project. The CLI configuration file, angular.json, is created at the top level of the project folder. This is where you can set CLI defaults for your project, and specify which files to include when the CLI builds the project.

The CLI config command lets you set and retrieve configuration values from the command line, or you can edit the angular.json file directly.

* See the complete schema for angular.json.
* Learn more about configuration options for Angular (link to new guide?)

### Command options and arguments

All commands and some options have aliases, as listed in the descriptions. Option names are prefixed with a double dash (--), but arguments and option aliases are not.

Typically, the name of a generated artifact can be given as an argument to the command or specified with the --name option. Most commands have additional options.

Command syntax is shown as follows:

```
ng commandNameOrAlias <arg> [options]
```

Options take either string or Boolean arguments. Defaults are shown in bold for Boolean or enumerated values, and are given with the description. For example:

```
	--optionNameOrAlias=<filename>
	--optionNameOrAlias=true|false
	--optionNameOrAlias=allowedValue1|allowedValue2|allowedValue3
```

Boolean options can also be expressed with a prefix `no-`  to indicate a value of false. For example,  `--no-prod` is equivalent to `--prod=false`.