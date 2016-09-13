/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Provider} from '../di';
import {Type} from '../type';
import {TypeDecorator, makeDecorator} from '../util/decorators';

/**
 * A wrapper around a module that also includes the providers.
 *
 * @stable
 */
export interface ModuleWithProviders {
  ngModule: Type<any>;
  providers?: Provider[];
}

/**
 * Interface for schema definitions in @NgModules.
 *
 * @experimental
 */
export interface SchemaMetadata { name: string; }

/**
 * Defines a schema that will allow:
 * - any non-angular elements with a `-` in their name,
 * - any properties on elements with a `-` in their name which is the common rule for custom
 * elements.
 *
 * @stable
 */
export const CUSTOM_ELEMENTS_SCHEMA: SchemaMetadata = {
  name: 'custom-elements'
};

/**
 * Defines a schema that will allow any property on any element.
 *
 * @experimental
 */
export const NO_ERRORS_SCHEMA: SchemaMetadata = {
  name: 'no-errors-schema'
};


/**
 * Type of the NgModule decorator / constructor function.
 *
 * @stable
 */
export interface NgModuleDecorator {
  /**
   * Defines an NgModule.
   */
  (obj?: NgModule): TypeDecorator;
  new (obj?: NgModule): NgModule;
}

/**
 * Type of the NgModule metadata.
 *
 * @stable
 */
export interface NgModule {
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
  providers?: Provider[];

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
  declarations?: Array<Type<any>|any[]>;

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
  imports?: Array<Type<any>|ModuleWithProviders|any[]>;

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
  exports?: Array<Type<any>|any[]>;

  /**
   * Defines the components that should be compiled as well when
   * this component is defined. For each components listed here,
   * Angular will create a {@link ComponentFactory ComponentFactory} and store it in the
   * {@link ComponentFactoryResolver ComponentFactoryResolver}.
   */
  entryComponents?: Array<Type<any>|any[]>;

  /**
   * Defines the components that should be bootstrapped when
   * this module is bootstrapped. The components listed here
   * will automatically be added to `entryComponents`.
   */
  bootstrap?: Array<Type<any>|any[]>;

  /**
   * Elements and properties that are not angular Components nor Directives have to be declared in
   * the schema.
   *
   * Available schemas:
   * - `NO_ERRORS_SCHEMA`: any elements and properties are allowed,
   * - `CUSTOM_ELEMENTS_SCHEMA`: any custom elements (tag name has "-") with any properties are
   *   allowed.
   *
   * @security When using one of `NO_ERRORS_SCHEMA` or `CUSTOM_ELEMENTS_SCHEMA` we're trusting that
   * allowed elements (and its properties) securely escape inputs.
   */
  schemas?: Array<SchemaMetadata|any[]>;

  /**
   * An opaque ID for this module, e.g. a name or a path. Used to identify modules in
   * `getModuleFactory`. If left `undefined`, the `NgModule` will not be registered with
   * `getModuleFactory`.
   */
  id?: string;
}

/**
 * NgModule decorator and metadata
 *
 * @stable
 * @Annotation
 */
export const NgModule: NgModuleDecorator = <NgModuleDecorator>makeDecorator('NgModule', {
  providers: undefined,
  declarations: undefined,
  imports: undefined,
  exports: undefined,
  entryComponents: undefined,
  bootstrap: undefined,
  schemas: undefined,
  id: undefined,
});