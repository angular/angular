# Deployment

To deploy your application, you have to compile it, and then host the JavaScript, CSS, and HTML on a web server. Built Angular applications are very portable and can live in any environment or served by any technology such as Node, Java, .NET, PHP, and many others.


<div class="alert is-helpful">

[Return to the previous Getting Started lesson: Forms.](getting-started/getting-started-forms)

</div>


## Deploying from StackBlitz

StackBlitz allows you to publish your Angular app directly to Firebase from your project. The steps below outline how to deploy it quickly without setting up your own hosting environment.

1. In your StackBlitz project, in the left menu bar, click the `Firebase` icon.
1. If you don’t have a `Firebase` account, visit the [Firebase](https://firebase.google.com/) to sign up for a free hosting account.
1. Click the `Sign into Google` button and follow the prompts to give `StackBlitz` access your `Firebase` projects
1. Select the `project` where you wish to deploy your application.
1. Click the `Deploy` button to deploy your application.
1. After the deployment completes, click the `Open live site` link to view your app live.

## Building locally

To build your application locally, you will need to download the source code from your StackBlitz project. Click the `Download Project` icon in the left menu across from `Project` to download your files.

Once you have the source code downloaded and unzipped, use the [Angular Console](https://angularconsole.com) to serve the application, or you install Node and have the Angular CLI installed.

From the terminal, install the Angular CLI globally with:

```sh
npm install -g @angular/cli
```

This will install the command `ng` into your system, which is the command you use to create new workspaces, new projects, serve your application during development, or produce builds that can be shared or distributed.

Create a new Angular CLI workspace using the [`ng new`](cli/new) command:

```sh
ng new my-project-name
```

From there you replace the `/src` folder with the one from your `StackBlitz` download, and then perform a build.

```sh
ng build --prod
```

This will produce the files that you need to deploy.

#### Hosting the built project

The files in the `dist/my-project-name` folder are static and can be hosted on any web server capable of serving files (node, Java, .NET) or any backend (Firebase, Google Cloud, App Engine, others).

### Hosting an Angular app on Firebase

One of the easiest ways to get your site live is to host it using Firebase.

1. Sign up for a firebase account on [Firebase](https://firebase.google.com/).
1. Create a new project, giving it any name you like.
1. Install the `firebase-tools` CLI that will handle your deployment using `npm install -g firebase-tools`.
1. Connect your CLI to your Firebase account and initialize the connection to your project using `firebase login` and `firebase init`.
1. Follow the prompts to select the `Firebase` project you creating for hosting.
1. Deploy your application with `firebase deploy` because StackBlitz has created a firebase.json that tells Firebase how to serve your app.
1. Once deployed, visit https://your-firebase-project-name.firebaseapp.com to see it live!

### Hosting an Angular app anywhere else

To host an Angular app on another web host, you'll need to upload or send the files to the host, and because you are building a Single Page Application, you'll need to make sure you redirect any invalid URLs to your `index.html` file. Learn more about development and distribution of your application in the [Building & Serving](guide/build) and [Deployment](guide/deployment) guides.

## Tutorial Finish

There are lots more advanced capabilities that Angular offers, but you now have the foundation that will allow you to build an application and to explore the other capabilities the Angular platform has to offer.

You finished the tutorial and are now an Angular developer! Feel free to [share this moment](#) or [tell us what you thought of the tutorial](#).
