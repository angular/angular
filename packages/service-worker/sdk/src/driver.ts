/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Operation, Plugin, PluginFactory, VersionWorker} from './api';
import {ScopedCache} from './cache';
import {Clock, NgSwAdapter} from './facade/adapter';
import {NgSwCache} from './facade/cache';
import {NgSwEvents} from './facade/events';
import {NgSwFetch} from './facade/fetch';
import {LOG, LOGGER, Verbosity} from './logging';
import {Manifest, parseManifest} from './manifest';
import {VersionWorkerImpl} from './worker';

let driverId: number = 0;

/**
 * Possible states for the service worker.
 *
 * @experimental
 */
export enum DriverState {
  // Just starting up - this is the initial state. The worker is not servicing requests yet.
  // Crucially, it does not know if it is an active worker, or is being freshly installed or
  // updated.
  STARTUP,

  // The service worker has an active manifest and is currently serving traffic.
  READY,

  // The service worker is READY, but also has an updated manifest staged. When a fetch
  // is received and no current tabs are open, the worker may choose to activate the
  // pending manifest and discard the old one, in which case it will transition to READY.
  UPDATE_PENDING,

  // The worker has started up, but had no active manifest cached. In this case, it must
  // download from the network.
  INSTALLING,

  // Something happened that prevented the worker from reaching a good state. In the LAME
  // state the worker forwards all requests directly to the network, effectively self-disabling.
  // The worker will not recover from this state until it is terminated.
  LAME,
}

/**
 * Manages the lifecycle of the Angular service worker.
 *
 * `Driver` is a singleton within the worker. It attempts to instantiate a `VersionWorker`,
 * a class that serves fetch (and other) events according to the instructions defined in a
 * particular version of a manifest file. The `Driver` maintains an active `VersionWorker`
 * and routes events to it when possible. A state machine ensures the `Driver` always
 * responds to traffic correctly.
 *
 * A principle consideration for choosing a 'correct' manifest with which to serve traffic
 * is when to switch to a new (updated) version of the manifest. `Driver` is responsible
 * for periodically downloading fresh versions of the manifest from the server, staging
 * a new `VersionWorker` if the manifest has been updated, and deciding when to switch app
 * traffic from the old to the new manifest. A large part of `Driver`'s logic is devoted
 * to this update process.
 *
 * At a high level, updates follow this process:
 *
 * 1) When a new `Driver` is created (worker startup), it initializes into a READY state
 *    and then checks for an updated manifest from the network.
 *
 * 2) If such a manifest is found, the `Driver` creates a new `VersionWorker` and attempts
 *    to set it up successfully, updating files from the old `VersionWorker` currently
 *    serving traffic.
 *
 * 3) If that update is successful, the driver queues the new manifest as staged and
 *    enters an UPDATE_PENDING state.
 *
 * 4) On the next `fetch` event that meets all the criteria for an update, the `Driver`
 *    activates the stage manifest, begins serving traffic with the new `VersionWorker`,
 *    and instructs the old `VersionWorker to clear up.
 *
 * @experimental
 */
export class Driver {
  // The worker always starts in STARTUP.
  private state: DriverState = DriverState.STARTUP;

  // A hash of the pending manifest, if the worker is in an UPDATE_PENDING state.
  private pendingUpdateHash: string = null !;

  // Tracks which `Driver` instance this is, useful for testing only.
  private id: number;

  // A `Promise` that resolves when the worker reaches a state other than READY. The worker
  // blocks on this when handling fetch events.
  private init: Promise<any>;

  // The currently active `VersionWorkerImpl`, which handles events for the active manifest.
  // This is only valid if the worker is in the READY or UPDATE_PENDING states.
  private active: VersionWorkerImpl;

  // A `CacheStorage` API wrapper with the service worker prefix. This is used to delete all
  // caches associated with the worker when upgrading between worker versions or recovering
  // from a critical error.
  private scopedCache: ScopedCache;

  // The next available id for observable streams used to communicate with application tabs.
  private streamId: number = 0;

