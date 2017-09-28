/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Adapter, Context} from './adapter';
import {CacheState, DebugIdleState, DebugState, DebugVersion, Debuggable, UpdateCacheStatus, UpdateSource} from './api';
import {AppVersion} from './app-version';
import {Database, Table} from './database';
import {DebugHandler} from './debug';
import {IdleScheduler} from './idle';
import {Manifest, ManifestHash, hashManifest} from './manifest';
import {MsgAny, isMsgActivateUpdate, isMsgCheckForUpdates} from './msg';
import {isNavigationRequest} from './util';

type ClientId = string;

type ManifestMap = {
  [hash: string]: Manifest
};
type ClientAssignments = {
  [id: string]: ManifestHash
};

const SYNC_THRESHOLD = 5000;

const SUPPORTED_CONFIG_VERSION = 1;

const NOTIFICATION_OPTION_NAMES = [
  'actions', 'body', 'dir', 'icon', 'lang', 'renotify', 'requireInteraction', 'tag', 'vibrate',
  'data'
];

interface LatestEntry {
  latest: string;
}

enum DriverReadyState {
  // The SW is operating in a normal mode, responding to all traffic.
  NORMAL,

  // The SW does not have a clean installation of the latest version of the app, but older cached
  // versions
  // are safe to use so long as they don't try to fetch new dependencies. This is a degraded state.
  EXISTING_CLIENTS_ONLY,

  // The SW has decided that caching is completely unreliable, and is forgoing request handling
  // until the
  // next restart.
  SAFE_MODE,
}

export class Driver implements Debuggable, UpdateSource {
  /**
   * Tracks the current readiness condition under which the SW is operating. This controls whether
   * the SW
   * attempts to respond to some or all requests.
   */
  private state: DriverReadyState = DriverReadyState.NORMAL;
  private stateMessage: string = '(nominal)';

  /**
   * Tracks whether the SW is in an initialized state or not. Before initialization, it's not legal
   * to
   * respond to requests.
   */
  initialized: Promise<void>|null = null;

  /**
   * Maps client IDs to the manifest hash of the application version being used to serve them. If a
   * client ID is not present here, it has not yet been assigned a version.
   *
   * If a ManifestHash appears here, it is also present in the `versions` map below.
   */
  private clientVersionMap = new Map<ClientId, ManifestHash>();

  /**
   * Maps manifest hashes to instances of `AppVersion` for those manifests.
   */
  private versions = new Map<ManifestHash, AppVersion>();

  /**
   * The latest version fetched from the server.
   *
   * Valid after initialization has completed.
   */
  private latestHash: ManifestHash|null = null;

  private lastUpdateCheck: number|null = null;

  /**
   * A scheduler which manages a queue of tasks that need to be executed when the SW is not doing
   * any other work (not processing any other requests).
   */
  idle: IdleScheduler;

  debugger: DebugHandler;

  constructor(
      private scope: ServiceWorkerGlobalScope, private adapter: Adapter, private db: Database) {
    // Listen to fetch events.
    this.scope.addEventListener(
        'install', (event) => { event !.waitUntil(this.scope.skipWaiting()); });
    this.scope.addEventListener('activate', (event) => {
      event !.waitUntil(this.scope.clients.claim());
      if (this.scope.registration.active !== null) {
        this.scope.registration.active.postMessage({action: 'INITIALIZE'});
      }
    });
    this.scope.addEventListener('fetch', (event) => this.onFetch(event !));
    this.scope.addEventListener('message', (event) => this.onMessage(event !));
    this.scope.addEventListener('push', (event) => this.onPush(event !));

    this.idle = new IdleScheduler(this.adapter, SYNC_THRESHOLD);
    this.debugger = new DebugHandler(this, this.adapter);
  }

