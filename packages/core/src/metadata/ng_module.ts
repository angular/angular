/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Provider, StaticProvider, InjectorDef, InjectorDefType} from '../di';
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
 * - any non-Angular elements with a `-` in their name,
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
   * Specifies a list of directives/pipes/modules that can be used within the template
   * of any component that is part of an Angular module
   * that imports this Angular module.
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
   * Specifies a list of components that should be compiled when this module is defined.
   * For each component listed here, Angular will create a {@link ComponentFactory}
   * and store it in the {@link ComponentFactoryResolver}.
   */
  entryComponents?: Array<Type<any>|any[]>;

  /**
   * Defines the components that should be bootstrapped when
   * this module is bootstrapped. The components listed here
   * will automatically be added to `entryComponents`.
   */
  bootstrap?: Array<Type<any>|any[]>;

  /**
   * Elements and properties that are not Angular components nor directives have to be declared in
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

let uniqueInjectorSymbolId = 0;

/**
 * NgModule decorator and metadata.
 *
 * @stable
 * @Annotation
 */
export const NgModule: NgModuleDecorator = function(module: NgModule) {
  return function(type: Type<any>) {
    const deps: any[] = []; // TODO need to extract T's arguments
    const providers: StaticProvider[] = module.providers || [] as any; // TODO: Need to properly convert to StaticProviders
    const imports = module.imports as any[]; // TODO: Need a proper way of converting.
    (type as InjectorDefType<any>).ngInjectorDef = defineInjector(type as InjectorDefType<any>, deps, {
      providers: providers,
      imports: imports,
    });
  };
} as any;

export function defineInjector<T>(type: InjectorDefType<T>, deps: any[], opts: {
  providers: StaticProvider[], imports: InjectorDefType<any>[]
}): InjectorDef<T> {
  return {
    type: type,
    deps: deps,
    providers: opts.providers,
    imports: opts.imports,
    symbol: `__ngInjectorDef_${uniqueInjectorSymbolId++}__`
  };
}
