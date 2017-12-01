# Getting started

Beginning in Angular 5.0.0, you can easily enable Angular service worker support in any CLI project. This document explains how to enable Angular service worker support in new and existing projects. It then uses a simple example to show you a service worker in action, demonstrating loading and basic caching.  

You can run the example <live-example>live in the browser </live-example>.


## Adding a service worker to a new application

If you're generating a new CLI project, you can instruct the CLI to set up the Angular service worker as part of creating the project. To do so, add the `--service-worker` flag to the `ng new`  command:

```sh
$ ng new --service-worker 
```

To learn about what the `--service-worker` flag does to enable Angular service workers, see the following section about adding a service worker to an existing application. The `--service-worker` flag performs those steps for you as part of setting up the new CLI project. 

## Adding a service worker to an existing application

To add a service worker to an existing application:

1. Add the service worker package.
2. Enable service worker build support in the CLI.
3. Import and register the service worker.
4. Create the service worker configuration file, which specifies the caching behaviors and other settings. 
5. Build the project.

These steps are explained in more detail below.


#### Step 1: Add the service worker package

Add the package `@angular/service-worker`, using the yarn utility as shown here:

```sh
$ yarn add @angular/service-worker
```

#### Step 2: Enable service worker build support in the CLI

To enable the Angular service worker, the CLI must generate an Angular service worker manifest at build time. To cause the CLI to generate the manifest for an existing project, set the `serviceWorker` flag to `true` in the project's `.angular-cli.json` file as shown here:

```sh
$ ng set apps.0.serviceWorker=true
```

#### Step 3: Import and register the service worker

To import and register the Angular service worker:

1. Open `src/app/app.module.ts` in an editor. This is the application's root module. 

2. At the top of the file, add an instruction to import `ServiceWorkerModule`.

<code-example path="service-worker-getstart/src/app/app.module.ts" linenums="false" title="src/app/app.module.ts" region="sw-import"> </code-example>


3. Add `ServiceWorkerModule` to the `@NgModule` imports section. 

It's better to do this with a conditional so that the service worker is only registered for a production application.

Use the `register()` helper to take care of registering the service worker for you.

<code-example path="service-worker-getstart/src/app/app.module.ts" linenums="false" title="src/app/app.module.ts" region="sw-module"> </code-example>


The file `ngsw-worker.js` is the name of the prebuilt service worker script, which the CLI copies into `dist/` to deploy along with your server.

#### Step 4: Create the configuration file, ngsw-config.json

The Angular CLI needs a service worker configuration file, called `ngsw-config.json`. The configuration file controls how the service worker caches files and data 
resources.

You can begin with the boilerplate version from the CLI, which configures sensible defaults for most applications.

Alternately, save the following as `src/ngsw-config.json`:

<code-example path="service-worker-getstart/src/ngsw-config.json" linenums="false" title="src/ngsw-config.json"> </code-example>

#### Step 5: Build the project

Finally, build the project: 

```sh
$ ng build --prod
```

The CLI project is now set up to use the Angular service worker.


## Service worker in action: a tour

This section demonstrates a service worker in action, 
using an example application. 

### Serving with http-server

After building the project, it's time to serve it.

`ng serve` does not work with service workers, you must use a real HTTP server to test your project locally. It's a good idea to test on a dedicated port.

```sh
$ cd dist
$ http-server -p 8080
```

### Initial load

With the server running, you can point your browser at http://localhost:8080/. Your application should load normally.

Tip: When testing Angular service workers, it's a good idea to use an incognito or private window in your browser, to ensure the service worker doesn't end up reading from a previous leftover state, which can cause unexpected behavior.

### Simulating a network issue

To simulate a network issue, disable network interaction for your application. In Chrome: 

1. Select **Tools** > **Developer Tools** (from the Chrome menu located at thte top-right corner).
2. Go to the **Network tab**.
3. Check the **Offline box**.

!["The offline checkbox in the Network tab is checked"](generated/images/guide/service-worker/offline-checkbox.png)


Now the app has no access to network interaction.

For applications that do not use the Angular service worker, refreshing now would display Chrome's Internet disconnected page that says "There is no Internet connection.". 

With the addition of an Angular service worker, the application behavior changes. On a refresh, the page loads normally. 

If you look at the Network tab, you can verify that the service worker is active.
![Requests are marked as "from Service Worker"](generated/images/guide/service-worker/sw-active.png)

Notice that under the "Size" column, the requests state is `(from ServiceWorker)`. This means that the resources are not being loaded from the network. Instead, they are being loaded from the service worker's cache.


### What's being cached?

Notice that all of the files the browser needs to render this application are cached. The `ngsw-config.json` boilerplate configuration is set up to cache the specific resources used by the CLI:

* index.html.
* favicon.ico.
* Build artifacts (JS &amp; CSS bundles).
* Anything under `assets`.

### Making changes to your application

Now that you've seen how service workers cache your application, the 
next step is understanding how updates work. 

1. If you're testing in an incognito window, open a second blank tab. This will keep the incognito and the cache state alive during your test.

2. Close the application tab (but not the window). This should also close the Developer Tools. 

3. Shut down `http-server`.

Next, make a change to the application, and watch the service worker install the update.

4. Open `src/app/app.component.html` for editing.

5. Change the text `Welcome to {{title}}!` to `Bienvenue à {{title}}!`.

6. Build and run the server again:

```sh
$ ng build --prod
$ cd dist
$ http-server -p 8080
```

### Updating your application in the browser

Now look at how the browser and service worker handle the updated application.

1. Open http://localhost:8080 again in the same window. What happens?

![It still says "Welcome to app!](generated/images/guide/service-worker/welcome-msg-en.png)

What went wrong? Nothing, actually. The Angular service worker is doing its job and serving the version of the application that it has **installed**, even though there is an update available. The service worker doesn't wait to check for updates before it serves the application that it has cached, because that would be slow.

If you look at the `http-server` logs, you can see the service worker requesting `/ngsw.json`. This is how the service worker checks for updates.

2. Refresh the page.

![The text has changed to say "Bienvenue à app!"](generated/images/guide/service-worker/welcome-msg-fr.png) 

The service worker installed the updated version of your app *in the background*, and the next time the page was loaded or reloaded, the service worker switched to the latest version.

