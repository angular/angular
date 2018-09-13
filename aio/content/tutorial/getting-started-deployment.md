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