  // A map of stream ids to `MessagePort`s that communicate with application tabs.
  private streams: {[key: number]: MessagePort} = {};

  // The worker's lifecycle log, which is appended to when lifecycle events happen. This
  // is not ever cleared, but should not grow very large.
  private lifecycleLog: string[] = [];

  // A `Promise` that resolves when the worker enters the READY state. Used only in tests.
  ready: Promise<any>;

  // A resolve function that resolves the `ready` promise. Used only for testing.
  readyResolve: Function;

  // A `Promise` that resolves when the worker enters the UPDATE_PENDING state. Used only
  // in tests.
  updatePending: Promise<any>;

  // A resolve function that resolves the `ready` promise. Used only for testing.
  updatePendingResolve: Function;

  // Stream IDs that are actively listening for update lifecycle events.
  private updateListeners: number[] = [];

  constructor(
      private manifestUrl: string, private plugins: PluginFactory<any>[],
      private scope: ServiceWorkerGlobalScope, private adapter: NgSwAdapter,
      private cache: NgSwCache, private events: NgSwEvents, public fetcher: NgSwFetch,
      public clock: Clock) {
    this.id = driverId++;

    // Set up Promises for testing.
    this.ready = new Promise(resolve => this.readyResolve = resolve);
    this.updatePending = new Promise(resolve => this.updatePendingResolve = resolve);

    // All SW caching should go through this cache.
    this.scopedCache = new ScopedCache(this.cache, 'ngsw:');

    // Subscribe to all the service worker lifecycle events:

    events.install = (event: InstallEvent) => {
      this.lifecycle('install event');

      event.waitUntil(Promise
                          .resolve()
                          // On installation, wipe all the caches to avoid any inconsistent states
                          // with what the previous script version saved.
                          .then(() => this.reset())
                          // Get rid of the old service worker asap.
                          .then(() => this.scope.skipWaiting()));
    };

    events.activate = (event: ActivateEvent) => {
      this.lifecycle('activate event');
      // Kick off the startup process right away, so the worker doesn't wait for fetch
      // events before getting a manifest and installing the app.
      if (!this.init) {
        this.startup();
      }
      // Take over all active pages. At this point the worker is still in STARTUP, so
      // all requests will fall back on the network.
      event.waitUntil(this.scope.clients.claim());
    };

    events.fetch = (event: FetchEvent) => {
      const req = event.request;

      // Handle the log event no matter what state the worker is in.
      if (req.url.endsWith('/ngsw.log')) {
        event.respondWith(this.status().then(
            status => this.adapter.newResponse(JSON.stringify(status, null, 2))));
        return;
      }

      // Skip fetch events when in LAME state - no need to wait for init for this.
      // Since the worker doesn't call event.respondWith(), the browser will go to
      // the network for this request.
      if (this.state === DriverState.LAME) {
        return;
      }

      // If this is the first request and the worker is in STARTUP, kick off the startup
      // process. This is a normal step for subsequent startups of the worker (during the
      // first one, the activate event usually kicks off the startup process).
      if (this.state === DriverState.STARTUP && !this.init) {
        this.startup();
      }

      // Should not happen, but just in case, throw an error.
      if (!this.init) {
        throw new Error(`init Promise not present in state ${DriverState[this.state]}`);
      }

      event.respondWith(
          this
              // For every request, first wait on initialization. After this.init resolves, the
              // worker should no longer be in STARTUP. Choose the strategy to handle the
              // request based on the worker's state.
              .init.then(() => {
                switch (this.state) {
                  case DriverState.READY:
                    // The worker is ready and this.active is set to a VersionWorker.
                    return this.active.fetch(req);
                  case DriverState.UPDATE_PENDING:
                    // The worker is ready but has a pending update. Decide whether to activate
                    // the pending manifest before servicing the request.
                    return this
                        .maybeUpdate(event.clientId)
                        // After maybeUpdate(), the worker is either still in UPDATE_PENDING (the
                        // worker couldn't update because other tabs were open, etc) or in READY
                        // and this.active is now the new VersionWorker for the updated manifest.
                        // Either way, serve the request with the active worker.
                        .then(() => this.active.fetch(req));
                  case DriverState.INSTALLING:
                  case DriverState.LAME:
                    // Whether the worker is still INSTALLING or has freshly transitioned to a
                    // LAME state, serve the request with the network.
                    return this.fetcher.request(req, true);
                  default:
                    // Shouldn't happen, but just be safe and serve the request from the network.
                    return this.fetcher.request(req, true);
                }
              }));
    };

    events.message = (event: MessageEvent & ExtendableEvent) => {
      // Skip all events in the LAME state.
      if (this.state === DriverState.LAME) {
        return;
      }

      // Start up if needed (see fetch above).
      if (this.state === DriverState.STARTUP && !this.init) {
        this.startup();
      }
      if (!this.init) {
        throw new Error(`init Promise not present in state ${DriverState[this.state]}`);
      }

      // Some sanity checks against the incoming message - is it intended for the worker?
      if (event.ports.length !== 1 || !event.data || !event.data.hasOwnProperty('$ngsw')) {
        return;
      }

      // Wait for initialization.
      event.waitUntil(this.init.then(() => {
        // Did the worker reach a good state?
        if (this.state !== DriverState.READY && this.state !== DriverState.UPDATE_PENDING) {
          // No - drop the message, it can't be handled until the worker is in a good state.
          return;
        }

        // The message includes a MessagePort for sending responses. Set this up as a stream.
        const respond: MessagePort = event.ports[0];
        const id = this.streamId++;
        this.streams[id] = respond;

        // Send the id as the first response. This can be used by the client to notify of an
        // "unsubscription" to this request.
        respond.postMessage({'$ngsw': true, 'id': id});

        // Handle the actual payload.
        return this.handleMessage(event.data, id);
      }));
    };

    events.push = (event: PushEvent) => {
      // Skip all PUSH messages in the LAME state. Technically this isn't valid per the spec,
      // but better to ignore them than throw random errors.
      if (this.state === DriverState.LAME) {
        return;
      }

      // Start up if needed (see fetch above).
      if (this.state === DriverState.STARTUP && !this.init) {
        this.startup();
      }
      if (!this.init) {
        throw new Error(`init Promise not present in state ${DriverState[this.state]}`);
      }

      event.waitUntil(Promise
                          // Wait for both initialization and the data sent with the push message.
                          .all([
                            this.init,
                            event.data.text(),
                          ])
                          // Result of this.init is unimportant as long as it's resolved.
                          .then(results => results[1])
                          .then(data => {
                            // Make sure the worker ended up in a good state after initialization.
                            if (this.state !== DriverState.READY &&
                                this.state !== DriverState.UPDATE_PENDING) {
                              // If not, drop the push message. Again, not valid per the spec, but
                              // safer than
                              // attempting
                              // to handle and throwing errors.
                              return;
                            }

                            // Handle the message with the active VersionWorker.
                            return this.active.push(data);
                          }));
    };
  }

