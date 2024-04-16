/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {inject, Injectable, ɵRuntimeError as RuntimeError} from '@angular/core';

import {ActivatedRouteSnapshot, RouterStateSnapshot} from './router_state';
import {PRIMARY_OUTLET, RouteMetadataKey} from './shared';
import {MetadataEntry} from './models';
import {Meta} from '@angular/platform-browser';
import {RuntimeErrorCode} from './errors';

/**
 * Provides a strategy for setting the page metadata after a router navigation.
 */
@Injectable({providedIn: 'root', useFactory: () => inject(DefaultMetadataStrategy)})
export abstract class MetadataStrategy {
  /** Performs the application metadata update. */
  abstract updateMetadata(snapshot: RouterStateSnapshot): void;

  /**
   * @returns The merged metadata up to the deepest primary route.
   */
  buildMetadata(snapshot: RouterStateSnapshot): Array<MetadataEntry> | undefined {
    const metadataMap = new Map<string, MetadataEntry>();
    let route: ActivatedRouteSnapshot | undefined = snapshot.root;
    while (route !== undefined) {
      const metadataEntries: Array<MetadataEntry> | undefined =
        this.getResolvedMetadataForRoute(route);
      if (metadataEntries) {
        for (const metadata of metadataEntries) {
          metadataMap.set(computeMetadataKey(metadata), metadata);
        }
      }
      route = route.children.find((child) => child.outlet === PRIMARY_OUTLET);
    }
    return metadataMap.size === 0 ? undefined : Array.from(metadataMap.values());
  }

  /**
   * Given an `ActivatedRouteSnapshot`, returns the final value of the
   * `Route.metadata` property, which can either be a static object or a resolved value.
   */
  getResolvedMetadataForRoute(snapshot: ActivatedRouteSnapshot) {
    return snapshot.data[RouteMetadataKey];
  }
}

/**
 * The default `MetadataStrategy` used by the router that updates metadata using the `Meta` service.
 */
@Injectable({providedIn: 'root'})
export class DefaultMetadataStrategy extends MetadataStrategy {
  readonly meta = inject(Meta);
  tags: HTMLMetaElement[] | null = null;

  override updateMetadata(snapshot: RouterStateSnapshot): void {
    if (this.tags) {
      // Remove any tags that we previously added.
      for (const tag of this.tags) {
        tag.remove();
      }
    }

    const metadata = this.buildMetadata(snapshot);
    if (metadata) {
      this.tags = this.meta.addTags(metadata as any);
    }
  }
}

function computeMetadataKey(metadata: MetadataEntry): string {
  let prefix = '';
  let suffix = '';

  if (metadata.name) {
    // Document-level metadata
    prefix += 'D';
    suffix = metadata.name;
  }
  if (metadata.httpEquiv) {
    // Pragma directive
    prefix += 'H';
    suffix = metadata.httpEquiv;
  }
  if (metadata.charset) {
    // Charset declaration
    prefix += 'C';
  }
  if (metadata.itemprop) {
    // User-defined metadata
    prefix += 'U';
    suffix = metadata.itemprop;
  }
  if (metadata.property) {
    // Non-standard property (e.g. OG).
    prefix += 'P';
    suffix = metadata.property;
  }

  if (prefix.length !== 1) {
    throw new RuntimeError(
      RuntimeErrorCode.INVALID_METADATA,
      `Invalid metadata entry: expected one of the following to be provided: name, httpEquiv, charset, itemprop, or property.`,
    );
  }
  return prefix + suffix;
}
