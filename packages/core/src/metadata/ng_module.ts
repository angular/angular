/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {InjectorDef, InjectorType, defineInjector} from '../di/defs';
import {convertInjectableProviderToFactory} from '../di/injectable';
import {Provider} from '../di/provider';
import {R3_COMPILE_NGMODULE} from '../ivy_switch';
import {Type} from '../type';
import {TypeDecorator, makeDecorator} from '../util/decorators';

export interface NgModuleDef<T> {
  type: T;
  bootstrap: Type<any>[];
  declarations: Type<any>[];
  imports: Type<any>[];
  exports: Type<any>[];

  transitiveCompileScope: {directives: any[]; pipes: any[];}|undefined;
}

export function defineNgModule<T>(def: {type: T} & Partial<NgModuleDef<T>>): never {
  const res: NgModuleDef<T> = {
    type: def.type,
    bootstrap: def.bootstrap || [],
    declarations: def.declarations || [],
    imports: def.imports || [],
    exports: def.exports || [],
    transitiveCompileScope: undefined,
  };
  return res as never;
}

/**
 * A wrapper around a module that also includes the providers.
 *
 *
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
 *
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
 *
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
 *
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

function preR3NgModuleCompile(moduleType: InjectorType<any>, metadata: NgModule): void {
  let imports = (metadata && metadata.imports) || [];
  if (metadata && metadata.exports) {
    imports = [...imports, metadata.exports];
  }

  moduleType.ngInjectorDef = defineInjector({
    factory: convertInjectableProviderToFactory(moduleType, {useClass: moduleType}),
    providers: metadata && metadata.providers,
    imports: imports,
  });
}

/**
 * NgModule decorator and metadata.
 *
 *
 * @Annotation
 */
export const NgModule: NgModuleDecorator = makeDecorator(
    'NgModule', (ngModule: NgModule) => ngModule, undefined, undefined,
    (type: Type<any>, meta: NgModule) => (R3_COMPILE_NGMODULE || preR3NgModuleCompile)(type, meta));