  /**
   * Write a message to the lifecycle log.
   */
  private lifecycle(msg: string): void { this.lifecycleLog.push(msg); }

  /**
   * Attempt to reset the service worker to a pristine state, as if one had never been installed
   * before.
   *
   * This involves removing all of the caches that fall under the `ScopedCache` used by the
   * worker.
   */
  private reset(): Promise<any> {
    return this
        .scopedCache
        // List all the keys in the cache.
        .keys()
        .then(
            keys => Promise
                        // Wait for them all to be removed.
                        .all(keys.map(key => this.scopedCache.remove(key)))
                        // Log it for debugging.
                        .then(() => this.lifecycle(`reset removed ${keys.length} ngsw: caches`)));
  }

  /**
   * Start up the worker.
   *
   * this.init is set up as a Promise that resolves when the worker exits the STARTUP state.
   * In the background, it also kicks off a check for a new version of the manifest.
   *
   * In the usual update flow, this means that the worker will first transition to READY,
   * and then to UPDATE_PENDING when the updated manifest is set up and ready to be served.
   */
  private startup() {
    this.init = this.initialize();
    this.init.then(() => this.checkForUpdate());
  }

  /**
   * Possibly switch to a pending manifest if it's safe to do so.
   *
   * Safety is determined by whether there are other application tabs open, since they may
   * be depending on the worker to serve lazily-loaded js from the previous version of the
   * app, or it may be using a shared IndexedDB across all the tabs that can't be updated
   * yet, etc.
   */
  private maybeUpdate(clientId: any): Promise<any> {
    return this.scope.clients.matchAll().then((clients: any) => {
      // Currently, the only criteria is that this must be a fresh tab (no current
      // clients).
      if (clients.length !== 0) {
        return null !;
      }
      return this.doUpdate();
    });
  }

