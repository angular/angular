/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {SchemaMetadata} from '@angular/compiler';

import {Reexport, Reference} from '../../imports';
import {DirectiveMeta, NgModuleMeta, PipeMeta} from '../../metadata';
import {ClassDeclaration} from '../../reflection';


/**
 * Data for one of a given NgModule's scopes (either compilation scope or export scopes).
 */
export interface ScopeData {
  dependencies: Array<DirectiveMeta|PipeMeta>;

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

export enum ComponentScopeKind {
  NgModule,
  Standalone,
}


export interface LocalModuleScope extends ExportScope {
  kind: ComponentScopeKind.NgModule;
  ngModule: ClassDeclaration;
  compilation: ScopeData;
  reexports: Reexport[]|null;
  schemas: SchemaMetadata[];
}

export interface StandaloneScope {
  kind: ComponentScopeKind.Standalone;
  dependencies: Array<DirectiveMeta|PipeMeta|NgModuleMeta>;
  component: ClassDeclaration;
  schemas: SchemaMetadata[];
  isPoisoned: boolean;
}

export type ComponentScope = LocalModuleScope|StandaloneScope;

/**
 * Read information about the compilation scope of components.
 */
export interface ComponentScopeReader {
  getScopeForComponent(clazz: ClassDeclaration): ComponentScope|null;

  /**
   * Get the `RemoteScope` required for this component, if any.
   *
   * If the component requires remote scoping, then retrieve the directives/pipes registered for
   * that component. If remote scoping is not required (the common case), returns `null`.
   */
  getRemoteScope(clazz: ClassDeclaration): RemoteScope|null;
}
