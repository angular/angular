# Service worker communication

Importing `ServiceWorkerModule` into your `AppModule` doesn't just register the service worker, it also provides a few services you can use to interact with the service worker and control the caching of your app.

#### Prerequisites

A basic understanding of the following:
* [Getting Started with Service Workers](guide/service-worker-getting-started).

<hr />


## `SwUpdate` service

The `SwUpdate` service gives you access to events that indicate when the service worker has discovered an available update for your app or when it has activated such an update&mdash;meaning it is now serving content from that update to your app.

The `SwUpdate` service supports four separate operations:
* Getting notified of *available* updates. These are new versions of the app to be loaded if the page is refreshed.
* Getting notified of update *activation*. This is when the service worker starts serving a new version of the app immediately.
* Asking the service worker to check the server for new updates.
* Asking the service worker to activate the latest version of the app for the current tab.

### Available and activated updates

The two update events, `available` and `activated`, are `Observable` properties of `SwUpdate`:

<code-example path="service-worker-getting-started/src/app/log-update.service.ts" header="log-update.service.ts" region="sw-update"></code-example>


You can use these events to notify the user of a pending update or to refresh their pages when the code they are running is out of date.

### Checking for updates

It's possible to ask the service worker to check if any updates have been deployed to the server.
The service worker checks for updates during initialization and on each navigation request&mdash;that is, when the user navigates from a different address to your app.
However, you might choose to manually check for updates if you have a site that changes frequently or want updates to happen on a schedule.

Do this with the `checkForUpdate()` method:

<code-example path="service-worker-getting-started/src/app/check-for-update.service.ts" header="check-for-update.service.ts"></code-example>

This method returns a `Promise` which indicates that the update check has completed successfully, though it does not indicate whether an update was discovered as a result of the check. Even if one is found, the service worker must still successfully download the changed files, which can fail. If successful, the `available` event will indicate availability of a new version of the app.

<div class="alert is-important">

In order to avoid negatively affecting the initial rendering of the page, `ServiceWorkerModule` waits for up to 30 seconds by default for the app to stabilize, before registering the ServiceWorker script.
Constantly polling for updates, for example, with [setInterval()](https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/setInterval) or RxJS' [interval()](https://rxjs.dev/api/index/function/interval), will prevent the app from stabilizing and the ServiceWorker script will not be registered with the browser until the 30 seconds upper limit is reached.

Note that this is true for any kind of polling done by your application.
Check the {@link ApplicationRef#isStable isStable} documentation for more information.

You can avoid that delay by waiting for the app to stabilize first, before starting to poll for updates, as shown in the example above.
Alternatively, you might want to define a different {@link SwRegistrationOptions#registrationStrategy registration strategy} for the ServiceWorker.

</div>

### Forcing update activation

If the current tab needs to be updated to the latest app version immediately, it can ask to do so with the `activateUpdate()` method:

<code-example path="service-worker-getting-started/src/app/prompt-update.service.ts" header="prompt-update.service.ts" region="sw-activate"></code-example>

<div class="alert is-important">

Calling `activateUpdate()` without reloading the page could break lazy-loading in a currently running app, especially if the lazy-loaded chunks use filenames with hashes, which change every version.
Therefore, it is recommended to reload the page once the promise returned by `activateUpdate()` is resolved.

</div>

## More on Angular service workers

You may also be interested in the following:
* [Service Worker in Production](guide/service-worker-devops).
