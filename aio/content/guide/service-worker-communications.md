# Service worker communication

Importing `ServiceWorkerModule` into your `AppModule` doesn't just register the service worker, it also provides a few services you can use to interact with the service worker and control the caching of your application.

#### Prerequisites

A basic understanding of the following:
* [Getting Started with Service Workers](guide/service-worker-getting-started).


## `SwUpdate` service

The `SwUpdate` service gives you access to events that indicate when the service worker has discovered an available update for your application or when it has activated such an update&mdash;meaning it is now serving content from that update to your application.

The `SwUpdate` service supports four separate operations:
* Getting notified of *available* updates. These are new versions of the application to be loaded if the page is refreshed.
* Getting notified of update *activation*. This is when the service worker starts serving a new version of the application immediately.
* Asking the service worker to check the server for new updates.
* Asking the service worker to activate the latest version of the application for the current tab.

### Available and activated updates

The two update events, `available` and `activated`, are `Observable` properties of `SwUpdate`:

<code-example path="service-worker-getting-started/src/app/log-update.service.ts" header="log-update.service.ts" region="sw-update"></code-example>


You can use these events to notify the user of a pending update or to refresh their pages when the code they are running is out of date.

### Checking for updates

It's possible to ask the service worker to check if any updates have been deployed to the server.
The service worker checks for updates during initialization and on each navigation request&mdash;that is, when the user navigates from a different address to your application.
However, you might choose to manually check for updates if you have a site that changes frequently or want updates to happen on a schedule.

Do this with the `checkForUpdate()` method:

<code-example path="service-worker-getting-started/src/app/check-for-update.service.ts" header="check-for-update.service.ts"></code-example>

This method returns a `Promise` which indicates that the update check has completed successfully, though it does not indicate whether an update was discovered as a result of the check. Even if one is found, the service worker must still successfully download the changed files, which can fail. If successful, the `available` event will indicate availability of a new version of the application.

<div class="alert is-important">

In order to avoid negatively affecting the initial rendering of the page, `ServiceWorkerModule` waits for up to 30 seconds by default for the application to stabilize, before registering the ServiceWorker script.
Constantly polling for updates, for example, with [setInterval()](https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/setInterval) or RxJS' [interval()](https://rxjs.dev/api/index/function/interval), will prevent the application from stabilizing and the ServiceWorker script will not be registered with the browser until the 30 seconds upper limit is reached.

Note that this is true for any kind of polling done by your application.
Check the {@link ApplicationRef#isStable isStable} documentation for more information.

You can avoid that delay by waiting for the application to stabilize first, before starting to poll for updates, as shown in the example above.
Alternatively, you might want to define a different {@link SwRegistrationOptions#registrationStrategy registration strategy} for the ServiceWorker.

</div>

### Forcing update activation

If the current tab needs to be updated to the latest application version immediately, it can ask to do so with the `activateUpdate()` method:

<code-example path="service-worker-getting-started/src/app/prompt-update.service.ts" header="prompt-update.service.ts" region="sw-activate"></code-example>

<div class="alert is-important">

Calling `activateUpdate()` without reloading the page could break lazy-loading in a currently running app, especially if the lazy-loaded chunks use filenames with hashes, which change every version.
Therefore, it is recommended to reload the page once the promise returned by `activateUpdate()` is resolved.

</div>

### Handling an unrecoverable state

In some cases, the version of the application used by the service worker to serve a client might be in a broken state that cannot be recovered from without a full page reload.

For example, imagine the following scenario:
- A user opens the application for the first time and the service worker caches the latest version of the application.
  Let's assume the application's cached assets include `index.html`, `main.<main-hash-1>.js` and `lazy-chunk.<lazy-hash-1>.js`.
- The user closes the application and does not open it for a while.
- After some time, a new version of the application is deployed to the server.
  This newer version includes the files `index.html`, `main.<main-hash-2>.js` and `lazy-chunk.<lazy-hash-2>.js` (note that the hashes are different now, because the content of the files has changed).
  The old version is no longer available on the server.
- In the meantime, the user's browser decides to evict `lazy-chunk.<lazy-hash-1>.js` from its cache.
  Browsers may decide to evict specific (or all) resources from a cache in order to reclaim disk space.
- The user opens the application again.
  The service worker serves the latest version known to it at this point, namely the old version (`index.html` and `main.<main-hash-1>.js`).
- At some later point, the application requests the lazy bundle, `lazy-chunk.<lazy-hash-1>.js`.
- The service worker is unable to find the asset in the cache (remember that the browser evicted it).
  Nor is it able to retrieve it from the server (since the server now only has `lazy-chunk.<lazy-hash-2>.js` from the newer version).

In the above scenario, the service worker is not able to serve an asset that would normally be cached.
That particular application version is broken and there is no way to fix the state of the client without reloading the page.
In such cases, the service worker notifies the client by sending an `UnrecoverableStateEvent` event.
You can subscribe to `SwUpdate#unrecoverable` to be notified and handle these errors.

<code-example path="service-worker-getting-started/src/app/handle-unrecoverable-state.service.ts" header="handle-unrecoverable-state.service.ts" region="sw-unrecoverable-state"></code-example>


## More on Angular service workers

You may also be interested in the following:
* [Service Worker Notifications](guide/service-worker-notifications).