  private onFetch(event: FetchEvent): void {
    // The only thing that is served unconditionally is the debug page.
    if (this.adapter.getPath(event.request.url) === '/ngsw/state') {
      event.respondWith(this.debugger.handleFetch(event.request));
      return;
    }

    // If the SW is in a broken state where it's not safe to handle requests at all, returning
    // causes the request to fall back on the network. This is preferred over
    // `respondWith(fetch(req))` because the latter still shows in DevTools that the request
    // was handled by the SW.
    // TODO: try to handle DriverReadyState.EXISTING_CLIENTS_ONLY here.
    if (this.state === DriverReadyState.SAFE_MODE) {
      // Even though the worker is in safe mode, idle tasks still need to happen so things
      // like update checks, etc. can take place.
      event.waitUntil(this.idle.trigger());
      return;
    }

    // Past this point, the SW commits to handling the request itself. This could still fail (and
    // result in `state` being set to `SAFE_MODE`), but even in that case the SW will still deliver
    // a response.
    event.respondWith(this.handleFetch(event));
  }

  private onMessage(event: ExtendableMessageEvent): void {
    if (this.state === DriverReadyState.SAFE_MODE) {
      return;
    }

    const data = event.data;
    if (!data || !data.action) {
      return;
    }

    if (data.action === 'INITIALIZE' && this.initialized === null) {
      this.initialized = this.initialize();
      event.waitUntil(this.initialized);
      event.waitUntil(this.idle.trigger());
      return;
    }

    if (!this.adapter.isClient(event.source)) {
      return;
    }
    event.waitUntil(this.handleMessage(data, event.source));
  }

  private onPush(msg: PushEvent): void {
    if (!msg.data) {
      return;
    }
    msg.waitUntil(this.handlePush(msg.data));
  }

  private async handleMessage(msg: MsgAny&{action: string}, from: Client): Promise<void> {
    if (isMsgCheckForUpdates(msg)) {
      const action = (async() => { await this.checkForUpdate(); })();
      await this.reportStatus(from, action, msg.statusNonce);
    } else if (isMsgActivateUpdate(msg)) {
      await this.reportStatus(from, this.updateClient(from), msg.statusNonce);
    }
  }

  private async handlePush(data: any): Promise<void> {
    this.broadcast({
      type: 'PUSH',
      data,
    });
    if (!data.notification || !data.notification.title) {
      return;
    }
    const desc = data.notification as{[key: string]: string | undefined};
    let options: {[key: string]: string | undefined} = {};
    NOTIFICATION_OPTION_NAMES.filter(name => desc.hasOwnProperty(name))
        .forEach(name => options[name] = desc[name]);
    this.scope.registration.showNotification(desc['title'] !, options);
  }

  private async reportStatus(client: Client, promise: Promise<void>, nonce: number): Promise<void> {
    const response = {type: 'STATUS', nonce, status: true};
    try {
      await promise;
      client.postMessage(response);
    } catch (e) {
      client.postMessage({
        ...response,
        status: false,
        error: e.toString(),
      });
    }
  }

  async updateClient(client: Client): Promise<void> {
    // Figure out which version the client is on. If it's not on the latest, it needs to be moved.
    const existing = this.clientVersionMap.get(client.id);
    if (existing === this.latestHash) {
      // Nothing to do, this client is already on the latest version.
      return;
    }

    // Switch the client over.
    let previous: Object|undefined = undefined;

    // Look up the application data associated with the existing version. If there isn't any,
    // fall back on using the hash.
    if (existing !== undefined) {
      const existingVersion = this.versions.get(existing) !;
      previous = this.mergeHashWithAppData(existingVersion.manifest, existing);
    }

    // Set the current version used by the client, and
    this.clientVersionMap.set(client.id, this.latestHash !);
    await this.sync();

    // Notify the client about this activation.
    const current = this.versions.get(this.latestHash !) !;
    const notice = {
      type: 'UPDATE_ACTIVATED',
      previous,
      current: this.mergeHashWithAppData(current.manifest, this.latestHash !),
    };

    client.postMessage(notice);
  }