  /**
   * Switch to the staged worker (if any).
   *
   * After updating, the worker will be in state READY, always. If a staged manifest
   * was present and validated, it will be set as active.
   *
   * If `expectVersion` is set but the staged manifest does not match the expected
   * version, the update is skipped and the result resolves to false.
   */
  private doUpdate(expectVersion?: string): Promise<boolean> {
    return this.fetchManifestFromCache('staged').then(manifest => {
      // If no staged manifest exists in the cache, just transition to READY now.
      if (!manifest) {
        this.transition(DriverState.READY);
        return false;
      }
      // If a particular version is expected
      if (!!expectVersion && manifest._hash !== expectVersion) {
        return false;
      }
      return this
          // Open the new manifest. This implicitly validates that the manifest was
          // downloaded correctly and is ready to serve, and can resolve with null if
          // this validation fails.
          .openManifest(manifest)
          .then(
              worker => this
                            // Regardless of whether the new manifest validated correctly, clear the
                            // staged
                            // manifest. This ensures that if the validation failed, the worker will
                            // try again.
                            .clearStaged()
                            // If the worker is present, set the manifest as active, ensuring it
                            // will be used
                            // in the future.
                            .then(() => worker ? this.setManifest(manifest, 'active') : null !)
                            .then(() => {
                              if (worker) {
                                // Set this.active to the new worker.
                                const oldActive = this.active;
                                this.active = worker as VersionWorkerImpl;

                                // At this point, the old worker can clean up its caches as they're
                                // no longer
                                // needed.
                                this.cleanup(oldActive).then(
                                    () => this.lifecycle(
                                        `cleaned up old version ${oldActive.manifest._hash}`));

                                // Notify update listeners that an update has occurred.
                                this.updateListeners.forEach(id => {
                                  this.sendToStream(id, {
                                    type: 'activation',
                                    version: manifest._hash,
                                  });
                                });

                                this.lifecycle(`updated to manifest ${manifest._hash}`);
                              }

                              // Regardless of whether the manifest successfully validated, it is no
                              // longer
                              // a pending update, so transition to READY.
                              this.transition(DriverState.READY);
                              return true;
                            }) as Promise<boolean>);
    });
  }

  /**
   * Clear the currently active manifest (if any).
   */
  private clearActive(): Promise<any> {
    // Fail if the worker is in a state which expects an active manifest to be present.
    if (this.state === DriverState.READY || this.state === DriverState.UPDATE_PENDING) {
      return Promise.reject('Cannot clear the active manifest when it\'s being used.');
    }
    return this.scopedCache.invalidate('active', this.manifestUrl);
  }

  /**
   * Clear the currently staged manifest (if any).
   */
  private clearStaged(): Promise<any> {
    return this.scopedCache.invalidate('staged', this.manifestUrl);
  }

