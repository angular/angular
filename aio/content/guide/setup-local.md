# Setting up the local environment and workspace


This guide explains how to set up your environment for Angular development using the [Angular CLI tool](cli "CLI command reference").
It includes information about prerequisites, installing the CLI, creating an initial workspace and starter app, and running that app locally to verify your setup.


<div class="callout is-helpful">
<header>Try Angular without local setup</header>

If you are new to Angular, you might want to start with [Try it now!](start), which introduces the essentials of Angular in the context of a ready-made basic online store app that you can examine and modify. This standalone tutorial takes advantage of the interactive [StackBlitz](https://stackblitz.com/) environment for online development. You don't need to set up your local environment until you're ready.

</div>


{@a devenv}
{@a prerequisites}
## Prerequisites

To use the Angular framework, you should be familiar with the following:

* [JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript/A_re-introduction_to_JavaScript)
* [HTML](https://developer.mozilla.org/docs/Learn/HTML/Introduction_to_HTML)
* [CSS](https://developer.mozilla.org/docs/Learn/CSS/First_steps)

Knowledge of [TypeScript](https://www.typescriptlang.org/) is helpful, but not required.

{@a nodejs}
### Node.js

Make sure your development environment includes `Node.js®` and an npm package manager.

Angular requires a [current, active LTS, or maintenance LTS](https://nodejs.org/about/releases/) version of `Node.js`. See the `engines` key for the specific version requirements in our [package.json](https://unpkg.com/@angular/cli/package.json).

* To check your version, run `node -v` in a terminal/console window.

* To get `Node.js`, go to [nodejs.org](https://nodejs.org "Nodejs.org").

{@a npm}
### npm package manager

Angular, the Angular CLI, and Angular apps depend on features and functionality provided by libraries that are available as [npm packages](https://docs.npmjs.com/getting-started/what-is-npm). To download and install npm packages, you must have an npm package manager.

This setup guide uses the [npm client](https://docs.npmjs.com/cli/install) command line interface, which is installed with `Node.js` by default.

To check that you have the npm client installed, run `npm -v` in a terminal/console window.


{@a install-cli}

## Step 1: Install the Angular CLI

You use the Angular CLI
to create projects, generate application and library code, and perform a variety of ongoing development tasks such as testing, bundling, and deployment.

Install the Angular CLI globally.

To install the CLI using `npm`, open a terminal/console window and enter the following command:


<code-example language="sh" class="code-shell">
  npm install -g @angular/cli

</code-example>



{@a create-proj}

## Step 2: Create a workspace and initial application

You develop apps in the context of an Angular [**workspace**](guide/glossary#workspace).

To create a new workspace and initial starter app:

1. Run the CLI command `ng new` and provide the name `my-app`, as shown here:

    <code-example language="sh" class="code-shell">
      ng new my-app

    </code-example>

2. The `ng new` command prompts you for information about features to include in the initial app. Accept the defaults by pressing the Enter or Return key.

The Angular CLI installs the necessary Angular npm packages and other dependencies. This can take a few minutes.

The CLI creates a new workspace and a simple Welcome app, ready to run.


{@a serve}

## Step 3: Run the application

The Angular CLI includes a server, so that you can easily build and serve your app locally.

1. Go to the workspace folder (`my-app`).

1. Launch the server by using the CLI command `ng serve`, with the `--open` option.

<code-example language="sh" class="code-shell">
  cd my-app
  ng serve --open
</code-example>

The `ng serve` command launches the server, watches your files,
and rebuilds the app as you make changes to those files.

The `--open` (or just `-o`) option automatically opens your browser
to `http://localhost:4200/`.

You will see:


<div class="lightbox">
  <img src='generated/images/guide/setup-local/app-works.png' alt="Welcome to my-app!">
</div>


## Next steps

* For a more thorough introduction to the fundamental concepts and terminology of Angular single-page app architecture and design principles, read the [Angular Concepts](guide/architecture) section.

* Work through the [Tour of Heroes Tutorial](tutorial), a complete hands-on exercise that introduces you to the app development process using the Angular CLI and walks through important subsystems.

* To learn more about using the Angular CLI, see the [CLI Overview](cli "CLI Overview"). In addition to creating the initial workspace and app scaffolding, you can use the CLI to generate Angular code such as components and services. The CLI supports the full development cycle, including building, testing, bundling, and deployment.

* For more information about the Angular files generated by `ng new`, see [Workspace and Project File Structure](guide/file-structure).