  private async handleFetch(event: FetchEvent): Promise<Response> {
    // Since the SW may have just been started, it may or may not have been initialized already.
    // this.initialized will be `null` if initialization has not yet been attempted, or will be a
    // Promise which will resolve (successfully or unsuccessfully) if it has.
    if (this.initialized === null) {
      // Initialization has not yet been attempted, so attempt it. This should only ever happen once
      // per SW instantiation.
      this.initialized = this.initialize();
    }

    // If initialization fails, the SW needs to enter a safe state, where it declines to respond to
    // network requests.
    try {
      // Wait for initialization.
      await this.initialized;
    } catch (e) {
      // Initialization failed. Enter a safe state.
      this.state = DriverReadyState.SAFE_MODE;
      this.stateMessage = `Initialization failed due to error: ${errorToString(e)}`;

      // Even though the driver entered safe mode, background tasks still need to happen.
      event.waitUntil(this.idle.trigger());

      // Since the SW is already committed to responding to the currently active request,
      // respond with a network fetch.
      return this.scope.fetch(event.request);
    }

    // Decide which version of the app to use to serve this request. This is asynchronous as in
    // some cases, a record will need to be written to disk about the assignment that is made.
    const appVersion = await this.assignVersion(event);

    // Bail out
    if (appVersion === null) {
      event.waitUntil(this.idle.trigger());
      return this.scope.fetch(event.request);
    }

    // Handle the request. First try the AppVersion. If that doesn't work, fall back on the network.
    const res = await appVersion.handleFetch(event.request, event);

    // The AppVersion will only return null if the manifest doesn't specify what to do about this
    // request. In that case, just fall back on the network.
    if (res === null) {
      event.waitUntil(this.idle.trigger());
      return this.scope.fetch(event.request);
    }

    // Trigger the idle scheduling system. The Promise returned by trigger() will resolve after
    // a specific amount of time has passed. If trigger() hasn't been called again by then (e.g.
    // on a subsequent request), the idle task queue will be drained and the Promise won't resolve
    // until that operation is complete as well.
    event.waitUntil(this.idle.trigger());

    // The AppVersion returned a usable response, so return it.
    return res;
  }

  /**
   * Attempt to quickly reach a state where it's safe to serve responses.
   */
  private async initialize(): Promise<void> {
    // On initialization, all of the serialized state is read out of the 'control' table. This
    // includes:
    // - map of hashes to manifests of currently loaded application versions
    // - map of client IDs to their pinned versions
    // - record of the most recently fetched manifest hash
    //
    // If these values don't exist in the DB, then this is the either the first time the SW has run
    // or
    // the DB state has been wiped or is inconsistent. In that case, load a fresh copy of the
    // manifest
    // and reset the state from scratch.

    // Open up the DB table.
    const table = await this.db.open('control');

    // Attempt to load the needed state from the DB. If this fails, the catch {} block will populate
    // these variables with freshly constructed values.
    let manifests: ManifestMap, assignments: ClientAssignments, latest: LatestEntry;
    try {
      // Read them from the DB simultaneously.
      [manifests, assignments, latest] = await Promise.all([
        table.read<ManifestMap>('manifests'),
        table.read<ClientAssignments>('assignments'),
        table.read<LatestEntry>('latest'),
      ]);

      // Successfully loaded from saved state. This implies a manifest exists, so the update check
      // needs to happen in the background.
      this.idle.schedule('init post-load (update, cleanup)', async() => {
        await this.checkForUpdate();
        await this.cleanupCaches();
      });
    } catch (_) {
      // Something went wrong. Try to start over by fetching a new manifest from the server and
      // building
      // up an empty initial state.
      const manifest = await this.fetchLatestManifest();
      const hash = hashManifest(manifest);
      manifests = {};
      manifests[hash] = manifest;
      assignments = {};
      latest = {latest: hash};

      // Save the initial state to the DB.
      await Promise.all([
        table.write('manifests', manifests),
        table.write('assignments', assignments),
        table.write('latest', latest),
      ]);
    }

    // At this point, either the state has been loaded successfully, or fresh state with a new copy
    // of
    // the manifest has been produced. At this point, the `Driver` can have its internals hydrated
    // from
    // the state.

    // Initialize the `versions` map by setting each hash to a new `AppVersion` instance for that
    // manifest.
    Object.keys(manifests).forEach((hash: ManifestHash) => {
      const manifest = manifests[hash];

      // If the manifest is newly initialized, an AppVersion may have already been created for it.
      if (!this.versions.has(hash)) {
        this.versions.set(
            hash, new AppVersion(this.scope, this.adapter, this.db, this.idle, manifest, hash));
      }
    });

    // Wait for the scheduling of initialization of all versions in the manifest. Ordinarily this
    // just
    // schedules the initializations to happen during the next idle period, but in development mode
    // this might actually wait for the full initialization.
    await Promise.all(Object.keys(manifests).map(async(hash: ManifestHash) => {
      try {
        // Attempt to schedule or initialize this version. If this operation is successful, then
        // initialization either succeeded or was scheduled. If it fails, then full initialization
        // was attempted and failed.
        await this.scheduleInitialization(this.versions.get(hash) !);
      } catch (err) {
        return false;
      }
    }));

    // Map each client ID to its associated hash. Along the way, verify that the hash is still valid
    // for that clinet ID. It should not be possible for a client to still be associated with a hash
    // that was since removed from the state.
    Object.keys(assignments).forEach((clientId: ClientId) => {
      const hash = assignments[clientId];
      if (!this.versions.has(hash)) {
        throw new Error(
            `Invariant violated (initialize): no manifest known for hash ${hash} active for client ${clientId}`);
      }
      this.clientVersionMap.set(clientId, hash);
    });

    // Set the latest version.
    this.latestHash = latest.latest;

    // Finally, assert that the latest version is in fact loaded.
    if (!this.versions.has(latest.latest)) {
      throw new Error(
          `Invariant violated (initialize): latest hash ${latest.latest} has no known manifest`);
    }
  }