  /**
   * Check the network for a new version of the manifest, and stage it if possible.
   *
   * This will request a new copy of the manifest from the network and compare it with
   * both the active manifest and any staged manifest if present.
   *
   * If the manifest is newer than the active or the staged manifest, it will be loaded
   * and the setup process run for all installed plugins. If it passes that process, it
   * will be set as the staged manifest, and the worker state will be set to UPDATE_PENDING.
   *
   * checkForUpdate() returns a boolean indicating whether a staged update is pending,
   * regardless of whether this particular call caused the update to become staged.
   */
  private checkForUpdate(): Promise<boolean> {
    // If the driver isn't in a good serving state, there is no reasonable course of action
    // if an update would be found, so don't check.
    if (this.state !== DriverState.READY && this.state !== DriverState.UPDATE_PENDING) {
      this.lifecycle(`skipping update check, in state ${DriverState[this.state]}`);
      return Promise.resolve(false);
    }

    // If the worker is in the UPDATE_PENDING state, then no need to check, there is an update.
    if (this.state === DriverState.UPDATE_PENDING) {
      return Promise.resolve(true);
    }

    return Promise
        // Fetch active and staged manifests and a fresh copy of the manifest from the network.
        // Technically, the staged manifest should be null, but it is checked here for thoroughness.
        .all([
          this.fetchManifestFromCache('active'),
          this.fetchManifestFromCache('staged'),
          this.fetchManifestFromNetwork(),
        ])
        .then((manifests: Manifest[]) => {
          const [active, staged, network] = manifests;

          // If the request for a manifest from the network was unsuccessful, there's no
          // way to tell if an update is available, so skip.
          if (!network) {
            // Even if the network request failed, there could still be a pending manifest.
            // This technically shouldn't happen since the worker should have been placed in
            // the UPDATE_PENDING state by initialize(), but this is here for safety.
            if (!!staged) {
              // If there is a staged manifest, transition to UPDATE_PENDING.
              this.pendingUpdateHash = staged._hash;
              this.transition(DriverState.UPDATE_PENDING);
              return true;
            } else {
              return false;
            }
          }

          // If the network manifest is currently the active manifest, no update is available.
          if (!!active && active._hash === network._hash) {
            return false;
          }

          // If the network manifest is already staged, just go to UPDATE_PENDING. Theoretically
          // this shouldn't happen since initialize() should have already transitioned to
          // UPDATE_PENDING, but as above, this is here for safety.
          if (!!staged && staged._hash === network._hash) {
            this.lifecycle(`network manifest ${network._hash} is already staged`);
            this.pendingUpdateHash = staged._hash;
            this.transition(DriverState.UPDATE_PENDING);
            return true;
          }

          // A Promise which may do extra work before the update.
          let start = Promise.resolve();

          // If there is a staged manifest, then before setting up the update, remove it.
          if (!!staged) {
            this.lifecycle(`staged manifest ${staged._hash} is old, removing`);
            start = this.clearStaged();
          }
          return start
              // Create a VersionWorker from the network manifest, setting up all registered
              // plugins.
              // this.active is passed as if there is a currently active worker, the updated
              // VersionWorker will possibly update from it, saving bytes for files which have not
              // changed between manifest versions. This update process is plugin-specific.
              .then(() => this.setupManifest(network, this.active))
              // Once the new VersionWorker has been set up properly, mark the manifest as staged.
              // This sets up the worker to update to it on a future fetch event, when maybeUpdate()
              // decides to update.
              .then(() => this.setManifest(network, 'staged'))
              .then(() => {
                // Finally, transition to UPDATE_PENDING to indicate updates should be checked.
                this.pendingUpdateHash = network._hash;
                this.transition(DriverState.UPDATE_PENDING);
                this.lifecycle(`staged update to ${network._hash}`);
                return true;
              });
        });
  }

