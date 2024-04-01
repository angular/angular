/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {EnvironmentProviders, makeEnvironmentProviders, ɵwithServerElementRefFactory} from '@angular/core';
import {provideNoopAnimations} from '@angular/platform-browser/animations';

import {PLATFORM_SERVER_PROVIDERS} from './server';

/**
 * The list of features as an enum to uniquely type each `ServerRenderingFeature`.
 * @see {@link ServerRenderingFeature}
 *
 * @publicApi
 */
export enum ServerRenderingFeatureKind {
  DomEmulation,
}

/**
 * Helper type to represent a Server Rendering feature.
 *
 * @publicApi
 */
export interface ServerRenderingFeature<FeatureKind extends ServerRenderingFeatureKind> {
  /** @internal */
  ɵkind: FeatureKind;
}

/**
 * Sets up providers necessary to enable server rendering functionality for the application.
 *
 * @usageNotes
 *
 * Basic example of how you can add server support to your application:
 * ```ts
 * bootstrapApplication(AppComponent, {
 *   providers: [provideServerRendering()]
 * });
 * ```
 *
 * @publicApi
 * @param features Optional features to configure additional server rendering behaviors.
 * @returns A set of providers to setup the server.
 */
export function provideServerRendering(
    ...features: ServerRenderingFeature<ServerRenderingFeatureKind>[]): EnvironmentProviders {
  const featuresKind = new Set<ServerRenderingFeatureKind>();
  for (const {ɵkind} of features) {
    featuresKind.add(ɵkind);
  }

  return makeEnvironmentProviders([
    provideNoopAnimations(),
    ...PLATFORM_SERVER_PROVIDERS,
    ...(featuresKind.has(ServerRenderingFeatureKind.DomEmulation) ? [] :
                                                                    ɵwithServerElementRefFactory()),
  ]);
}

/**
 * Enables support for DOM emulation during server rendering.
 *
 * @publicApi
 */
export function withDomEmulation():
    ServerRenderingFeature<ServerRenderingFeatureKind.DomEmulation> {
  return {
    ɵkind: ServerRenderingFeatureKind.DomEmulation,
  };
}
