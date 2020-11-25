/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Reference} from '../../imports';
import {DirectiveMeta, PipeMeta} from '../../metadata';
import {ClassDeclaration} from '../../reflection';


/**
 * Data for one of a given NgModule's scopes (either compilation scope or export scopes).
 */
export interface ScopeData {
  /**
   * Directives in the exported scope of the module.
   */
  directives: DirectiveMeta[];

  /**
   * Pipes in the exported scope of the module.
   */
  pipes: PipeMeta[];

  /**
   * NgModules which contributed to the scope of the module.
   */
  ngModules: ClassDeclaration[];

  /**
   * Whether some module or component in this scope contains errors and is thus semantically
   * unreliable.
   */
  isPoisoned: boolean;
}

/**
 * An export scope of an NgModule, containing the directives/pipes it contributes to other NgModules
 * which import it.
 */
export interface ExportScope {
  /**
   * The scope exported by an NgModule, and available for import.
   */
  exported: ScopeData;
}

/**
 * A resolved scope for a given component that cannot be set locally in the component definition,
 * and must be set via remote scoping call in the component's NgModule file.
 */
export interface RemoteScope {
  /**
   * Those directives used by the component that requires this scope to be set remotely.
   */
  directives: Reference[];

  /**
   * Those pipes used by the component that requires this scope to be set remotely.
   */
  pipes: Reference[];
}