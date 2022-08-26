# Service worker communication

Importing `ServiceWorkerModule` into your `AppModule` doesn't just register the service worker, it also provides a few services you can use to interact with the service worker and control the caching of your application.

## Prerequisites

A basic understanding of the following:

*   [Getting Started with Service Workers](guide/service-worker-getting-started)

## `SwUpdate` service

The `SwUpdate` service gives you access to events that indicate when the service worker discovers and installs an available update for your application.

The `SwUpdate` service supports three separate operations:

*   Get notified when an updated version is *detected* on the server, *installed and ready* to be used locally or when an *installation fails*
*   Ask the service worker to check the server for new updates
*   Ask the service worker to activate the latest version of the application for the current tab

### Version updates

The `versionUpdates` is an `Observable` property of `SwUpdate` and emits four event types:

| Event types                      | Details |
|:---                              |:---     |
| `VersionDetectedEvent`           | Emitted when the service worker has detected a new version of the app on the server and is about to start downloading it.                                                   |
| `NoNewVersionDetectedEvent`      | Emitted when the service worker has checked the version of the app on the server and did not find a new version.                                                            |
| `VersionReadyEvent`              | Emitted when a new version of the app is available to be activated by clients. It may be used to notify the user of an available update or prompt them to refresh the page. |
| `VersionInstallationFailedEvent` | Emitted when the installation of a new version failed. It may be used for logging/monitoring purposes.                                                                      |


<code-example header="log-update.service.ts" path="service-worker-getting-started/src/app/log-update.service.ts" region="sw-update"></code-example>


### Checking for updates

It's possible to ask the service worker to check if any updates have been deployed to the server.
The service worker checks for updates during initialization and on each navigation request &mdash;that is, when the user navigates from a different address to your application.
However, you might choose to manually check for updates if you have a site that changes frequently or want updates to happen on a schedule.

Do this with the `checkForUpdate()` method:

<code-example header="check-for-update.service.ts" path="service-worker-getting-started/src/app/check-for-update.service.ts"></code-example>

This method returns a `Promise<boolean>` which indicates if an update is available for activation.
The check might fail, which will cause a rejection of the `Promise`.

<div class="alert is-important">

In order to avoid negatively affecting the initial rendering of the page, `ServiceWorkerModule` waits for up to 30 seconds by default for the application to stabilize, before registering the ServiceWorker script.
Constantly polling for updates, for example, with [setInterval()](https://developer.mozilla.org/docs/Web/API/WindowOrWorkerGlobalScope/setInterval) or RxJS' [interval()](https://rxjs.dev/api/index/function/interval), prevents the application from stabilizing and the ServiceWorker script is not registered with the browser until the 30 seconds upper limit is reached.

<div class="alert is-helpful">

**NOTE**: <br />
This is true for any kind of polling done by your application.
Check the [isStable](api/core/ApplicationRef#isStable) documentation for more information.

</div>

Avoid that delay by waiting for the application to stabilize first, before starting to poll for updates, as shown in the preceding example.
Alternatively, you might want to define a different [registration strategy](api/service-worker/SwRegistrationOptions#registrationStrategy) for the ServiceWorker.

</div>

### Updating to the latest version

You can update an existing tab to the latest version by reloading the page as soon as a new version is ready.
To avoid disrupting the user's progress, it is generally a good idea to prompt the user and let them confirm that it is OK to reload the page and update to the latest version:

<code-example header="prompt-update.service.ts" path="service-worker-getting-started/src/app/prompt-update.service.ts" region="sw-version-ready"></code-example>

<div class="alert is-important">

Calling {@link SwUpdate#activateUpdate SwUpdate#activateUpdate()} updates a tab to the latest version without reloading the page, but this could break the application.

Updating without reloading can create a version mismatch between the [application shell](guide/glossary#app-shell) and other page resources, such as [lazy-loaded chunks](guide/glossary#lazy-loading), whose filenames may change between versions.

You should only use `activateUpdate()`, if you are certain it is safe for your specific use case.

</div>

### Handling an unrecoverable state

In some cases, the version of the application used by the service worker to serve a client might be in a broken state that cannot be recovered from without a full page reload.

For example, imagine the following scenario:

*   A user opens the application for the first time and the service worker caches the latest version of the application.
    Assume the application's cached assets include `index.html`, `main.<main-hash-1>.js` and `lazy-chunk.<lazy-hash-1>.js`.

*   The user closes the application and does not open it for a while.
*   After some time, a new version of the application is deployed to the server.
    This newer version includes the files `index.html`, `main.<main-hash-2>.js` and `lazy-chunk.<lazy-hash-2>.js`.

    <div class="alert is-helpful">

    **NOTE**: <br />
    The hashes are different now, because the content of the files changed.

    </div>

    The old version is no longer available on the server.

*   In the meantime, the user's browser decides to evict `lazy-chunk.<lazy-hash-1>.js` from its cache.
    Browsers might decide to evict specific \(or all\) resources from a cache in order to reclaim disk space.

*   The user opens the application again.
    The service worker serves the latest version known to it at this point, namely the old version \(`index.html` and `main.<main-hash-1>.js`\).

*   At some later point, the application requests the lazy bundle, `lazy-chunk.<lazy-hash-1>.js`.
*   The service worker is unable to find the asset in the cache \(remember that the browser evicted it\).
    Nor is it able to retrieve it from the server \(because the server now only has `lazy-chunk.<lazy-hash-2>.js` from the newer version\).

In the preceding scenario, the service worker is not able to serve an asset that would normally be cached.
That particular application version is broken and there is no way to fix the state of the client without reloading the page.
In such cases, the service worker notifies the client by sending an `UnrecoverableStateEvent` event.
Subscribe to `SwUpdate#unrecoverable` to be notified and handle these errors.

<code-example header="handle-unrecoverable-state.service.ts" path="service-worker-getting-started/src/app/handle-unrecoverable-state.service.ts" region="sw-unrecoverable-state"></code-example>

## More on Angular service workers

You might also be interested in the following:

*   [Service Worker Notifications](guide/service-worker-notifications)

<!-- links -->

<!-- external links -->

<!-- end links -->

@reviewed 2022-02-28
