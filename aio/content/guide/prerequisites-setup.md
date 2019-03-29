# Prerequisites and Setup / Creating a workspace / Local development / Local environment 

This guide describes how to get started with local development. 

It includes: 
* Prerequisites
* How to install the Angular CLI
* How to create a workspace and initial app project
* How to serve an app project locally
* Additional resources

{@a devenv}
{@a prerequisites}
## Prerequisites 


{@a nodejs}
### Node.js

Angular requires `Node.js` version 8.x or 10.x.

* To check your version, run `node -v` in a terminal/console window.

* To get `Node.js`, go to [nodejs.org](https://nodejs.org "Nodejs.org").

{@a npm}
### npm package manager: npm or yarn

Angular, the Angular CLI, and Angular apps depend on features and functionality provided by libraries that are available as [npm packages](https://docs.npmjs.com/getting-started/what-is-npm). To download and install npm packages, you must have an npm package manager. 

The following package managers have been verified with Angular: 

* The [npm client](https://docs.npmjs.com/cli/npm) command line interface, which is installed with `Node.js` by default. To check if you have the npm client installed, run `npm -v` in a terminal/console window. Most of the documentation for Angular assumes the npm client.

* The [yarn client](https://yarnpkg.com/) command line interface. 

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

You develop apps in the context of an Angular [**workspace**](guide/glossary#workspace). A workspace contains the files for one or more [**projects**](guide/glossary/#project). A project is the set of files that comprise an app, a library, or end-to-end (e2e) tests. 

To create a new workspace and initial app project: 

1. Run the CLI command `ng new` and provide the name `my-app`, as shown here: 

    <code-example language="sh" class="code-shell">
      ng new my-app

    </code-example>

2. The `ng new` command prompts you for information about features to include in the initial app project. Accept the defaults by pressing the Enter or Return key. 

The Angular CLI installs the necessary Angular npm packages and other dependencies. This can take a few minutes. 

It also creates the following workspace and starter project files: 

* A new workspace, with a root folder named `my-app`
* An initial skeleton app project, also called `my-app` (in the `src` subfolder)
* An end-to-end test project (in the `e2e` subfolder)
* Related configuration files

The initial app project contains a simple Welcome app, ready to run. 

{@a serve}

## Step 3: Serve the application

Angular includes a server, so that you can easily build and serve your app locally.

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

Your app greets you with a message:


<figure>
  <img src='generated/images/guide/cli-quickstart/app-works.png' alt="Welcome to my-app!">
</figure>




## Additional resources

If you're new to Angular: 

* The [Getting Started](tutorial/) provides hands-on learning. It walks you through the steps to build your first app in an online environment and then deploy that app to your local system. While building a basic catalog and shopping cart app, you'll be introduced to components (the building blocks of Angular), Angular's HTML template syntax, basic display and navigation between views, using services and external data, and scaling and tuning your app. 

* The [Tour of Heroes tutorial](tutorial "Tour of Heroes tutorial") provides additional hands-on learning. It walks you through the steps to build an app that helps a staffing agency manage a group of superhero employees. All of the steps are done locally. 
 

* The [Architecture guide](guide/architecture "Architecture guide") describes key concepts such as modules, components, services, and dependency injection (DI). It provides a foundation for more in-depth guides about specific Angular concepts and features.  

After the Tutorial and Architecture guide, you'll be ready to continue exploring Angular on your own through the other guides and references in this documentation set, focusing on the features most important for your apps. 




## Related technologies and tools

Angular assumes specific versions of many related technologies and tools, such as TypeScript, Karma, Protractor, tsickle, zone.js.

The `package.json` is organized into two groups of packages:

* [Dependencies](guide/npm-packages#dependencies) are essential to *running* applications.
* [DevDependencies](guide/npm-packages#dev-dependencies) are only necessary to *develop* applications.

These packages are described in more detail in [Workspace dependencies](guide/npm-packages).



{@a others}
## Managing different development environments

If you already have projects running on your machine that use other versions of Node.js and npm, consider using [nvm](https://github.com/creationix/nvm) on Mac or Linux, or [nvm-windows](https://github.com/coreybutler/nvm-windows) on Windows, to manage the multiple versions of Node.js and npm. 

