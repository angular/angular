# Getting started 

Welcome to Angular! Angular helps you build modern applications for the web, mobile, or desktop.  

This guide shows you how to build and run a simple Angular
app, using the [Angular CLI](cli "CLI command reference") command line interface tool to accelerate development, 
while adhering to the [Style Guide](guide/styleguide "Angular style guide") recommendations that
benefit _every_ Angular project.

The end of this guide includes a link to download a copy of the app that you create in this Getting Started. It also recommends next steps for learning and using Angular. 


{@a devenv}

## Prerequisites 

Before you begin, make sure your development environment includes `Node.js®` and an npm package manager. 

### Node.js

Angular requires `Node.js` version 8.x or 10.x.

* To check your version, run `node -v` in a terminal/console window.

* To get `Node.js`, go to [nodejs.org](https://nodejs.org "Nodejs.org"), download the installer, and follow the instructions on that site.




### npm package manager

Angular, the Angular CLI, and Angular apps depend upon features and functionality provided by libraries that are available as [npm packages](https://docs.npmjs.com/getting-started/what-is-npm "What is npm?"). To download and install npm packages, you must have an npm package manager. 

This Quick Start uses the [npm client](https://docs.npmjs.com/cli/install) command line interface, which is installed with `Node.js` by default. 

To check that you have `npm` installed, run `npm -v` in a terminal/console window.

For more information about Angular and npm packages&mdash;including how to configure the CLI to use a different package manager, such as `yarn`&mdash;see [npm Packages](guide/npm-packages). 


{@a install-cli}

## Step 1: Install the Angular CLI

The [**Angular CLI**](guide/glossary#command-line-interface-cli) is a **_command line interface_** tool
that makes it easy to create a project, add files, and perform a variety of ongoing development tasks such as testing, bundling, and deployment.

Install the Angular CLI globally. 

To install the CLI using the `npm` package manager, open a terminal window and enter the following command:


<code-example language="sh" class="code-shell">
  npm install -g @angular/cli

</code-example>



{@a create-proj}

## Step 2: Create a workspace and initial application

Your develop your apps in the context of an Angular [**workspace**](guide/glossary#workspace). A workspace contains the files for one or more [**projects**](guide/glossary/#project). A project is the set of files that comprise an app, a library, or end-to-end (e2e) test. 

To create a new workspace and initial app project: 

1. Run the CLI command `ng new` as shown here: 

<code-example language="sh" class="code-shell">
  ng new my-app

</code-example>

2. The `ng new` command prompts you for information about features to include in the initial app project. Accept the defaults by typing `Enter` or `Return`. 

The Angular CLI installs the necessary Angular `npm` packages and other dependencies. This can take a few minutes. 

It also creates the following workspace and starter project files: 

* A new workspace, with a root folder named `my-app`
* An initial skeleton app project, also called `my-app` (in the `src` subfolder)
* An end-to-end test project (in the `e2e` subfolder)
* Related configuration files

The initial app project is already a complete app, ready to run. 

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



{@a first-component}

## Step 4: Edit your first Angular component

[**_Components_**](guide/glossary#component) are the fundamental building blocks of Angular applications. 
They display data on the screen, listen for user input, and take action based on that input. 

In the initial app, the CLI created the first Angular component for you. It is the _root component_, and it is named `app-root`. 

1. Open `./src/app/app.component.ts`. 

2. Find the `app-root` component. 

<code-example path="cli-quickstart/src/app/app.component.ts" region="metadata" title="src/app/app.component.ts" linenums="false"></code-example>


3. Change the `title` property from `'my-app'` to `'My First Angular App'`.

<code-example path="cli-quickstart/src/app/app.component.ts" region="component" title="src/app/app.component.ts" linenums="false"></code-example>

The browser reloads automatically with the revised title. That's nice, but it could look better.

4. Open `src/app/app.component.css` and give the component some style.


<code-example path="cli-quickstart/src/app/app.component.css" title="src/app/app.component.css" linenums="false"></code-example>


<figure>
  <img src='generated/images/guide/cli-quickstart/my-first-app.png' alt="Output of Getting Started app">
</figure>

Looking good! 



{@a project-file-review}

## Final code review

You can <a href="generated/zips/cli-quickstart/cli-quickstart.zip" target="_blank">download an example</a> of the final app that was created in this Quick Start. 
Most Angular guides include links to download example files or run live examples in Stackblitz, so that you can see Angular concepts and code in action. 

Here are the code files discussed on this page:

<code-tabs>
  <code-pane title="src/app/app.component.ts" path="cli-quickstart/src/app/app.component.ts">
  </code-pane>

  <code-pane title="src/app/app.component.css" path="cli-quickstart/src/app/app.component.css">
  </code-pane>

</code-tabs>

For details about Angular project files and the file structure, see [Workspace and project file struture](guide/file-structure).

## Next steps

Now that you've seen the essentials of an Angular app and the Angular CLI, continue with these introductory materials: 

* The [Tour of Heroes tutorial](tutorial "Tour of Heroes tutorial") provides additional hands-on learning. It walks you through the steps to build an app that helps a staffing agency manage a group of superhero employees. 
It has many of the features you'd expect to find in a data-driven application: 

        - Acquiring and displaying a list of items

        - Editing a selected item's detail

        - Navigating among different views of the data


* The [Architecture guide](guide/architecture "Architecture guide")  describes key concepts such as modules, components, services, and dependency injection (DI). It provides a foundation for more in-depth guides about specific Angular concepts and features.  

After you read the Tutorial and Architecture guide, you're ready to continue exploring Angular on your own, focusing on the features most important for your apps. 


