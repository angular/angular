# Getting Started - Deployment

To deploy our application, we have to build it, and then host the JavaScript, CSS, and HTML on a web server. Built Angular applications are very portable and can live in any environment or served by any technology such as Node, Java, .NET, PHP, etc.

## Build
Before we can deploy our application we have to build it. StackBlitz does not yet have build capabilities, so we will need to download our source code. using the Export button at the top.

Once we have the source code downloaded and unzipped, we can use the Angular Console to serve the application, or we can make sure we have Node and the Angular CLI installed.

From the terminal we can install the CLI globally with:

`npm install -g @angular/cli`

This will install the command `ng` into our system, which is the command we can use to create new projects, serve our application during development, or produce builds that can be shared or distributed.

We'll want to create a new CLI project using 

`ng new my-project-name`

From there we can replace the /src/app folder with the one from our StackBlitz Download, and then perform a build.

`ng build --prod`

This will produce the files that we need to deploy.

## Hosting our Files
The files in the `dist/my-project-name` folder are static and can be hosted on any web server capable of serving files (node, Java, .NET) or any backend (Firebase, Google Cloud, App Engine, others).

### Hosting an Angular app on Firebase
One of the easiest ways to get your site live is to host it using firebase.

1. Sign up for a firebase account on [Firebase](https://firebase.google.com/).
1. Create a new project, giving it any name you like
1. Install the `firebase-tools` CLI that will handle our deployment using `npm install -g firebase-tools`
1. Connect our CLI to our Firebase account and initialize the connection to our project `firebase login` and `firebase init`
1. Deploy our application. We can do this with `firebase deploy` because StackBlitz has created a firebase.json that tells Firebase how to serve our app.

### Hosting an Angular app anywhere else
To host an Angular app on another web host, you'll need to upload or send the files to the host, and because we are building a Single Page Application, you'll need to make sure you redirect any invalid URLs to your index.html file.

## Tutorial Finish
There are lots more advanced capabilities that Angular offers, but you now have the foundation that will allow you to build an application and to explore the other capabilities the Angular platform has to offer.

You finished the tutorial and are now an Angular developer! Feel free to [share this moment](#) or [tell us what you thought of our tutorial](#).


