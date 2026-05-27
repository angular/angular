/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/**
 * A token that defines a custom DI scope boundary for use with `providedIn`.
 *
 * `ProviderScopeToken` enables a middle ground between `providedIn: 'root'` (global singleton)
 * and explicit provider arrays. Services that declare `providedIn: myScopeToken` are lazily
 * provided in any injector that lists the `ProviderScopeToken` in its providers, without
 * needing to be explicitly listed themselves.
 *
 * This solves the problem where a single non-root-providable dependency forces all of its
 * dependants into explicit provider arrays, which are error-prone and hard to maintain.
 *
 * @usageNotes
 *
 * ### Define a scope token
 *
 * ```ts
 * export const entityScope = new ProviderScopeToken('entityScope');
 * ```
 *
 * ### Declare a service in that scope
 *
 * ```ts
 * @Injectable({ providedIn: entityScope })
 * export class ChildPreviewService { ... }
 * ```
 *
 * ### Register the scope on an environment injector
 *
 * ```ts
 * const scopedInjector = createEnvironmentInjector(
 *   [entityScope],
 *   parentInjector,
 * );
 *
 * scopedInjector.get(ChildPreviewService); // lazily created here
 * parentInjector.get(ChildPreviewService); // NullInjectorError – not in scope
 * ```
 *
 * @see {@link Injectable}
 * @see {@link InjectionToken}
 *
 * @publicApi
 */
export class ProviderScopeToken {
  readonly ngMetadataName = 'ProviderScopeToken';

  constructor(readonly _desc: string) {}

  toString(): string {
    return `ProviderScopeToken(${this._desc})`;
  }
}
