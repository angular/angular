/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ProjectFile, UniqueID} from '../../utils/tsurge';

/** Unique ID of a component class across compilation units. */
export type ComponentID = UniqueID<'RouteInputBindingComponent'>;

/** Route state that can be read from an `ActivatedRoute` snapshot and bound to an input. */
export type RouteReadSource = 'params' | 'queryParams';

/** Key identifying a route read, e.g. `params:id`. */
export type RouteReadKey = `${RouteReadSource}:${string}`;

/** Information about a single route that renders a component. */
export interface RouteInfo {
  /** Names of the path parameters declared in the route's own `path`. */
  pathParams: string[];
  /**
   * Keys of the route's `data` and `resolve` objects. `null` if they
   * could not be determined statically (e.g. `data: someVariable`).
   */
  dataKeys: string[] | null;
}

/** Summary of how the router is configured in a compilation unit. */
export interface RouterSetupInfo {
  /** Number of `provideRouter`/`RouterModule.forRoot` calls with component input binding. */
  withBinding: number;
  /** Number of `provideRouter`/`RouterModule.forRoot` calls without component input binding. */
  withoutBinding: number;
  /** Number of router setups where query parameters might not be bound. */
  queryParamsNotBound: number;
}

export interface CompilationUnitData {
  routerSetup: RouterSetupInfo;
  /** Routes that render a given component. */
  routedComponents: Record<ComponentID, RouteInfo[]>;
  /**
   * Components that can't be migrated even if they're routed, because they may also be
   * rendered outside of a route: components imported by other components, or extended classes.
   */
  excludedComponents: Record<ComponentID, true>;
  /** Components that read route state from an injected `ActivatedRoute` snapshot. */
  candidates: Record<ComponentID, {file: ProjectFile; reads: RouteReadKey[]}>;
}

export interface GlobalMetadata {
  bindingEnabled: boolean;
  routerSetup: RouterSetupInfo;
  /**
   * Components that can be migrated, mapped to the route reads that
   * can be replaced with inputs and whether those inputs are required.
   */
  approved: Record<ComponentID, Partial<Record<RouteReadKey, {required: boolean}>>>;
  /** Total number of candidate components and reads, for reporting. */
  candidateComponents: number;
  candidateReads: number;
}

export interface MigrationConfig {
  /** Whether the given file should be migrated. */
  shouldMigrate?: (file: ProjectFile) => boolean;
}
