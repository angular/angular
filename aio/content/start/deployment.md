# Deployment


To deploy your application, you have to compile it, and then host the JavaScript, CSS, and HTML on a web server. Built Angular applications are very portable and can live in any environment or served by any technology, such as Node, Java, .NET, PHP, and many others.

<div class="alert is-helpful">


Whether you came here directly from [Your First App](start "Getting Started: Your First App"), or completed the entire online store application through the [Routing](start/routing "Getting Started: Routing"), [Managing Data](start/data "Getting Started: Managing Data"), and [Forms](start/forms "Getting Started: Forms") sections, you have an application that you can deploy by following the instructions in this section.


</div>

## Share your application

StackBlitz projects are public by default, allowing you to share your Angular app via the project URL. Keep in mind that this is a great way to share ideas and prototypes, but it is not intended for production hosting.

1. In your StackBlitz project, make sure you have forked or saved your project.
1. In the preview page, you should see a URL that looks like `https://<Project ID>.stackblitz.io`.
1. Share this URL with a friend or colleague.
1. Users that visit your URL will see a development server start up, and then your application will load.

## Building locally

To build your application locally or for production, download the source code from your StackBlitz project by clicking the `Download Project` icon in the left menu across from `Project` to download your files.

Once you have the source code downloaded and unzipped, use the [Angular Console](https://angularconsole.com "Angular Console web site") to serve the application, or install `Node.js` and serve your app with the Angular CLI.

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
<!-- 1. Install the `firebase-tools` CLI that will handle your deployment using `npm install -g firebase-tools`.
1. From within your project folder, connect your CLI to your Firebase account and initialize the connection to your project using `firebase login` and `firebase init`.
1. Choose `Hosting: Configure and deploy Firebase Hosting sites`. -->
1. Add `@angular/fire` to your project by running `ng add @angular/fire`. This command will introduce Firebase deployment capabilities to your project.
1. Run `ng deploy` to build & deploy your app to Firebase. By default, the deploy command produces an optimized production build of your app and uploads the assets to Firebase hosting. Once the deployment process completes, you will receive a URL that you can use to preview your app.
1. Choose `Use existing project`. This assumes that you created a project on [Firebase](https://firebase.google.com/ "Firebase web site").
1. Choose the firebase project you created in step two.
1. For the public directory, enter `dist`.
1. Enter `y` for configuring as a single-page app.
1. After the Firebase initialization is complete, run `ng build --prod`.
1. Deploy your application with `firebase deploy`. The following is an example of the output of a successful deployment.

    ```sh

    ~/your-project-name» firebase deploy

    === Deploying to 'your-firebase-project-name'...

    i  deploying hosting
    i  hosting[your-project-name]: beginning deploy...
    i  hosting[your-project-name]: found 10 files in dist/your-project-name
    ✔  hosting[your-project-name]: file upload complete
    i  hosting[your-project-name]: finalizing version...
    ✔  hosting[your-project-name]: version finalized
    i  hosting[your-project-name]: releasing new version...
    ✔  hosting[your-project-name]: release complete

    ✔  Deploy complete!

    Project Console: https://console.firebase.google.com/project/your-project-name/overview
    Hosting URL: https://your-firebase-project-name.firebaseapp.com

    ```

1. Once deploy is complete, visit https://your-firebase-project-name.firebaseapp.com to see it live.

### Hosting an Angular app anywhere else

To host an Angular app on another web host, upload or send the files to the host.
Because you are building a single page application, you'll also need to make sure you redirect any invalid URLs to your `index.html` file.
Read more about development and distribution of your application in the [Building & Serving](guide/build "Building and Serving Angular Apps") and [Deployment](guide/deployment "Deployment guide") guides.

## Join the Angular community

You are now an Angular developer! [Share this moment](https://twitter.com/intent/tweet?url=https://angular.io/start&text=I%20just%20finished%20the%20Angular%20Getting%20Started%20Tutorial "Angular on Twitter"), tell us what you thought of this Getting Started, or submit [suggestions for future editions](https://github.com/angular/angular/issues/new/choose "Angular GitHub repository new issue form").

Angular offers many more capabilities, and you now have a foundation that empowers you to build an application and explore those other capabilities:

* Angular provides advanced capabilities for mobile apps, animation, internationalization, server-side rendering, and more.
* [Angular Material](https://material.angular.io/ "Angular Material web site") offers an extensive library of Material Design components.
* [Angular Protractor](https://protractor.angular.io/ "Angular Protractor web site") offers an end-to-end testing framework for Angular apps.
* Angular also has an extensive [network of 3rd-party tools and libraries](https://angular.io/resources "Angular resources list").

Keep current by following the [Angular blog](https://blog.angular.io/ "Angular blog").