  private lookupVersionByHash(hash: ManifestHash, debugName: string = 'lookupVersionByHash'):
      AppVersion {
    // The version should exist, but check just in case.
    if (!this.versions.has(hash)) {
      throw new Error(
          `Invariant violated (${debugName}): want AppVersion for ${hash} but not loaded`);
    }
    return this.versions.get(hash) !;
  }

  /**
   * Decide which version of the manifest to use for the event.
   */
  private async assignVersion(event: FetchEvent): Promise<AppVersion|null> {
    // First, check whether the event has a client ID. If it does, the version may already be
    // associated.
    const clientId = event.clientId;
    if (clientId !== null) {
      // Check if there is an assigned client id.
      if (this.clientVersionMap.has(clientId)) {
        // There is an assignment for this client already.
        let hash = this.clientVersionMap.get(clientId) !;

        // Ordinarily, this client would be served from its assigned version. But, if this
        // request is a navigation request, this client can be updated to the latest version
        // immediately.
        if (this.state === DriverReadyState.NORMAL && hash !== this.latestHash &&
            isNavigationRequest(event.request, this.adapter)) {
          // Update this client to the latest version immediately.
          if (this.latestHash === null) {
            throw new Error(`Invariant violated (assignVersion): latestHash was null`);
          }

          const client = await this.scope.clients.get(clientId);

          await this.updateClient(client);
          hash = this.latestHash;
        }

        // TODO: make sure the version is valid.
        return this.lookupVersionByHash(hash, 'assignVersion');
      } else {
        // This is the first time this client ID has been seen. Whether the SW is in a state
        // to handle new clients depends on the current readiness state, so check that first.
        if (this.state !== DriverReadyState.NORMAL) {
          // It's not safe to serve new clients in the current state. It's possible that this
          // is an existing client which has not been mapped yet (see below) but even if that
          // is the case, it's invalid to make an assignment to a known invalid version, even
          // if that assignment was previously implicit. Return undefined here to let the
          // caller know that no assignment is possible at this time.
          return null;
        }

        // It's safe to handle this request. Two cases apply. Either:
        // 1) the browser assigned a client ID at the time of the navigation request, and
        //    this is truly the first time seeing this client, or
        // 2) a navigation request came previously from the same client, but with no client
        //    ID attached. Browsers do this to avoid creating a client under the origin in
        //    the event the navigation request is just redirected.
        //
        // In case 1, the latest version can safely be used.
        // In case 2, the latest version can be used, with the assumption that the previous
        // navigation request was answered under the same version. This assumption relies
        // on the fact that it's unlikely an update will come in between the navigation
        // request and requests for subsequent resources on that page.

        // First validate the current state.
        if (this.latestHash === null) {
          throw new Error(`Invariant violated (assignVersion): latestHash was null`);
        }

        // Pin this client ID to the current latest version, indefinitely.
        this.clientVersionMap.set(clientId, this.latestHash);
        await this.sync();

        // Return the latest `AppVersion`.
        return this.lookupVersionByHash(this.latestHash, 'assignVersion');
      }
    } else {
      // No client ID was associated with the request. This must be a navigation request
      // for a new client. First check that the SW is accepting new clients.
      if (this.state !== DriverReadyState.NORMAL) {
        return null;
      }

      // Serve it with the latest version, and assume that the client will actually get
      // associated with that version on the next request.

      // First validate the current state.
      if (this.latestHash === null) {
        throw new Error(`Invariant violated (assignVersion): latestHash was null`);
      }

      // Return the latest `AppVersion`.
      return this.lookupVersionByHash(this.latestHash, 'assignVersion');
    }
  }

