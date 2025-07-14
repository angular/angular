/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Type} from '../interface/type';

import {SchemaMetadata} from './schema';

export interface NgModuleType<T = any> extends Type<T> {
  ɵmod: NgModuleDef<T>;
}

/**
 * Represents the expansion of an `NgModule` into its scopes.
 *
 * A scope is a set of directives and pipes that are visible in a particular context. Each
 * `NgModule` has two scopes. The `compilation` scope is the set of directives and pipes that will
 * be recognized in the templates of components declared by the module. The `exported` scope is the
 * set of directives and pipes exported by a module (that is, module B's exported scope gets added
 * to module A's compilation scope when module A imports B).
 */
export interface NgModuleTransitiveScopes {
  compilation: {directives: Set<any>; pipes: Set<any>};
  exported: {directives: Set<any>; pipes: Set<any>};
  schemas: SchemaMetadata[] | null;
  isCustomElement: ((tagName: string) => boolean) | null;
}

/**
 * Runtime link information for NgModules.
 *
 * This is the internal data structure used by the runtime to assemble components, directives,
 * pipes, and injectors.
 *
 * NOTE: Always use `ɵɵdefineNgModule` function to create this object,
 * never create the object directly since the shape of this object
 * can change between versions.
 */
export interface NgModuleDef<T> {
  /** Token representing the module. Used by DI. */
  type: T;

  /**
   * List of components to bootstrap.
   *
   * @see {NgModuleScopeInfoFromDecorator} This field is only used in global compilation mode. In local compilation mode the bootstrap info is computed and added in runtime.
   */
  bootstrap: Type<any>[] | (() => Type<any>[]);

  /** List of components, directives, and pipes declared by this module. */
  declarations: Type<any>[] | (() => Type<any>[]);

  /** List of modules or `ModuleWithProviders` imported by this module. */
  imports: Type<any>[] | (() => Type<any>[]);

  /**
   * List of modules, `ModuleWithProviders`, components, directives, or pipes exported by this
   * module.
   */
  exports: Type<any>[] | (() => Type<any>[]);

  /**
   * Cached value of computed `transitiveCompileScopes` for this module.
   *
   * This should never be read directly, but accessed via `transitiveScopesFor`.
   */
  transitiveCompileScopes: NgModuleTransitiveScopes | null;

  /** The set of schemas that declare elements to be allowed in the NgModule. */
  schemas: SchemaMetadata[] | null;

  /** Function to determine if a tag name represents a custom element. */
  isCustomElement: ((tagName: string) => boolean) | null;

  /** Unique ID for the module with which it should be registered.  */
  id: string | null;
}
