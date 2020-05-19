/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

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
