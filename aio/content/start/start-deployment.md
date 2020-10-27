# Deploying an application


To deploy your application, you have to compile it, and then host the JavaScript, CSS, and HTML on a web server. Built Angular applications are very portable and can live in any environment or served by any technology, such as Node, Java, .NET, PHP, and many others.

<div class="alert is-helpful">

Whether you came here directly from [Part 1](start "Try it: A basic app"), or completed the entire online store application through the [In-app navigation](start/start-routing "Try it: In-app navigation"), [Manage data](start/start-data "Try it: Manage data"), and [Forms for user input](start/start-forms "Try it: Forms for user input") sections, you have an application that you can deploy by following the instructions in this section.

</div>

## Share your application

StackBlitz projects are public by default, allowing you to share your Angular app via the project URL. Keep in mind that this is a great way to share ideas and prototypes, but it is not intended for production hosting.

1. In your StackBlitz project, make sure you have forked or saved your project.
1. In the preview page, you should see a URL that looks like `https://<Project ID>.stackblitz.io`.
1. Share this URL with a friend or colleague.
1. Users that visit your URL will see a development server start up, and then your application will load.

## Building locally

To build your application locally or for production, download the source code from your StackBlitz project by clicking the `Download Project` icon in the left menu across from `Project` to download your files.

Once you have the source code downloaded and unzipped, install `Node.js` and serve your app with the Angular CLI.

From the terminal, install the Angular CLI globally with:

```sh
npm install -g @angular/cli
```

This installs the command `ng` on your system, which is the command you use to create new workspaces, new projects, serve your application during development, or produce builds to share or distribute.

Create a new Angular CLI workspace using the [`ng new`](cli/new "CLI ng new command reference") command:

```sh
ng new my-project-name
```

In your new CLI generated app, replace the `/src` folder with the one from your `StackBlitz` download, and then perform a build.

```sh
ng build --prod
```

This will produce the files that you need to deploy.

<div class="alert is-helpful">

If the above `ng build` command throws an error about missing packages, append the missing dependencies in your local project's `package.json` file to match the one in the downloaded StackBlitz project.

</div>

#### Hosting the built project

The files in the `dist/my-project-name` folder are static. This means you can host them on any web server capable of serving files (such as `Node.js`, Java, .NET), or any backend (such as Firebase, Google Cloud, or App Engine).

### Hosting an Angular app on Firebase

One of the easiest ways to get your site live is to host it using Firebase.

1. Sign up for a firebase account on [Firebase](https://firebase.google.com/ "Firebase web site").
1. Create a new project, giving it any name you like.
1. Add the `@angular/fire` schematics that will handle your deployment using `ng add @angular/fire`.
1. Install [Firebase CLI](https://firebase.google.com/docs/cli) globally using `npm install -g firebase-tools`.
1. Connect your CLI to your Firebase account and initialize the connection to your project using `firebase login` and `firebase init`.
1. Follow the prompts to select the `Firebase` project you are creating for hosting.
    - Select the `Hosting` option on the first prompt.
    - Select the project you previously created on Firebase.
    - Select `dist/my-project-name` as the public directory.
1. Deploy your application with `ng deploy`.
1. Once deployed, visit https://your-firebase-project-name.firebaseapp.com to see it live!

### Hosting an Angular app anywhere else

To host an Angular app on another web host, upload or send the files to the host.
Because you are building a single page application, you'll also need to make sure you redirect any invalid URLs to your `index.html` file.
Read more about development and distribution of your application in the [Building & Serving](guide/build "Building and Serving Angular Apps") and [Deployment](guide/deployment "Deployment guide") guides.

## Join the Angular community

You are now an Angular developer! [Share this moment](https://twitter.com/intent/tweet?url=https://angular.io/start&text=I%20just%20finished%20the%20Angular%20Getting%20Started%20Tutorial "Angular on Twitter"), tell us what you thought of this get-started exercise, or submit [suggestions for future editions](https://github.com/angular/angular/issues/new/choose "Angular GitHub repository new issue form").

Angular offers many more capabilities, and you now have a foundation that empowers you to build an application and explore those other capabilities:

* Angular provides advanced capabilities for mobile apps, animation, internationalization, server-side rendering, and more.
* [Angular Material](https://material.angular.io/ "Angular Material web site") offers an extensive library of Material Design components.
* [Angular Protractor](https://protractor.angular.io/ "Angular Protractor web site") offers an end-to-end testing framework for Angular apps.
* Angular also has an extensive [network of 3rd-party tools and libraries](resources "Angular resources list").

Keep current by following the [Angular blog](https://blog.angular.io/ "Angular blog").
