# Getting started 

Welcome to Angular! Angular helps you build modern applications for the web, mobile, or desktop.  

This guide shows you how to build and run a simple Angular
app. You'll use the [Angular CLI tool](cli "CLI command reference") to accelerate development, 
while adhering to the [Style Guide](guide/styleguide "Angular style guide") recommendations that
benefit _every_ Angular project.

This guide takes less than 30 minutes to complete. 
At the end of this guide&mdash;as part of final code review&mdash;there is a link to download a copy of the final application code. (If you don't execute the commands in this guide, you can still download the final application code.)


{@a devenv}
{@a prerequisites}
## Prerequisites 

Before you begin, make sure your development environment includes `Node.js®` and an npm package manager. 

{@a nodejs}
### Node.js

Angular requires `Node.js` version 8.x or 10.x.

* To check your version, run `node -v` in a terminal/console window.

* To get `Node.js`, go to [nodejs.org](https://nodejs.org "Nodejs.org").

{@a npm}
### npm package manager

Angular, the Angular CLI, and Angular apps depend on features and functionality provided by libraries that are available as [npm packages](https://docs.npmjs.com/getting-started/what-is-npm). To download and install npm packages, you must have an npm package manager. 

This Quick Start uses the [npm client](https://docs.npmjs.com/cli/install) command line interface, which is installed with `Node.js` by default. 

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



{@a first-component}

## Step 4: Edit your first Angular component

[**_Components_**](guide/glossary#component) are the fundamental building blocks of Angular applications. 
They display data on the screen, listen for user input, and take action based on that input. 

As part of the initial app, the CLI created the first Angular component for you. It is the _root component_, and it is named `app-root`. 

1. Open `./src/app/app.component.ts`. 

2. Change the `title` property from `'my-app'` to `'My First Angular App'`.

    <code-example path="cli-quickstart/src/app/app.component.ts" region="component" header="src/app/app.component.ts" linenums="false"></code-example>

    The browser reloads automatically with the revised title. That's nice, but it could look better.

3. Open `./src/app/app.component.css` and give the component some style.

    <code-example path="cli-quickstart/src/app/app.component.css" header="src/app/app.component.css" linenums="false"></code-example>

Looking good! 

<figure>
  <img src='generated/images/guide/cli-quickstart/my-first-app.png' alt="Output of Getting Started app">
</figure>




{@a project-file-review}

## Final code review

You can <a href="generated/zips/cli-quickstart/cli-quickstart.zip" target="_blank">download an example</a> of the app that you created in this Getting Started guide. 


<div class="alert is-helpful">

**Tip:** Most Angular guides include links to download example files and run live examples in [Stackblitz](http://www.stackblitz.com), so that you can see Angular concepts and code in action. 


</div>


For more information about Angular project files and the file structure, see [Workspace and project file struture](guide/file-structure).




## Next steps

Now that you've seen the essentials of an Angular app and the Angular CLI, continue with these other introductory materials: 

* The [Tour of Heroes tutorial](tutorial "Tour of Heroes tutorial") provides additional hands-on learning. It walks you through the steps to build an app that helps a staffing agency manage a group of superhero employees. 
It has many of the features you'd expect to find in a data-driven application: 

        - Acquiring and displaying a list of items

        - Editing a selected item's detail

        - Navigating among different views of the data


* The [Architecture guide](guide/architecture "Architecture guide") describes key concepts such as modules, components, services, and dependency injection (DI). It provides a foundation for more in-depth guides about specific Angular concepts and features.  

After the Tutorial and Architecture guide, you'll be ready to continue exploring Angular on your own through the other guides and references in this documentation set, focusing on the features most important for your apps. 


