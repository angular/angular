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
import {Type} from '../type';
import {TypeDecorator, makeDecorator} from '../util/decorators';


/**
 * A wrapper around an NgModule that associates it with the providers.
 *
 *
 */
export interface ModuleWithProviders {
  ngModule: Type<any>;
  providers?: Provider[];
}

/**
 * A schema definition associated with an NgModule.
 * 
 * @see `@NgModule`, `CUSTOM_ELEMENTS_SCHEMA`, `NO_ERRORS_SCHEMA`
 * 
 * @param name The name of a defined schema.
 *
 * @experimental
 */
export interface SchemaMetadata { name: string; }

/**
 * Defines a schema that allows an NgModule to contain the following:
 * - Non-Angular elements named with dash case (`-`).
 * - Element properties named with dash case (`-`).
 * Dash case is the naming convention for custom elements.
 *
 *
 */
export const CUSTOM_ELEMENTS_SCHEMA: SchemaMetadata = {
  name: 'custom-elements'
};

/**
 * Defines a schema that allows any property on any element.
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
   * Marks a class as an NgModule and supplies configuration metadata.
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
   * The set of injectable objects that are available in the injector
   * of this module.
   *
   * @usageNotes
   *
   * The following example defines a class that is injected in
   * the HelloWorld NgModule:
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
   * The set of directives and pipes that belong to this module.
   *
   * @usageNotes
   *
   * The following example allows the CommonModule to use the `NgFor`
   * directive.
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
   * The set of NgModules, with or without providers,
   * whose exported directives/pipes
   * are available to templates in this module.
   *
   * @usageNotes
   *
   * The following example allows MainModule to use CommonModule:
   *
   * ```javascript
   * @NgModule({
   *   imports: [CommonModule]
   * })
   * class MainModule {
   * }
   * ```
   *  @see {@link ModuleWithProviders}
   */
  imports?: Array<Type<any>|ModuleWithProviders|any[]>;

  /**
   * The set of directives, pipe, and NgModules that can be used
   * within the template of any component that is part of an
   * NgModule that imports this NgModule.
   *
   * @usageNotes
   *
   * The following example exports the `NgFor` directive from CommonModule.
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
   * The set of components to compile when this NgModule is defined.
   * For each component listed here, Angular creates a `ComponentFactory`
   * and stores it in the `ComponentFactoryResolver`.
   */
  entryComponents?: Array<Type<any>|any[]>;

  /**
   * The set of components that are bootstrapped when
   * this module is bootstrapped. The components listed here
   * are automatically added to `entryComponents`.
   */
  bootstrap?: Array<Type<any>|any[]>;

  /**
   * The set of schemas that declare elements to be allowed in the NgModule.
   * Elements and properties that are neither Angular components nor directives
   * must be declared in a schema.
   *
   * Allowed value are `NO_ERRORS_SCHEMA` and `CUSTOM_ELEMENTS_SCHEMA`.
   *
   * @security When using one of `NO_ERRORS_SCHEMA` or `CUSTOM_ELEMENTS_SCHEMA`
   * you must ensure that allowed elements and properties securely escape inputs.
   */
  schemas?: Array<SchemaMetadata|any[]>;

  /**
   * A name or path that uniquely identifies this NgModule in `getModuleFactory`.
   * If left `undefined`, the NgModule is not registered with
   * `getModuleFactory`.
   */
  id?: string;
}

/**
 * @Annotation
 */
export const NgModule: NgModuleDecorator = makeDecorator(
    'NgModule', (ngModule: NgModule) => ngModule, undefined, undefined,
    /**
     * Decorator that marks the following class as an NgModule, and supplies
     * configuration metadata for it.
     */
    (moduleType: InjectorType<any>, metadata: NgModule) => {
      let imports = (metadata && metadata.imports) || [];
      if (metadata && metadata.exports) {
        imports = [...imports, metadata.exports];
      }

      moduleType.ngInjectorDef = defineInjector({
        factory: convertInjectableProviderToFactory(moduleType, {useClass: moduleType}),
        providers: metadata && metadata.providers,
        imports: imports,
      });
    });
