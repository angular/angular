# Setting up the local environment and workspace

This guide explains how to set up your environment for Angular development using the [Angular CLI](cli "CLI command reference").
It includes information about installing the CLI, creating an initial workspace and starter app, and running that app locally to verify your setup.

<docs-callout title="Try Angular without local setup">

If you are new to Angular, you might want to start with [Try it now!](tutorials/learn-angular), which introduces the essentials of Angular in your browser.
This standalone tutorial takes advantage of the interactive [StackBlitz](https://stackblitz.com) environment for online development.
You don't need to set up your local environment until you're ready.

</docs-callout>

## Before you start

To use Angular CLI, you should be familiar with the following:

<docs-pill-row>
  <docs-pill href="https://developer.mozilla.org/docs/Web/JavaScript/A_re-introduction_to_JavaScript" title="JavaScript"/>
  <docs-pill href="https://developer.mozilla.org/docs/Learn/HTML/Introduction_to_HTML" title="HTML"/>
  <docs-pill href="https://developer.mozilla.org/docs/Learn/CSS/First_steps" title="CSS"/>
</docs-pill-row>

You should also be familiar with usage of command line interface (CLI) tools and have a general understanding of command shells.
Knowledge of [TypeScript](https://www.typescriptlang.org) is helpful, but not required.

## Dependencies

To install Angular CLI on your local system, you need to install [Node.js](https://nodejs.org/).
Angular CLI uses Node and its associated package manager, npm, to install and run JavaScript tools outside the browser.

[Download and install Node.js](https://nodejs.org/en/download), which will include the `npm` CLI as well.
Angular requires an [active LTS or maintenance LTS](https://nodejs.org/en/about/previous-releases) version of Node.js.
See [Angular's version compatibility](reference/versions) guide for more information.

## Install the Angular CLI

To install the Angular CLI, open a terminal window and run the following command:

<docs-code-multifile>
   <docs-code
     header="npm"
     >
     npm install -g @angular/cli
     </docs-code>
   <docs-code
     header="pnpm"
     >
     pnpm install -g @angular/cli
     </docs-code>
   <docs-code
     header="yarn"
     >
     yarn global add @angular/cli
     </docs-code>
   <docs-code
     header="bun"
     >
     bun install -g @angular/cli
     </docs-code>

 </docs-code-multifile>

### Powershell execution policy

On Windows client computers, the execution of PowerShell scripts is disabled by default, so the above command may fail with an error.
To allow the execution of PowerShell scripts, which is needed for npm global binaries, you must set the following <a href="https://docs.microsoft.com/powershell/module/microsoft.powershell.core/about/about_execution_policies">execution policy</a>:

<docs-code language="sh">

Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned

</docs-code>

Carefully read the message displayed after executing the command and follow the instructions. Make sure you understand the implications of setting an execution policy.

### Unix permissions

On some Unix-like setups, global  scripts may be owned by the root user, so to the above command may fail with a permission error.
Run with `sudo` to execute the command as the root user and enter your password when prompted:

<docs-code-multifile>
   <docs-code
     header="npm"
     >
     sudo npm install -g @angular/cli
     </docs-code>
   <docs-code
     header="pnpm"
     >
     sudo pnpm install -g @angular/cli
     </docs-code>
   <docs-code
     header="yarn"
     >
     sudo yarn global add @angular/cli
     </docs-code>
   <docs-code
     header="bun"
     >
     sudo bun install -g @angular/cli
     </docs-code>

 </docs-code-multifile>

Make sure you understand the implications of running commands as root.

## Create a workspace and initial application

You develop apps in the context of an Angular **workspace**.

To create a new workspace and initial starter app, run the CLI command `ng new` and provide the name `my-app`, as shown here, then answer prompts about features to include:

<docs-code language="shell">

ng new my-app

</docs-code>

The Angular CLI installs the necessary Angular npm packages and other dependencies.
This can take a few minutes.

The CLI creates a new workspace and a small welcome app in a new directory with the same name as the workspace, ready to run.
Navigate to the new directory so subsequent commands use this workspace.

<docs-code language="shell">

cd my-app

</docs-code>

## Run the application

The Angular CLI includes a development server, for you to build and serve your app locally. Run the following command:

<docs-code language="shell">

ng serve --open

</docs-code>

The `ng serve` command launches the server, watches your files, as well as rebuilds the app and reloads the browser as you make changes to those files.

The `--open` (or just `-o`) option automatically opens your browser to `http://localhost:4200/` to view the generated application.

## Workspaces and project files

The [`ng new`](cli/new) command creates an [Angular workspace](reference/configs/workspace-config) folder and generates a new application inside it.
A workspace can contain multiple applications and libraries.
The initial application created by the [`ng new`](cli/new) command is at the root directory of the workspace.
When you generate an additional application or library in an existing workspace, it goes into a `projects/` subfolder by default.

A newly generated application contains the source files for a root component and template.
Each application has a `src` folder that contains its components, data, and assets.

You can edit the generated files directly, or add to and modify them using CLI commands.
Use the [`ng generate`](cli/generate) command to add new files for additional components, directives, pipes, services, and more.
Commands such as [`ng add`](cli/add) and [`ng generate`](cli/generate), which create or operate on applications and libraries, must be executed
from within a workspace. By contrast, commands such as `ng new` must be executed *outside* a workspace because they will create a new one.

## Next steps

* Learn more about the [file structure](reference/configs/file-structure) and [configuration](reference/configs/workspace-config) of the generated workspace.

* Test your new application with [`ng test`](cli/test).

* Generate boilerplate like components, directives, and pipes with [`ng generate`](cli/generate).

* Deploy your new application and make it available to real users with [`ng deploy`](cli/deploy).

* Set up and run end-to-end tests of your application with [`ng e2e`](cli/e2e).
