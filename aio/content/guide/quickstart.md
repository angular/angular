# Getting started 

Welcome to Angular! Angular helps you build modern applications for the web, mobile, or desktop.  

This guide shows you how to build and run a simple Angular
app, using the Angular CLI to accelerate development, 
while adhering to the [Style Guide](guide/styleguide) recommendations that
benefit _every_ Angular project.

The end of this guide includes a link to download an example of the final code. It also recommends next steps for learning and using Angular. 


{@a devenv}

## Prerequisites 

Before you begin, make sure your development environment includes `Node.js®` and an npm package manager. 

### Node.js

Angular requires `Node.js` version 8.x or 10.x.

* To get `Node.js`, go to [nodejs.org](https://nodejs.org) and download the installer.

* To check your version, run `node -v` in a terminal/console window.


### npm package manager

Angular, the Angular CLI, and Angular apps depend upon features and functionality provided by libraries that are available as [npm packages](https://docs.npmjs.com/getting-started/what-is-npm). To download and install npm packages, you must have an npm package manager. 

This Quick Start uses the [npm client](https://docs.npmjs.com/cli/install) command line interface, which is installed with Node.js by default. 

To check that you have `npm` installed, run `npm -v` in a terminal/console window.

For more information about Angular and npm packages&mdash;including how to configure the CLI to use a different package manager, such as `yarn`&mdash;see [npm Packages](guide/npm-packages). 


{@a install-cli}

## Step 1: Install the Angular CLI

The [**Angular CLI**](guide/glossary#command-line-interface-cli) is a **_command line interface_** tool
that makes it easy to create a project, add files, and perform a variety of ongoing development tasks such as testing, bundling, and deployment.

Install the Angular CLI globally. 

Open a terminal window, and enter the following command to install the CLI using the `npm` package manager.


<code-example language="sh" class="code-shell">
  npm install -g @angular/cli

</code-example>



{@a create-proj}

## Step 2: Create a new project


Generate a new project and default app by running the Angular CLI command `ng new` and specifying the name of your project. 

The following command creates a new project called `my-app`:


<code-example language="sh" class="code-shell">
  ng new my-app

</code-example>

The Angular CLI installs the necessary `npm` packages, creates the project files, and populates the project with a simple default app. This can take a few minutes.


{@a serve}

## Step 3: Serve the application

Angular includes a server, so that you can easily build and serve your app locally.

1. Go to the project directory (`my-app`).

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
  <img src='generated/images/guide/cli-quickstart/app-works.png' alt="The app works!">
</figure>



{@a first-component}

## Step 4: Edit your first Angular component

[**_Components_**](guide/glossary#component) are the fundamental building blocks of Angular applications. 
They display data on the screen, listen for user input, and take action based on that input. 

The CLI created the first component for you. 


Your app resides in the `src` folder.
All Angular components, templates, styles, images, and anything else your app needs go here.

1. Open `./src/app/app.component.ts`. 

Every app has a _root component_, named `app-root`.
The root component connects a component hierarchy with the page document object model (DOM). 

<code-example path="cli-quickstart/src/app/app.component.ts" region="metadata" title="src/app/app.component.ts" linenums="false"></code-example>

2. The `@Component()` decorator identifies the class immediately below it (`AppComponent`) as a component. Change the `title` property from `'my-app'` to `'My First Angular App'`.

<code-example path="cli-quickstart/src/app/app.component.ts" region="component" title="src/app/app.component.ts" linenums="false"></code-example>

    The browser reloads automatically with the revised title. That's nice, but it could look better.

3. Open `src/app/app.component.css` and give the component some style.


<code-example path="cli-quickstart/src/app/app.component.css" title="src/app/app.component.css" linenums="false"></code-example>



<figure>
  <img src='generated/images/guide/cli-quickstart/my-first-app.png' alt="Output of Getting Started app">
</figure>

That's all you need to do. You've created your first Angular app!



{@a project-file-review}

## Final code review

You can <a href="generated/zips/cli-quickstart/cli-quickstart.zip" target="_blank">download an example</a> of the final app that was created in this Quick Start. 
Many Angular guides include links to download or run live examples of an app, so that you can see Angular concepts and code in action. 

Here are the code files discussed on this page:

<code-tabs>
  <code-pane title="src/app/app.component.ts" path="cli-quickstart/src/app/app.component.ts">
  </code-pane>

  <code-pane title="src/app/app.component.css" path="cli-quickstart/src/app/app.component.css">
  </code-pane>

</code-tabs>


For more details about Angular project files and the file structure, see [Anatomy of the setup](guide/setup-systemjs-anatomy).


## Next steps

Now that you've seen the essentials of an Angular app and the Angular CLI, continue with these introductory materials: 

* The [Tour of Heroes tutorial](tutorial "Tour of Heroes tutorial") provides additional hands-on learning. It walks you through the steps to build an app that helps a staffing agency manage a group of superhero employees. 
It has many of the features you'd expect to find in a data-driven application: 

        - Acquiring and displaying a list of items

        - Editing a selected item's detail

        - Navigating among different views of the data


* The [Architecture guide](guide/architecture "Architecture guide")  describes key concepts such as modules, components, services, and dependency injection (DI). It provides a foundation for more in-depth guides about specific Angular concepts and features.  

Both the Tutorial and Architecture guide are intended to give you the foundation to continue exploring Angular on your own, focusing on the features most important for your apps. 


