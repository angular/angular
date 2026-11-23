/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Injector} from '../../di/injector';
import {getNodeInjectorTNode, NodeInjector} from '../../render3/di';
import {TNodeProviderIndexes} from '../../render3/interfaces/node';
import {
  getInjectorMetadata,
  getInjectorProviders,
} from '../../render3/util/injector_discovery_utils';

/**
 * A serialized representation of an Angular dependency injection graph.
 */
export interface DiGraph {
  /** The roots of the element injector trees starting from the requested root elements. */
  elementInjectorRoots: SerializedInjector[];

  /** The root of the environment injector tree for the application. */
  environmentInjectorRoot: SerializedInjector;
}

/**
 * A serialized representation of an Angular injector.
 */
export type SerializedInjector =
  | ElementSerializedInjector
  | EnvironmentSerializedInjector
  | NullSerializedInjector;

export interface ElementSerializedInjector {
  name: string;
  type: 'element';
  providers: SerializedProvider[];
  viewProviders: SerializedProvider[];
  children: SerializedInjector[];
  /** The host element associated with this injector. */
  hostElement: HTMLElement;
}

export interface EnvironmentSerializedInjector {
  name: string;
  type: 'environment';
  providers: SerializedProvider[];
  children: SerializedInjector[];
}

export interface NullSerializedInjector {
  name: string;
  type: 'null';
  providers: SerializedProvider[];
  children: SerializedInjector[];
}

/**
 * A serialized representation of a DI provider.
 */
export interface SerializedProvider {
  token: any;
  value: unknown;
}

/**
 * Serializes an injector and its children/providers into a tree.
 */
export function serializeInjector(injector: Injector): SerializedInjector {
  const metadata = getInjectorMetadata(injector);

  if (metadata?.type === 'null') {
    return {
      name: 'Null Injector',
      type: 'null',
      providers: [],
      children: [],
    };
  }

  // Only attempt to get providers for types supported by getInjectorProviders.
  let allProviders: SerializedProvider[] = [];
  if (metadata?.type === 'element' || metadata?.type === 'environment') {
    allProviders = getInjectorProviders(injector).map((record) => {
      return {
        token: record.token,
        value: injector.get(record.token, null, {optional: true, self: true}),
      };
    });
  }

  if (metadata?.type === 'element') {
    const tNode = getNodeInjectorTNode(injector as NodeInjector);
    const viewProvidersCount = tNode
      ? tNode.providerIndexes >> TNodeProviderIndexes.CptViewProvidersCountShift
      : 0;

    const viewProviders = allProviders.slice(0, viewProvidersCount);
    const resolvedProviders = allProviders.slice(viewProvidersCount);

    return {
      name: injector.constructor.name,
      type: 'element',
      providers: resolvedProviders,
      viewProviders,
      children: [],
      hostElement: metadata.source as HTMLElement,
    };
  }

  return {
    name: metadata?.source ?? injector.constructor.name ?? 'Unknown Injector',
    type: 'environment', // Fallback for other injector types
    providers: allProviders,
    children: [],
  };
}