  /**
   * Retrieve a copy of the latest manifest from the server.
   */
  private async fetchLatestManifest(): Promise<Manifest> {
    const res = await this.scope.fetch('/ngsw.json?ngsw-cache-bust=' + Math.random());
    if (!res.ok) {
      if (res.status === 404) {
        await this.deleteAllCaches();
        this.scope.registration.unregister();
      }
      throw new Error('Manifest fetch failed!');
    }
    this.lastUpdateCheck = this.adapter.time;
    return res.json();
  }

  private async deleteAllCaches(): Promise<void> {
    await(await this.scope.caches.keys())
        .filter(key => key.startsWith('ngsw:'))
        .reduce(async(previous, key) => {
          await Promise.all([
            previous,
            this.scope.caches.delete(key),
          ]);
        }, Promise.resolve());
  }

  /**
   * Schedule the SW's attempt to reach a fully prefetched state for the given AppVersion
   * when the SW is not busy and has connectivity. This returns a Promise which must be
   * awaited, as under some conditions the AppVersion might be initialized immediately.
   */
  private async scheduleInitialization(appVersion: AppVersion): Promise<void> {
    const initialize = async() => {
      try {
        await appVersion.initializeFully();
      } catch (err) {
        this.versionFailed(appVersion, err);
      }
    };
    // TODO: better logic for detecting localhost.
    if (this.scope.registration.scope.indexOf('://localhost') > -1) {
      return initialize();
    }
    this.idle.schedule(`initialization(${appVersion.manifestHash})`, initialize);
  }

  private versionFailed(appVersion: AppVersion, err: Error): void {
    // This particular AppVersion is broken. First, find the manifest hash.
    const broken =
        Array.from(this.versions.entries()).find(([hash, version]) => version === appVersion);
    if (broken === undefined) {
      // This version is no longer in use anyway, so nobody cares.
      return;
    }
    const brokenHash = broken[0];

    // TODO: notify affected apps.

    // The action taken depends on whether the broken manifest is the active (latest) or not.
    // If so, the SW cannot accept new clients, but can continue to service old ones.
    if (this.latestHash === brokenHash) {
      // The latest manifest is broken. This means that new clients are at the mercy of the
      // network, but caches continue to be valid for previous versions. This is unfortunate
      // but unavoidable.
      this.state = DriverReadyState.EXISTING_CLIENTS_ONLY;
      this.stateMessage = `Degraded due to failed initialization: ${errorToString(err)}`;

      // Cancel the binding for these clients.
      Array.from(this.clientVersionMap.keys())
          .forEach(clientId => this.clientVersionMap.delete(clientId));
    } else {
      // The current version is viable, but this older version isn't. The only possible remedy
      // is to stop serving the older version and go to the network. Figure out which clients
      // are affected and put them on the latest.
      const affectedClients =
          Array.from(this.clientVersionMap.keys())
              .filter(clientId => this.clientVersionMap.get(clientId) ! === brokenHash);
      // Push the affected clients onto the latest version.
      affectedClients.forEach(clientId => this.clientVersionMap.set(clientId, this.latestHash !));
    }
  }