  /**
   * Transitions the worker out of the STARTUP state, by either serving the active
   * manifest or installing from the network if one is not present.
   *
   * Initialization can fail, which will result in the worker ending up in a LAME
   * state where it effectively disables itself until the next startup.
   *
   * This function returns a Promise which, when resolved, guarantees the worker is
   * no longer in a STARTUP state.
   */
  private initialize(): Promise<any> {
    // Fail if the worker is initialized twice.
    if (!!this.init) {
      throw new Error('double initialization!');
    }

    // Initialization is only valid in the STARTUP state.
    if (this.state !== DriverState.STARTUP) {
      return Promise.reject(new Error('driver: initialize() called when not in STARTUP state'));
    }

    return Promise
        // Fetch both active and staged manifests.
        .all([
          this.fetchManifestFromCache('active'),
          this.fetchManifestFromCache('staged'),
        ])
        .then(manifests => {
          const [active, staged] = manifests;
          if (!active) {
            // If there's no active manifest, then a network installation is required.
            this.transition(DriverState.INSTALLING);
            // Installing from the network is asynchronous, but initialization doesn't block on
            // it. Therefore the Promise returned from doInstallFromNetwork() is ignored.
            this.doInstallFromNetwork();
            return null;
          }
          return this
              // Turn the active manifest into a VersionWorker, which will implicitly validate that
              // all files are cached correctly. If this fails, openManifest() can resolve with a
              // null worker.
              .openManifest(active)
              .then(worker => {
                if (!worker) {
                  // The active manifest is somehow invalid. Nothing to do but enter a LAME state
                  // and remove it, and hope the next time the worker is initialized, a fresh copy
                  // will be installed from the network without issues.
                  this.transition(DriverState.LAME);
                  return this.clearActive();
                }
                this.lifecycle(`manifest ${active._hash} activated`);
                this.active = worker as VersionWorkerImpl;

                // If a staged manifest exists, go to UPDATE_PENDING instead of READY.
                if (!!staged) {
                  if (staged._hash === active._hash) {
                    this.lifecycle(
                        `staged manifest ${staged._hash} is already active, cleaning it up`);
                    this.transition(DriverState.READY);
                    return this.clearStaged();
                  } else {
                    this.lifecycle(`staged manifest ${staged._hash} present at initialization`);
                    this.pendingUpdateHash = staged._hash;
                    this.transition(DriverState.UPDATE_PENDING);
                    return null;
                  }
                }
                this.transition(DriverState.READY);
              });
        });
  }

  /**
   * Fetch and install a manifest from the network.
   *
   * If successful, the manifest will become active and the worker will finish in state
   * READY. If any errors are encountered, the worker will transition to a LAME state.
   */
  private doInstallFromNetwork(): Promise<any> {
    return this
        // First get a new copy of the manifest from the network.
        .fetchManifestFromNetwork()
        .then(manifest => {
          if (!manifest) {
            // If it wasn't successful, there's no graceful way to recover, so go to a
            // LAME state.
            this.lifecycle('no network manifest found to install from');
            this.transition(DriverState.LAME);
            return null;
          }
          return this
              // Set up a new VersionWorker using this manifest, which could fail if all of the
              // resources listed don't download correctly.
              .setupManifest(manifest, null !)
              .then((worker: any) => {
                if (!worker) {
                  this.lifecycle('network manifest setup failed');
                  this.transition(DriverState.LAME);
                  return null;
                }

                this
                    // Setup was successful, and the VersionWorker is ready to serve traffic. Set
                    // the
                    // new manifest as active.
                    .setManifest(manifest, 'active')
                    .then(() => {
                      // Set this.active and transition to READY.
                      this.active = worker as VersionWorkerImpl;
                      this.lifecycle(`installed version ${manifest._hash} from network`);
                      this.transition(DriverState.READY);
                    });
              });
        });
  }

  /**
   * Fetch a cached copy of the manifest.
   */
  private fetchManifestFromCache(cache: string): Promise<Manifest> {
    return this.scopedCache.load(cache, this.manifestUrl)
        .then(resp => this.manifestFromResponse(resp));
  }

  /**
   * Fetch a copy of the manifest from the network.
   *
   * Resolves with null on a failure.
   */
  private fetchManifestFromNetwork(): Promise<Manifest> {
    return this.fetcher.refresh(this.manifestUrl)
        .then(resp => this.manifestFromResponse(resp))
        .catch(() => null);
  }

  /**
   * Parse the given `Response` and return a `Manifest` object.
   */
  private manifestFromResponse(resp: Response): Promise<Manifest> {
    if (!resp || resp.status !== 200) {
      return null !;
    }
    return resp.text().then(body => parseManifest(body));
  }

  /**
   * Store the given `Manifest` in the given cache.
   */
  private setManifest(manifest: Manifest, cache: string): Promise<void> {
    return this.scopedCache.store(
        cache, this.manifestUrl, this.adapter.newResponse(manifest._json));
  }

