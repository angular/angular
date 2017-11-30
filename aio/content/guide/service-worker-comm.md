# Communicating with service workers

Importing `ServiceWorkerModule` into your `AppModule` doesn't just register the service worker, it also provides a few services you can use to interact with the service worker and control the caching of your app.

## `SwUpdate` service

The `SwUpdate` service gives you access to events that indicate when the service worker has discovered an available update for your app, or when it has activated such an update, meaning it is now serving content from that update to your app.

The `SwUpdate` service supports four separate operations:
* Getting notified of *available* updates. These are new versions of the app which will be loaded if the page is refreshed.
* Getting notified of update *activation*. This is when the service worker starts serving a new version of the app immediately.
* Asking the service worker to check the server for new updates.
* Asking the service worker to activate the latest version of the app for the current tab.

### Available &amp; activated updates

The two update events are `Observable` properties of `SwUpdate`:

<code-example path="service-worker-getstart/src/app/log-update.service.ts" linenums="false" title="log-update.service.ts" region="sw-update"> </code-example>


You can use these events to notify the user of a pending update or to refresh their pages when the code they are running is out of date.

### Checking for updates

It's possible to ask the service worker to check if any updates have been deployed to the server. You might choose to do this if you have a site that changes frequently or want updates to happen on a schedule.

Do this with the `checkForUpdate()` method:

<code-example path="service-worker-getstart/src/app/check-for-update.service.ts" linenums="false" title="check-for-update.service.ts" region="sw-check-update"> </code-example>


This method returns a `Promise` which indicates that the update check has completed successfully, though it does not indicate whether an update was discovered as a result of the check. Even if one is found, the service worker must still successfully download the changed files, which can fail. If successful, the `SwUpdate.available` event will indicate availability of a new version of the app.

### Forcing update activation

If the current tab needs to be updated to the latest app version immediately, it can ask to do so with the `SwUpdate.activateUpdate()` method:

<code-example path="service-worker-getstart/src/app/prompt-update.service.ts" linenums="false" title="prompt-update.service.ts" region="sw-activate"> </code-example>

Doing this could break lazy-loading into currently running apps, especially if the lazy-loaded chunks use filenames with hashes, which change every version.
