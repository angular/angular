# Getting started with service workers

This document explains how to enable Angular service worker support in projects that you created with the [Angular CLI](tools/cli). It then uses an example to show you a service worker in action, demonstrating loading and basic caching.

## Adding a service worker to your project

To set up the Angular service worker in your project, run the following CLI command:

<docs-code language="shell">

ng add @angular/pwa

</docs-code>

The CLI configures your application to use service workers with the following actions:

1. Adds the `@angular/service-worker` package to your project.
1. Enables service worker build support in the CLI.
1. Imports and registers the service worker with the application's root providers.
1. Updates the `index.html` file:
    * Includes a link to add the `manifest.webmanifest` file
    * Adds a meta tag for `theme-color`
1. Installs icon files to support the installed Progressive Web App (PWA).
1. Creates the service worker configuration file called [`ngsw-config.json`](ecosystem/service-workers/config),
which specifies the caching behaviors and other settings.

Now, build the project:

<docs-code language="shell">

ng build

</docs-code>

The CLI project is now set up to use the Angular service worker.

## Service worker in action: a tour

This section demonstrates a service worker in action,
using an example application. To enable service worker support during local development, use the production configuration with the following command:

<docs-code language="shell">

ng serve --configuration=production

</docs-code>

Alternatively, you can use the [`http-server package`](https://www.npmjs.com/package/http-server) from
npm, which supports service worker applications. Run it without installation using:

<docs-code language="shell">

npx http-server -p 8080 -c-1 dist/&lt;project-name&gt;/browser

</docs-code>

This will serve your application with service worker support at http://localhost:8080.

### Initial load

With the server running on port `8080`, point your browser at `http://localhost:8080`.
Your application should load normally.

TIP: When testing Angular service workers, it's a good idea to use an incognito or private window in your browser to ensure the service worker doesn't end up reading from a previous leftover state, which can cause unexpected behavior.

HELPFUL: If you are not using HTTPS, the service worker will only be registered when accessing the application on `localhost`.

### Simulating a network issue

To simulate a network issue, disable network interaction for your application.

In Chrome:

1. Select **Tools** > **Developer Tools** (from the Chrome menu located in the top right corner).
1. Go to the **Network tab**.
1. Select **Offline** in the **Throttling** dropdown menu.

<img alt="The offline option in the Network tab is selected" src="assets/images/guide/service-worker/offline-option.png">

Now the application has no access to network interaction.

For applications that do not use the Angular service worker, refreshing now would display Chrome's Internet disconnected page that says "There is no Internet connection".

With the addition of an Angular service worker, the application behavior changes.
On a refresh, the page loads normally.

Look at the Network tab to verify that the service worker is active.

<img alt="Requests are marked as from ServiceWorker" src="assets/images/guide/service-worker/sw-active.png">

HELPFUL: Under the "Size" column, the requests state is `(ServiceWorker)`.
This means that the resources are not being loaded from the network.
Instead, they are being loaded from the service worker's cache.

### What's being cached?

Notice that all of the files the browser needs to render this application are cached.
The `ngsw-config.json` boilerplate configuration is set up to cache the specific resources used by the CLI:

* `index.html`
* `favicon.ico`
* Build artifacts (JS and CSS bundles)
* Anything under `assets`
* Images and fonts directly under the configured `outputPath` (by default `./dist/<project-name>/`) or `resourcesOutputPath`.
    See the documentation for `ng build` for more information about these options.

IMPORTANT: The generated `ngsw-config.json` includes a limited list of cacheable fonts and images extensions. In some cases, you might want to modify the glob pattern to suit your needs.

IMPORTANT: If `resourcesOutputPath` or `assets` paths are modified after the generation of configuration file, you need to change the paths manually in `ngsw-config.json`.

### Making changes to your application

Now that you've seen how service workers cache your application, the next step is understanding how updates work.
Make a change to the application, and watch the service worker install the update:

1. If you're testing in an incognito window, open a second blank tab.
    This keeps the incognito and the cache state alive during your test.

1. Close the application tab, but not the window.
    This should also close the Developer Tools.

1. Shut down `http-server` (Ctrl-c).
1. Open `src/app/app.component.html` for editing.
1. Change the text `Welcome to {{title}}!` to `Bienvenue à {{title}}!`.
1. Build and run the server again:

    <docs-code language="shell">

    ng build
    npx http-server -p 8080 -c-1 dist/<project-name>/browser

    </docs-code>

### Updating your application in the browser

Now look at how the browser and service worker handle the updated application.

1. Open [http://localhost:8080](http://localhost:8080) again in the same window.
    What happens?

    <img alt="It still says Welcome to Service Workers!" src="assets/images/guide/service-worker/welcome-msg-en.png">

    What went wrong?
    _Nothing, actually!_
    The Angular service worker is doing its job and serving the version of the application that it has **installed**, even though there is an update available.
    In the interest of speed, the service worker doesn't wait to check for updates before it serves the application that it has cached.

    Look at the `http-server` logs to see the service worker requesting `/ngsw.json`.

    <docs-code language="shell">
    [2023-09-07T00:37:24.372Z]  "GET /ngsw.json?ngsw-cache-bust=0.9365263935102124" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36"
    </docs-code>

    This is how the service worker checks for updates.

1. Refresh the page.

    <img alt="The text has changed to say Bienvenue à app!" src="assets/images/guide/service-worker/welcome-msg-fr.png">

    The service worker installed the updated version of your application _in the background_, and the next time the page is loaded or reloaded, the service worker switches to the latest version.

## More on Angular service workers

You might also be interested in the following:

<docs-pill-row>
  <docs-pill href="ecosystem/service-workers/config" title="Configuration file"/>
  <docs-pill href="ecosystem/service-workers/communications" title="Communicating with the Service Worker"/>
  <docs-pill href="ecosystem/service-workers/push-notifications" title="Push notifications"/>
  <docs-pill href="ecosystem/service-workers/devops" title="Service Worker devops"/>
  <docs-pill href="ecosystem/service-workers/app-shell" title="App shell pattern"/>
</docs-pill-row>