  /**
   * Construct a `VersionWorker` for the given manifest.
   *
   * This worker will have all of the plugins specified during the bootstrap process installed,
   * but not yet initialized (setup()).
   */
  private workerFromManifest(manifest: Manifest): VersionWorkerImpl {
    const plugins: Plugin<any>[] = [];
    const worker = new VersionWorkerImpl(
        this, this.scope, manifest, this.adapter,
        new ScopedCache(this.scopedCache, `manifest:${manifest._hash}:`), this.clock, this.fetcher,
        plugins);
    plugins.push(...this.plugins.map(factory => factory(worker)));
    return worker;
  }

  /**
   * Instantiates a `VersionWorker` from a manifest and runs it through its setup process.
   *
   * Optionally, the worker can be directed to update from an existing `VersionWorker`
   * instead of performing a fresh setup. This can save time if resources have not changed
   * between the old and new manifests.
   */
  private setupManifest(manifest: Manifest, existing: VersionWorker = null !):
      Promise<VersionWorker> {
    const worker = this.workerFromManifest(manifest);
    return worker.setup(existing as VersionWorkerImpl).then(() => worker);
  }

  /**
   * Instantiates a `VersionWorker` from a manifest that was previously set up according
   * by `setupManifest`.
   *
   * The worker will be validated (its caches checked against the manifest to assure all
   * resources listed are cached properly). If it passes validation, the returned Promise
   * will resolve with the worker instance, if not it resolves with `null`.
   */
  private openManifest(manifest: Manifest): Promise<VersionWorker> {
    const worker = this.workerFromManifest(manifest);
    return worker
        // Run validation to make sure all resources have been previously set up properly.
        .validate()
        .then((valid: boolean) => {
          if (!valid) {
            // The worker wasn't valid - something was missing from the caches.
            this.lifecycle(`cached version ${manifest._hash} not valid`);

            // Attempt to recover by cleaning up the worker. This should allow it to be
            // freshly installed the next time the `Driver` starts.
            return this.cleanup(worker).then(() => null !);
          }
          return Promise.resolve(worker);
        });
  }

  /**
   * Run a `VersionWorker` through its cleanup process, resolving when it completes.
   */
  private cleanup(worker: VersionWorkerImpl): Promise<any> {
    return worker.cleanup().reduce<Promise<Response>>(
        (prev, curr) => prev.then(resp => curr()), Promise.resolve(null !));
  }

  /**
   * Fetch the status of the `Driver`, including current state and lifecycle messages.
   */
  private status(): Promise<any> {
    return Promise.resolve({
      state: DriverState[this.state],
      lifecycleLog: this.lifecycleLog,
    });
  }

  /**
   * Transition into a new state.
   *
   * `transition` logs the transition, and also handles resolving several promises useful
   * for testing the more asynchronous parts of the `Driver` which aren't exposed via the
   * more public API.
   */
  private transition(state: DriverState): void {
    this.lifecycle(`transition from ${DriverState[this.state]} to ${DriverState[state]}`);
    this.state = state;

    // If the `DRIVER` entered the READY state, resolve the ready Promise.
    if (state === DriverState.READY && this.readyResolve !== null) {
      const resolve = this.readyResolve;
      this.readyResolve = null !;
      resolve();
    }

    // If the driver entered the UPDATE_PENDING state, resolve the update pending Promise,
    // and reset the ready Promise.
    if (state === DriverState.UPDATE_PENDING && this.updatePendingResolve !== null) {
      this.ready = new Promise(resolve => this.readyResolve = resolve);
      const resolve = this.updatePendingResolve;
      this.updatePendingResolve = null !;
      resolve();
    }

    // If the driver entered the UPDATE_PENDING state, notify all update subscribers
    // about the pending update.
    if (state === DriverState.UPDATE_PENDING && this.pendingUpdateHash !== null) {
      this.updateListeners.forEach(id => this.sendToStream(id, {
        type: 'pending',
        version: this.pendingUpdateHash,
      }));
    } else if (state !== DriverState.UPDATE_PENDING) {
      // Reset the pending update hash if not transitioning to UPDATE_PENDING.
      this.pendingUpdateHash = null !;
    }
  }

