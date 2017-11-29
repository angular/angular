# DevOps: Angular service worker in production

This section is for anyone who is responsible for deploying and supporting production apps that use the Angular service worker. It explains how the Angular service worker fits into the larger production environment, the service worker's behavior under various conditions, and available recourses and failsafes if the service worker's behavior becomes problematic.

## Service worker and caching of app resources

Conceptually, you can imagine the Angular service worker as a forward cache or a CDN edge that is installed in the end user's web browser. The service worker's job is to satisfy requests made by the Angular app for resources or data from a local cache, without needing to wait for the network. Like any cache, it has rules for how content is expired and updated.

{@a versions}

### Versions of apps

In the context of an Angular service worker, a "version" is a collection of resources that represent a specific build of the Angular app. Whenever a new build of the app is deployed, the service worker treats that build as a new version of the app. This is true even if only a single file was updated. At any given time, the service worker may have multiple versions of the app in its cache, and it may be serving them simultaneously. For more information, see the [App tabs](guide/service-worker-devops#tabs) section below.

To preserve app integrity, the Angular service worker groups all files into a version together. The files grouped into a version usually includes application's HTML, JS, and CSS files. Grouping of these files is essential for integrity because HTML, JS, and CSS files frequently refer to each other and depend on specific content. For example, an `index.html` file might have a `<script>` tag that references `bundle.js`, and it might attempt to call a function `startApp()` from within that script. Any time this version of the index file is served, the corresponding `bundle.js` must be served with it. For example, assume that the `startApp()` function is renamed to `runApp()` in both files. In this scenario, it is not valid to serve the old index (which calls `startApp()`) along with the new bundle (which defines `runApp()`).

In Angular apps, this file integrity is especially important due to lazy loading. A JS bundle may reference many lazy chunks, and the filenames of the lazy chunks are unique to the particular build of the app. If a running app at version X attempts to load a lazy chunk, but the server has updated to version X + 1 already, the lazy loading operation will fail.

The version identifier of the app is determined by the contents of all resources, and it changes if any of them change. In practice, the version is determined by the contents of the `ngsw.json` file, which includes hashes for all known content. If any of the cached files change, the file's hash will change in `ngsw.json`, causing the Angular service worker to treat the active set of files as a new version. 

With the versioning behavior of the Angular service worker, an application server can ensure that the Angular app always has a consistent set of files.

#### Update checks

Every time the Angular service worker starts, it checks for updates to the app by looking for updates to the `ngsw.json` manifest. 

Note that the service worker starts periodically throughout the usage of the app because the web browser terminates the service worker if the page is idle beyond a given timeout.

### Resource integrity

One of the potential side effects of long caching is inadvertently caching an invalid resource. In a normal HTTP cache, a hard refresh or cache expiration limits the negative effects of caching an invalid file. A service worker ignores such constraints and effectively long caches the entire app. It is essential, then, that the service worker get the correct content.
<!-- JF--In case my edit of "gets" to "get" needs clarification (it may not, but playing it safe): the subordinate clause here has to be in the subjunctive because the main clause is an imposition of necessity. -->

To ensure that it gets the correct content, the Angular service worker validates the hashes of all resources for which it has a hash. Typically for a CLI app, this is everything in the `dist` directory covered by the user's `src/ngsw-config.json` configuration.

If a particular file fails validation, the Angular service worker attempts to re-fetch the content using a "cache-busting" URL parameter to eliminate the effects of browser or intermediate caching. If that content also fails validation, the service worker considers the entire version of the app to be invalid, and it stops serving the app. If necessary, the service worker enters a safe mode where requests fall back on the network, opting not to use its cache if the risk of serving invalid, broken, or outdated content is high.

Hash mismatches can occur for a variety of reasons:

* Caching layers in between the origin server and the end user could serve stale content.
* A non-atomic deployment could result in the Angular service worker having visibility of partially updated content.
* Errors during the build process could result in updated resources without `ngsw.json` being updated, or the reverse (updated `ngsw.json` without updated resources).

#### Unhashed content

The only resources that have hashes in the `ngsw.json` manifest are resources that were present in the `dist` directory at the time the manifest was built. Other resources, especially those loaded from CDNs, have content that is unknown at build time or updates more frequently than the app is deployed.

If the Angular service worker does not have a hash to validate a given resource, it will still cache its contents, but it will honor the HTTP caching headers by using a policy of "stale while revalidate." That is, when HTTP caching headers for a cached resource indicate that the resource has expired, the Angular service worker continues to serve the content, and it  attempts to refresh the resource in the background. This way, broken unhashed resources do not remain in the cache beyond their configured lifetimes.

{@a tabs}

### App tabs

It can be problematic for an app if the version of resources it's receiving changes suddenly or without warning. See the [Versions](guide/service-worker-devops#versions) section above for a description of such issues.

The Angular service worker provides a guarantee: a running app will continue to run the same version of the app. If another instance of the app is opened in a new web browser tab, then the most current version of the app is served. As a result, that new tab can be running a different version of the app than the original tab.

It's important to note that this guarantee is **stronger** than that provided by the normal web deployment model. Without a service worker, there is no guarantee that code lazily loaded later in a running app is from the same version as the initial code for the app.

There are a few limited reasons why the Angular service worker might change the version of a running app. Some of them are error conditions:

* The current version becomes invalid due to a failed hash.
* An unrelated error causes the service worker to enter safe mode (temporary deactivation).

The Angular service worker is aware of which versions are in use at any given moment, and it will clean up versions when no tab is using them.

Others are normal events:

* The page is reloaded/refreshed.
* The page requests an update be immediately activated via the `SwUpdate` service.

### Service worker updates

The Angular service worker is a small script that runs in end user web browsers. From time to time, it will be updated with bug fixes and feature improvements. 

The Angular service worker is downloaded when the app is first opened and when the app is accessed after a period of inactivity. If the service worker has changed, the service worker will be updated in the background.  

Most updates to the Angular service worker are transparent to the app&mdash;the old caches are still valid, and content is still served normally. However, occasionally a bugfix or feature in the Angular service worker requires the invalidation of old caches. In this case, the app will be refreshed transparently from the network.


## Debugging the Angular service worker

Occasionally, it may be necessary to examine Angular service worker in a running state, to investigate issues, or to ensure that it is operating as designed. Browsers provide built-in tools for debugging service workers, and the Angular service worker itself includes useful debugging features.

### Locating and analyzing debugging information

The Angular service worker exposes debugging information under the `ngsw/` virtual directory. Currently the single exposed URL is `ngsw/state`. Here is an example of this debug page's contents:

```
NGSW Debug Info:

Driver state: NORMAL ((nominal))
Latest manifest hash: eea7f5f464f90789b621170af5a569d6be077e5c
Last update check: never

=== Version eea7f5f464f90789b621170af5a569d6be077e5c ===

Clients: 7b79a015-69af-4d3d-9ae6-95ba90c79486, 5bc08295-aaf2-42f3-a4cc-9e4ef9100f65

=== Idle Task Queue ===
Last update tick: 1s496u
Last update run: never
Task queue:
 * init post-load (update, cleanup)

Debug log:
```

#### Driver state

The first line indicates the driver state: 

```
Driver state: NORMAL ((nominal))
```

`NORMAL` indicates that the service worker is operating normally, and is not in a degraded state. 

There are two possible degraded states:

* `EXISTING_CLIENTS_ONLY`: the service worker does not have a clean copy of the latest known version of the app. Older cached versions are safe to use, so existing tabs continue to run from cache, but new loads of the app will be served from network.

* `SAFE_MODE`: the service worker cannot guarantee the safety of using cached data. Either an unexpected error occurred or all cached versions are invalid. All traffic will be served from the network, running as little service worker code as possible.

In both cases, the parenthetical annotation provides the error that caused the service worker to enter the degraded state.


#### Latest mainfest hash

```
Latest manifest hash: eea7f5f464f90789b621170af5a569d6be077e5c
```

This is the SHA1 hash of the most up-to-date version of the app that the service worker knows about.


#### Last update check

```
Last update check: never
```

This indicates the last time the service worker checked for a new version (an update) of the app. `never` indicates that the service worker has never checked for an update. 

In this example debug file, the update check is currently scheduled, as explained the next section.

#### Version

```
=== Version eea7f5f464f90789b621170af5a569d6be077e5c ===

Clients: 7b79a015-69af-4d3d-9ae6-95ba90c79486, 5bc08295-aaf2-42f3-a4cc-9e4ef9100f65
```

In this example, the service worker has one version of the app cached, being used to serve two different tabs. Note that this version hash is the "latest manifest hash" listed above. Both clients are on the latest version. Each client is listed by its ID from the `Clients` API in the browser.


#### Idle task queue

```
=== Idle Task Queue ===
Last update tick: 1s496u
Last update run: never
Task queue:
 * init post-load (update, cleanup)
```

The Idle Task Queue is the queue of all pending tasks that happen in the background in the service worker. If there are any tasks in the queue, they are listed with a description. In this example, the service worker has one such task scheduled, a post-initialization operation involving an update check and cleanup of stale caches.

The last update tick/run counters give the time since specific events happened related to the idle queue. The "Last update run" counter shows the last time idle tasks were actually executed. "Last update tick" shows the time since the last event after which the queue might be processed.


#### Debug log

```
Debug log:
```

Errors that occur within the service worker will be logged here.


### Developer Tools

Browsers such as Chrome provide developer tools for interacting with service workers. Such tools can be powerful when used properly, but there are a few things to keep in mind.

* When using developer tools, the service worker is kept running in the background and never restarts. For the Angular service worker, this means that update checks to the app will generally not happen.

* If you look in the Cache Storage viewer, the cache is frequently out of date. Right click the Cache Storage title and refresh the caches.

Stopping and starting the service worker in the Service Worker pane triggers a check for updates.

## Failsafe

Like any complex system, bugs or broken configurations can cause the Angular service worker to act in unforeseen ways. While its design attempts to minimize the impact of such problems, the Angular service worker contains a failsafe mechanism in case an administrator ever needs to deactivate the service worker quickly.

To deactivate the service worker, remove or rename the `ngsw-config.json` file. When the service worker's request for `ngsw.json` returns a `404`, then the service worker removes all of its caches and unregisters itself, essentially self-destructing.