  private async setupUpdate(manifest: Manifest, hash: string): Promise<void> {
    const newVersion = new AppVersion(this.scope, this.adapter, this.db, this.idle, manifest, hash);

    // Try to determine a version that's safe to update from.
    let updateFrom: AppVersion|undefined = undefined;

    // It's always safe to update from a version, even a broken one, as it will still only have
    // valid resources cached. If there is no latest version, though, this update will have to
    // install as a fresh version.
    if (this.latestHash !== null) {
      updateFrom = this.versions.get(this.latestHash);
    }

    // Firstly, check if the manifest version is correct.
    if (manifest.configVersion !== SUPPORTED_CONFIG_VERSION) {
      await this.deleteAllCaches();
      this.scope.registration.unregister();
      throw new Error(
          `Invalid config version: expected ${SUPPORTED_CONFIG_VERSION}, got ${manifest.configVersion}.`);
    }

    // Cause the new version to become fully initialized. If this fails, then the version will
    // not be available for use.
    await newVersion.initializeFully(this);

    // Install this as an active version of the app.
    this.versions.set(hash, newVersion);
    // Future new clients will use this hash as the latest version.
    this.latestHash = hash;

    await this.sync();
    await this.notifyClientsAboutUpdate();
  }

  async checkForUpdate(): Promise<boolean> {
    try {
      const manifest = await this.fetchLatestManifest();
      const hash = hashManifest(manifest);

      // Check whether this is really an update.
      if (this.versions.has(hash)) {
        return false;
      }
      await this.setupUpdate(manifest, hash);

      return true;
    } catch (_) {
      return false;
    }
  }

  /**
   * Synchronize the existing state to the underlying database.
   */
  private async sync(): Promise<void> {
    // Open up the DB table.
    const table = await this.db.open('control');

    // Construct a serializable map of hashes to manifests.
    const manifests: ManifestMap = {};
    this.versions.forEach((version, hash) => { manifests[hash] = version.manifest; });

    // Construct a serializable map of client ids to version hashes.
    const assignments: ClientAssignments = {};
    this.clientVersionMap.forEach((hash, clientId) => { assignments[clientId] = hash; });

    // Record the latest entry. Since this is a sync which is necessarily happening after
    // initialization, latestHash should always be valid.
    const latest: LatestEntry = {
      latest: this.latestHash !,
    };

    // Synchronize all of these.
    await Promise.all([
      table.write('manifests', manifests),
      table.write('assignments', assignments),
      table.write('latest', latest),
    ]);
  }

  async cleanupCaches(): Promise<void> {
    // Make sure internal state has been initialized before attempting to clean up caches.
    await this.initialized;

    // Query for all currently active clients, and list the client ids. This may skip some
    // clients in the browser back-forward cache, but not much can be done about that.
    const activeClients: ClientId[] =
        (await this.scope.clients.matchAll()).map(client => client.id);

    // A simple list of client ids that the SW has kept track of. Subtracting activeClients
    // from this list will result in the set of client ids which are being tracked but are no
    // longer used in the browser, and thus can be cleaned up.
    const knownClients: ClientId[] = Array.from(this.clientVersionMap.keys());

    // Remove clients in the clientVersionMap that are no longer active.
    knownClients.filter(id => activeClients.indexOf(id) === -1)
        .forEach(id => this.clientVersionMap.delete(id));

    // Next, determine the set of versions which are still used. All others can be removed.
    const usedVersions = new Set<string>();
    this.clientVersionMap.forEach((version, _) => usedVersions.add(version));

    // Collect all obsolete versions by filtering out used versions from the set of all versions.
    const obsoleteVersions =
        Array.from(this.versions.keys())
            .filter(version => !usedVersions.has(version) && version !== this.latestHash);

    // Remove all the versions which are no longer used.
    await obsoleteVersions.reduce(async(previous, version) => {
      // Wait for the other cleanup operations to complete.
      await previous;

      // Try to get past the failure of one particular version to clean up (this shouldn't happen,
      // but handle it just in case).
      try {
        // Get ahold of the AppVersion for this particular hash.
        const instance = this.versions.get(version) !;

        // Delete it from the canonical map.
        this.versions.delete(version);

        // Clean it up.
        await instance.cleanup();
      } catch (e) {
        // Oh well? Not much that can be done here. These caches will be removed when the SW revs
        // its format version, which happens from time to time.
      }
    }, Promise.resolve());

    // Commit all the changes to the saved state.
    await this.sync();
  }

