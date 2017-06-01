import {FetchDelegate, FetchInstruction, NgSwCache, Operation, Plugin, PluginFactory, ScopedCache, UrlMatcher, VersionWorker, VersionWorkerImpl} from '@angular/service-worker/sdk';

import {DynamicGroup, DynamicStrategy, DynamicStrategyMap, ResponseWithSideEffect} from './group';
import {DynamicManifest} from './manifest';

/**
 * @experimental
 */
export function Dynamic(strategies: DynamicStrategy[]): PluginFactory<DynamicImpl> {
  return (worker: VersionWorker) => new DynamicImpl(worker as VersionWorkerImpl, strategies);
}

/**
 * A plugin which implements dynamic content caching - the caching of requests to
 * arbitrary URLs.
 *
 * @experimental
 */
export class DynamicImpl implements Plugin<DynamicImpl> {
  /**
   * The manifest configured by the user.
   */
  private manifest: DynamicManifest;

  /**
   * All `DynamicGroup`s configured, each one representing a group defined in
   * the manifest.
   */
  private group: DynamicGroup[];

  /**
   * Map of `optimizeFor` strategies to their implementations.
   */
  private strategies: DynamicStrategyMap = {};

  /**
   * `Promise` that tracks side effect application after requests have completed. This
   * is used to serialize application of side effects, even if requests are executed
   * in parallel.
   */
  private sideEffectQueue: Promise<any>;

  constructor(public worker: VersionWorkerImpl, strategies: DynamicStrategy[]) {
    // Extract the dynamic section of the manifest.
    this.manifest = worker.manifest['dynamic'];

    // Initially there are no side effects.
    this.sideEffectQueue = Promise.resolve();

    // Build the `strategies` map from all configured strategies.
    strategies.forEach(strategy => this.strategies[strategy.name] = strategy);
  }

  /**
   * After installation, setup the group array for immediate use. On
   * subsequent startups, this step is performed by `validate()`.
   */
  setup(ops: Operation[]): void {
    // If no dynamic caching configuration is provided, skip this plugin.
    if (!this.manifest) {
      return;
    }
    // Ensure even on first installation, the cache groups are loaded and
    // ready to serve traffic.
    ops.push(() => this._setupGroups());
  }

  fetch(req: Request): FetchInstruction|null {
    // If no dynamic caching configuration is provided, skip this plugin.
    if (!this.manifest) {
      return null;
    }

    // Return an instruction that applies dynamic content caching.
    const instruction: FetchInstruction = (next: FetchDelegate): Promise<Response> => {
      // There may be multiple groups configured. Check whether the request matches any
      // of them.
      const groups = this.group.filter(group => group.matches(req));
      if (groups.length === 0) {
        // It doesn't match any groups - continue down the chain.
        return next();
      }

      // It has matched at least one group. Only the first group is considered.
      return this
          // First, wait for any pending side effects to finish. This is precautionary,
          // more testing and design work is required to verify that multiple requests
          // can be processed before their side effects are fully resolved.
          .sideEffectQueue
          // After any pending side effects, route the fetch to the group. The group
          // will handle the request according to its configuration and return the
          // chosen response, along with an optional side effect (side effects are
          // things like updating the persisted cache state).
          .then(() => groups[0].fetch(req, next))
          // Primarily extract the response from the result and return it, but also
          // queue the side effect to run after sideEffectQueue resolves. Because of
          // the .sideEffectQueue in the chain above, this will likely run effect()
          // immediately, but the chain will not wait on effect() to fully resolve
          // before moving on.
          .then(result => {
            if (!!result.sideEffect) {
              // If there is a side effect, queue it to happen asynchronously.
              const effect = result.sideEffect;
              this.sideEffectQueue = this
                                         // Wait for the last effect to finish.
                                         .sideEffectQueue
                                         // Apply the new effect.
                                         .then(() => effect())
                                         // Errors shouldn't crash the side effect chain.
                                         // TODO: log errors somewhere
                                         .catch(() => {});
            }
            // Extract the response and return it.
            return result.response;
          });
    };
    return instruction;
  }

  /**
   * Ensure all configuration is valid and the Dynamic plugin is ready to serve
   * traffic.
   */
  validate(): Promise<boolean> {
    // If no configuration was provided, this plugin is not active.
    if (!this.manifest) {
      return Promise.resolve(true);
    }

    return this
        ._setupGroups()
        // Success or failure depends on the error state.
        .then(() => true)
        .catch(() => false);
  }

  /*
   * For every group configured in the manifest, instantiate the DynamicGroup
   * associated with it, which will validate the configuration. This is an async
   * operation as initializing the DynamicGroup involves loading stored state
   * from the cache.
   */
  private _setupGroups(): Promise<any> {
    return Promise
        // Open a DynamicGroup for each configured group.
        .all(this.manifest.group.map(
            config => DynamicGroup.open(
                config, this.worker.adapter, this.worker.cache, this.worker.clock,
                this.strategies)))
        // Once all groups are active, assign the array to this.group which is needed
        // to serve requests to the groups.
        .then(groups => this.group = groups);
  }
}
