# Deploying an application

Deploying your application is the process of compiling, or building, your code and hosting the JavaScript, CSS, and HTML on a web server.

This section builds on the previous steps in the [Getting Started](start "Try it: A basic application") tutorial and shows you how to deploy your application.

## Prerequisites

A best practice is to run your project locally before you deploy it. To run your project locally, you need the following installed on your computer:

* [Node.js](https://nodejs.org/en/).
* The [Angular CLI](https://cli.angular.io/).
    From the terminal, install the Angular CLI globally with:

    ```sh
    npm install -g @angular/cli
    ```

    With the Angular CLI, you can use the command `ng` to create new workspaces, new projects, serve your application during development, or produce builds to share or distribute.

## Running your application locally

1. Download the source code from your StackBlitz project by clicking the `Download Project` icon in the left menu, across from `Project`, to download your files.

1. Create a new Angular CLI workspace using the [`ng new`](cli/new "CLI ng new command reference") command, where `my-project-name` is what you would like to call your project:

    ```sh
    ng new my-project-name
    ```
    
    This command displays a series of configuration prompts. For this tutorial, accept the default settings for each prompt.

1. In your newly CLI-generated application, replace the `/src` folder with the `/src` folder from your `StackBlitz` download.

1. Use the following CLI command to run your application locally:

    ```sh
    ng serve
    ```

1. To see your application in the  browser, go to http://localhost:4200/.
    If the default port 4200 is not available, you can specify another port with the port flag as in the following example:

     ```sh
    ng serve --port 4201
    ```

    While serving your application, you can edit your code and see the changes update automatically in the browser.
    To stop the `ng serve` command, press `Ctrl`+`c`.

{@a building}
## Building and hosting your application

 1. To build your application for production, use the `build` command. By default, this command uses the `production` build configuration.

    ```sh
    ng build
    ```

    This command creates a `dist` folder in the application root directory with all the files that a hosting service needs for serving your application.

    <div class="alert is-helpful">

    If the above `ng build` command throws an error about missing packages, append the missing dependencies in your local project's `package.json` file to match the one in the downloaded StackBlitz project.

    </div>

1. Copy the contents of the `dist/my-project-name` folder to your web server.
    Because these files are static, you can host them on any web server capable of serving files; such as `Node.js`, Java, .NET, or any backend such as [Firebase](https://firebase.google.com/docs/hosting), [Google Cloud](https://cloud.google.com/solutions/web-hosting), or [App Engine](https://cloud.google.com/appengine/docs/standard/python/getting-started/hosting-a-static-website).
    For more information, see [Building & Serving](guide/build "Building and Serving Angular Apps") and [Deployment](guide/deployment "Deployment guide").

## What's next

In this tutorial, you've laid the foundation to explore the Angular world in areas such as mobile development, UX/UI development, and server-side rendering.
You can go deeper by studying more of Angular's features, engaging with the vibrant community, and exploring the robust ecosystem.

### Learning more Angular

For a more in-depth tutorial that leads you through building an application locally and exploring many of Angular's most popular features, see [Tour of Heroes](tutorial).

To explore Angular's foundational concepts, see the guides in the Understanding Angular section such as [Angular Components Overview](guide/component-overview) or [Template syntax](guide/template-syntax).

### Joining the community


[Tweet that you've completed this tutorial](https://twitter.com/intent/tweet?url=https://angular.io/start&text=I%20just%20finished%20the%20Angular%20Getting%20Started%20Tutorial "Angular on Twitter"), tell us what you think, or submit [suggestions for future editions](https://github.com/angular/angular/issues/new/choose "Angular GitHub repository new issue form").

Keep current by following the [Angular blog](https://blog.angular.io/ "Angular blog").

### Exploring the Angular ecosystem

To support your UX/UI development, see [Angular Material](https://material.angular.io/ "Angular Material web site").

To test your Angular applications, see [Angular Protractor](https://protractor.angular.io/ "Angular Protractor web site").

The Angular community also has an extensive [network of third-party tools and libraries](resources "Angular resources list").
