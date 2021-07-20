# Setting up the local environment and workspace

This guide explains how to set up your environment for Angular development using the [Angular CLI tool](cli "CLI command reference").
It includes information about prerequisites, installing the CLI, creating an initial workspace and starter app, and running that app locally to verify your setup.

<div class="callout is-helpful">
<header>Try Angular without local setup</header>

If you are new to Angular, you might want to start with [Try it now!](start), which introduces the essentials of Angular in the context of a ready-made basic online store app for you to examine and modify. This standalone tutorial takes advantage of the interactive [StackBlitz](https://stackblitz.com/) environment for online development. You don't need to set up your local environment until you're ready.

</div>


{@a devenv}
{@a prerequisites}
## Prerequisites

To use the Angular framework, you should be familiar with the following:

* [JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript/A_re-introduction_to_JavaScript)
* [HTML](https://developer.mozilla.org/docs/Learn/HTML/Introduction_to_HTML)
* [CSS](https://developer.mozilla.org/docs/Learn/CSS/First_steps)

Knowledge of [TypeScript](https://www.typescriptlang.org/) is helpful, but not required.

To install Angular on your local system, you need the following:

{@a nodejs}

* **Node.js**

  Angular requires an [active LTS or maintenance LTS](https://nodejs.org/about/releases) version of Node.js.

  <div class="alert is-helpful">

  For information about specific version requirements, see the `engines` key in the [package.json](https://unpkg.com/browse/@angular/core/package.json) file.

  </div>

  For more information on installing Node.js, see [nodejs.org](https://nodejs.org "Nodejs.org").
  If you are unsure what version of Node.js runs on your system, run `node -v` in a terminal window.

{@a npm}

* **npm package manager**

  Angular, the Angular CLI, and Angular applications depend on [npm packages](https://docs.npmjs.com/getting-started/what-is-npm) for many features and functions.
  To download and install npm packages, you need an npm package manager.
  This guide uses the [npm client](https://docs.npmjs.com/cli/install) command line interface, which is installed with `Node.js` by default.
  To check that you have the npm client installed, run `npm -v` in a terminal window.


{@a install-cli}

## Install the Angular CLI

You use the Angular CLI to create projects, generate application and library code, and perform a variety of ongoing development tasks such as testing, bundling, and deployment.

To install the Angular CLI, open a terminal window and run the following command:

<code-example language="sh">
  npm install -g @angular/cli<aio-angular-dist-tag class="pln"></aio-angular-dist-tag>
</code-example>

{@a create-proj}

## Create a workspace and initial application

You develop apps in the context of an Angular [**workspace**](guide/glossary#workspace).

To create a new workspace and initial starter app:

1. Run the CLI command `ng new` and provide the name `my-app`, as shown here:

   <code-example language="sh">
      ng new my-app

    </code-example>

2. The `ng new` command prompts you for information about features to include in the initial app. Accept the defaults by pressing the Enter or Return key.

The Angular CLI installs the necessary Angular npm packages and other dependencies. This can take a few minutes.

The CLI creates a new workspace and a simple Welcome app, ready to run.

{@a serve}

## Run the application

The Angular CLI includes a server, for you to build and serve your app locally.

1. Navigate to the workspace folder, such as `my-app`.

1. Run the following command:

<code-example language="sh">
  cd my-app
  ng serve --open
</code-example>

The `ng serve` command launches the server, watches your files,
and rebuilds the app as you make changes to those files.

The `--open` (or just `-o`) option automatically opens your browser
to `http://localhost:4200/`.

If your installation and setup was successful, you should see a page similar to the following.


<div class="lightbox">
  <img src='generated/images/guide/setup-local/app-works.png' alt="Welcome to my-app!">
</div>


## Next steps

* For a more thorough introduction to the fundamental concepts and terminology of Angular single-page app architecture and design principles, read the [Angular Concepts](guide/architecture) section.

* Work through the [Tour of Heroes Tutorial](tutorial), a complete hands-on exercise that introduces you to the app development process using the Angular CLI and walks through important subsystems.

* To learn more about using the Angular CLI, see the [CLI Overview](cli "CLI Overview"). In addition to creating the initial workspace and app scaffolding, use the CLI to generate Angular code such as components and services. The CLI supports the full development cycle, including building, testing, bundling, and deployment.

* For more information about the Angular files generated by `ng new`, see [Workspace and Project File Structure](guide/file-structure).