  /**
   * Determine if a specific version of the given resource is cached anywhere within the SW,
   * and fetch it if so.
   */
  lookupResourceWithHash(url: string, hash: string): Promise<Response|null> {
    return Array
        // Scan through the set of all cached versions, valid or otherwise. It's safe to do such
        // lookups even for invalid versions as the cached version of a resource will have the
        // same hash regardless.
        .from(this.versions.values())
        // Reduce the set of versions to a single potential result. At any point along the
        // reduction, if a response has already been identified, then pass it through, as no
        // future operation could change the response. If no response has been found yet, keep
        // checking versions until one is or until all versions have been exhausted.
        .reduce(async(prev, version) => {
          // First, check the previous result. If a non-null result has been found already, just
          // return it.
          if (await prev !== null) {
            return prev;
          }

          // No result has been found yet. Try the next `AppVersion`.
          return version.lookupResourceWithHash(url, hash);
        }, Promise.resolve<Response|null>(null));
  }

  async lookupResourceWithoutHash(url: string): Promise<CacheState|null> {
    await this.initialized;
    const version = this.versions.get(this.latestHash !) !;
    return version.lookupResourceWithoutHash(url);
  }

  async previouslyCachedResources(): Promise<string[]> {
    await this.initialized;
    const version = this.versions.get(this.latestHash !) !;
    return version.previouslyCachedResources();
  }

  recentCacheStatus(url: string): Promise<UpdateCacheStatus> {
    const version = this.versions.get(this.latestHash !) !;
    return version.recentCacheStatus(url);
  }

  private mergeHashWithAppData(manifest: Manifest, hash: string): {hash: string, appData: Object} {
    return {
      hash,
      appData: manifest.appData as Object,
    };
  }

  async notifyClientsAboutUpdate(): Promise<void> {
    await this.initialized;

    const clients = await this.scope.clients.matchAll();
    const next = this.versions.get(this.latestHash !) !;

    await clients.reduce(async(previous, client) => {
      await previous;

      // Firstly, determine which version this client is on.
      const version = this.clientVersionMap.get(client.id);
      if (version === undefined) {
        // Unmapped client - assume it's the latest.
        return;
      }

      if (version === this.latestHash) {
        // Client is already on the latest version, no need for a notification.
        return;
      }

      const current = this.versions.get(version) !;

      // Send a notice.
      const notice = {
        type: 'UPDATE_AVAILABLE',
        current: this.mergeHashWithAppData(current.manifest, version),
        available: this.mergeHashWithAppData(next.manifest, this.latestHash !),
      };

      client.postMessage(notice);

    }, Promise.resolve());
  }

  async broadcast(msg: Object): Promise<void> {
    const clients = await this.scope.clients.matchAll();
    clients.forEach(client => { client.postMessage(msg); });
  }

  async debugState(): Promise<DebugState> {
    return {
      state: DriverReadyState[this.state],
      why: this.stateMessage,
      latestHash: this.latestHash,
      lastUpdateCheck: this.lastUpdateCheck,
    };
  }

  async debugVersions(): Promise<DebugVersion[]> {
    // Build list of versions.
    return Array.from(this.versions.keys()).map(hash => {
      const version = this.versions.get(hash) !;
      const clients = Array.from(this.clientVersionMap.entries())
                          .filter(([clientId, version]) => version === hash)
                          .map(([clientId, version]) => clientId);
      return {
        hash,
        manifest: version.manifest, clients,
        status: '',
      };
    });
  }

  async debugIdleState(): Promise<DebugIdleState> {
    return {
      queue: this.idle.taskDescriptions,
      lastTrigger: this.idle.lastTrigger,
      lastRun: this.idle.lastRun,
    };
  }
}

function errorToString(error: any): string {
  if (error instanceof Error) {
    return `${error.message}\n${error.stack}`;
  } else {
    return `${error}`;
  }
}