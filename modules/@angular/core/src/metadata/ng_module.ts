/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {InjectableMetadata} from '../di/metadata';
import {Type} from '../facade/lang';

/**
 * A wrapper around a module that also includes the providers.
 *
 * @experimental
 */
export interface ModuleWithProviders {
  ngModule: Type;
  providers?: any[];
}

/**
 * Interface for schema definitions in @NgModules.
 *
 * @experimental
 */
export interface SchemaMetadata { name: string; }

/**
 * Defines a schema that will allow any property on elements with a `-` in their name,
 * which is the common rule for custom elements.
 *
 * @experimental
 */
export const CUSTOM_ELEMENTS_SCHEMA: SchemaMetadata = {
  name: 'custom-elements'
};

/**
 * Declares an Angular Module.
 * @experimental
 */
export class NgModuleMetadata extends InjectableMetadata {
  /**
   * Defines the set of injectable objects that are available in the injector
   * of this module.
   *
   * ## Simple Example
   *
   * Here is an example of a class that can be injected:
   *
   * ```
   * class Greeter {
   *    greet(name:string) {
   *      return 'Hello ' + name + '!';
   *    }
   * }
   *
   * @NgModule({
   *   providers: [
   *     Greeter
   *   ]
   * })
   * class HelloWorld {
   *   greeter:Greeter;
   *
   *   constructor(greeter:Greeter) {
   *     this.greeter = greeter;
   *   }
   * }
   * ```
   */
  get providers(): any[] { return this._providers; }
  private _providers: any[];


  /**
   * Specifies a list of directives/pipes that belong to this module.
   *
   * ### Example
   *
   * ```javascript
   * @NgModule({
   *   declarations: [NgFor]
   * })
   * class CommonModule {
   * }
   * ```
   */
  declarations: Array<Type|any[]>;

  /**
   * Specifies a list of modules whose exported directives/pipes
   * should be available to templates in this module.
   * This can also contain {@link ModuleWithProviders}.
   *
   * ### Example
   *
   * ```javascript
   * @NgModule({
   *   imports: [CommonModule]
   * })
   * class MainModule {
   * }
   * ```
   */
  imports: Array<Type|ModuleWithProviders|any[]>;

  /**
   * Specifies a list of directives/pipes/module that can be used within the template
   * of any component that is part of an angular module
   * that imports this angular module.
   *
   * ### Example
   *
   * ```javascript
   * @NgModule({
   *   exports: [NgFor]
   * })
   * class CommonModule {
   * }
   * ```
   */
  exports: Array<Type|any[]>;

  /**
   * Defines the components that should be compiled as well when
   * this component is defined. For each components listed here,
   * Angular will create a {@link ComponentFactory ComponentFactory} and store it in the
   * {@link ComponentFactoryResolver ComponentFactoryResolver}.
   */
  entryComponents: Array<Type|any[]>;

  schemas: Array<SchemaMetadata|any[]>;

  constructor({providers, declarations, imports, exports, entryComponents, schemas}: {
    providers?: any[],
    declarations?: Array<Type|any[]>,
    imports?: Array<Type|any[]>,
    exports?: Array<Type|any[]>,
    entryComponents?: Array<Type|any[]>,
    schemas?: Array<SchemaMetadata|any[]>
  } = {}) {
    super();
    this._providers = providers;
    this.declarations = declarations;
    this.imports = imports;
    this.exports = exports;
    this.entryComponents = entryComponents;
    this.schemas = schemas;
  }
}
