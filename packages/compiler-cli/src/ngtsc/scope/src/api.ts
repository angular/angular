/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Reference} from '../../imports';
import {ClassDeclaration} from '../../reflection';
import {TypeCheckableDirectiveMeta} from '../../typecheck';

/**
 * Data for one of a given NgModule's scopes (either compilation scope or export scopes).
 */
export interface ScopeData {
  /**
   * Directives in the exported scope of the module.
   */
  directives: ScopeDirective[];

  /**
   * Pipes in the exported scope of the module.
   */
  pipes: ScopePipe[];
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
 * Metadata for a given directive within an NgModule's scope.
 */
export interface ScopeDirective extends TypeCheckableDirectiveMeta {
  /**
   * Unparsed selector of the directive.
   */
  selector: string;
}

/**
 * Metadata for a given pipe within an NgModule's scope.
 */
export interface ScopePipe {
  ref: Reference<ClassDeclaration>;
  name: string;
}