  /**
   * Process a `postMessage` received by the worker.
   */
  private handleMessage(message: any, id: number): Promise<any> {
    // If the `Driver` is not in a known good state, nothing to do but exit.
    if (this.state !== DriverState.READY && this.state !== DriverState.UPDATE_PENDING) {
      this.lifecycle(`can't handle message in state ${DriverState[this.state]}`);
      return Promise.resolve();
    }

    // The message has a 'cmd' key which determines the action the `Driver` will take.
    // Some commands are handled directly by the `Driver`, the rest are passed on to the
    // active `VersionWorker` to be handled by a plugin.
    switch (message['cmd']) {
      // A ping is a request for the service worker to assert it is up and running by
      // completing the "Observable" stream.
      case 'ping':
        this.lifecycle(`responding to ping on ${id}`);
        this.closeStream(id);
        break;
      // An update message is a request for the service worker to keep the application
      // apprised of any pending update events, such as a new manifest becoming pending.
      case 'update':
        this.updateListeners.push(id);

        // Since this is a new subscriber, check if there's a pending update now and
        // deliver an initial event if so.
        if (this.state === DriverState.UPDATE_PENDING && this.pendingUpdateHash !== null) {
          this.sendToStream(id, {
            type: 'pending',
            version: this.pendingUpdateHash,
          });
        }
        break;
      // Check for a pending update, fetching a new manifest from the network if necessary,
      // and return the result as a boolean value beore completing.
      case 'checkUpdate':
        return this.checkForUpdate().then(value => {
          this.sendToStream(id, value);
          this.closeStream(id);
        });
      case 'activateUpdate':
        return this.doUpdate(message['version'] || undefined).then(success => {
          this.sendToStream(id, success);
          this.closeStream(id);
        });
      // 'cancel' is a special command that the other side has unsubscribed from the stream.
      // Plugins may choose to take action as a result.
      case 'cancel':
        // Attempt to look up the stream the client is requesting to cancel.
        const idToCancel = `${message['id']}`;
        if (!this.streams.hasOwnProperty(idToCancel)) {
          // Not found - nothing to do but exit.
          return Promise.resolve();
        }

        // Notify the active `VersionWorker` that the client has unsubscribed.
        this.active.messageClosed(id);

        // This listener may have been a subscriber to 'update' events.
        this.maybeRemoveUpdateListener(id);

        // Finally, remove the stream.
        delete this.streams[id];
        break;
      // A request to stream the service worker debugging log. Only one of these is valid
      // at a time.
      case 'log':
        LOGGER.messages = (message: string) => { this.sendToStream(id, message); };
        break;
      // A test push message
      case 'fakePush':
        let resolve: Function;
        let res = new Promise(r => resolve = r);
        this.events.push({
          data: {text: () => Promise.resolve(message['push'])} as any,
          waitUntil: (promise: Promise<any>) => { promise.then(() => resolve()); }
        });
        return res;
      // If the command is unknown, delegate to the active `VersionWorker` to handle it.
      default:
        return this.active.message(message, id);
    }
    return Promise.resolve();
  }

  /**
   * Remove the given stream id from the set of subscribers to update events, if present.
   */
  private maybeRemoveUpdateListener(id: number): void {
    const idx = this.updateListeners.indexOf(id);
    if (idx !== -1) {
      this.updateListeners.splice(idx, 1);
    }
  }

  /**
   * Post a message to the stream with the given id.
   */
  sendToStream(id: number, message: Object): void {
    if (!this.streams.hasOwnProperty(`${id}`)) {
      return;
    }
    this.streams[id].postMessage(message);
  }

  /**
   * Complete the stream with the given id.
   *
   * Per the protocol between the service worker and client tabs, a completion is modeled as
   * a null message.
   */
  closeStream(id: number): void {
    if (!this.streams.hasOwnProperty(`${id}`)) {
      return;
    }
    this.streams[id].postMessage(null);
    delete this.streams[id];
  }
}
