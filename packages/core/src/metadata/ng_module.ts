/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {EnvironmentProviders, ModuleWithProviders, Provider} from '../di/interface/provider';
import {Type} from '../interface/type';
import {SchemaMetadata} from '../metadata/schema';
import {compileNgModule} from '../render3/jit/module';
import {makeDecorator, TypeDecorator} from '../util/decorators';

/**
 * Type of the NgModule decorator / constructor function.
 *
 * @publicApi
 */
export interface NgModuleDecorator {
  /**
   * Decorator that marks a class as an NgModule and supplies configuration metadata.
   */
  (obj?: NgModule): TypeDecorator;
  new (obj?: NgModule): NgModule;
}

/**
 * Type of the NgModule metadata.
 *
 * @publicApi
 */
export interface NgModule {
  /**
   * The set of injectable objects that are available in the injector
   * of this module.
   *
   * @see [Dependency Injection guide](guide/di/dependency-injection
   * @see [NgModule guide](guide/ngmodules/providers)
   *
   * @usageNotes
   *
   * Dependencies whose providers are listed here become available for injection
   * into any component, directive, pipe or service that is a child of this injector.
   * The NgModule used for bootstrapping uses the root injector, and can provide dependencies
   * to any part of the app.
   *
   * A lazy-loaded module has its own injector, typically a child of the app root injector.
   * Lazy-loaded services are scoped to the lazy-loaded module's injector.
   * If a lazy-loaded module also provides the `UserService`, any component created
   * within that module's context (such as by router navigation) gets the local instance
   * of the service, not the instance in the root injector.
   * Components in external modules continue to receive the instance provided by their injectors.
   *
   * ### Example
   *
   * The following example defines a class that is injected in
   * the HelloWorld NgModule:
   *
   * ```ts
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
  providers?: Array<Provider | EnvironmentProviders>;

  /**
   * The set of components, directives, and pipes (declarables
   * that belong to this module.
   *
   * @usageNotes
   *
   * The set of selectors that are available to a template include those declared here, and
   * those that are exported from imported NgModules.
   *
   * Declarables must belong to exactly one module.
   * The compiler emits an error if you try to declare the same class in more than one module.
   * Be careful not to declare a class that is imported from another module.
   *
   * ### Example
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
  declarations?: Array<Type<any> | any[]>;

  /**
   * The set of NgModules whose exported declarables
   * are available to templates in this module.
   *
   * @usageNotes
   *
   * A template can use exported declarables from any
   * imported module, including those from modules that are imported indirectly
   * and re-exported.
   * For example, `ModuleA` imports `ModuleB`, and also exports
   * it, which makes the declarables from `ModuleB` available
   * wherever `ModuleA` is imported.
   *
   * ### Example
   *
   * The following example allows MainModule to use anything exported by
   * `CommonModule`:
   *
   * ```javascript
   * @NgModule({
   *   imports: [CommonModule]
   * })
   * class MainModule {
   * }
   * ```
   *
   */
  imports?: Array<Type<any> | ModuleWithProviders<{}> | any[]>;

  /**
   * The set of components, directives, and pipes declared in this
   * NgModule that can be used in the template of any component that is part of an
   * NgModule that imports this NgModule. Exported declarations are the module's public API.
   *
   * A declarable belongs to one and only one NgModule.
   * A module can list another module among its exports, in which case all of that module's
   * public declaration are exported.
   *
   * @usageNotes
   *
   * Declarations are private by default.
   * If this ModuleA does not export UserComponent, then only the components within this
   * ModuleA can use UserComponent.
   *
   * ModuleA can import ModuleB and also export it, making exports from ModuleB
   * available to an NgModule that imports ModuleA.
   *
   * ### Example
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
  exports?: Array<Type<any> | any[]>;

  /**
   * The set of components that are bootstrapped when this module is bootstrapped.
   */
  bootstrap?: Array<Type<any> | any[]>;

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
  schemas?: Array<SchemaMetadata | any[]>;

  /**
   * A name or path that uniquely identifies this NgModule in `getNgModuleById`.
   * If left `undefined`, the NgModule is not registered with `getNgModuleById`.
   */
  id?: string;

  /**
   * When present, this module is ignored by the AOT compiler.
   * It remains in distributed code, and the JIT compiler attempts to compile it
   * at run time, in the browser.
   * To ensure the correct behavior, the app must import `@angular/compiler`.
   */
  jit?: true;
}

/**
 * @Annotation
 */
export const NgModule: NgModuleDecorator = makeDecorator(
  'NgModule',
  (ngModule: NgModule) => ngModule,
  undefined,
  undefined,
  /**
   * Decorator that marks the following class as an NgModule, and supplies
   * configuration metadata for it.
   *
   * * The `declarations` option configures the compiler
   * with information about what belongs to the NgModule.
   * * The `providers` options configures the NgModule's injector to provide
   * dependencies the NgModule members.
   * * The `imports` and `exports` options bring in members from other modules, and make
   * this module's members available to others.
   */
  (type: Type<any>, meta: NgModule) => compileNgModule(type, meta),
);
