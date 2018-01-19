/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {InjectorDef, InjectorDefType, Provider, StaticProvider, injectArgs} from '../di';
import {ClassProvider, ConstructorProvider, ExistingProvider, FactoryProvider, StaticClassProvider, TypeProvider, ValueProvider} from '../di/provider';
import {ReflectionCapabilities} from '../reflection/reflection_capabilities';
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

/**
 * NgModule decorator and metadata.
 *
 * @stable
 * @Annotation
 */
export const NgModule: NgModuleDecorator = makeDecorator(
    'NgModule', (ngModule: NgModule) => ngModule, undefined, undefined,
    (type: Type<any>, ngModule: NgModule) => {
      if (!ngModule) {
        // Make sure `@NgModule()` works
        ngModule = {};
      }
      const reflectionCapabilities = new ReflectionCapabilities();
      const deps = reflectionCapabilities.parameters(type);
      const providers: StaticProvider[] =
          convertStaticProviders(ngModule.providers, reflectionCapabilities);
      const imports = convertImports(ngModule.imports, reflectionCapabilities);
      (type as InjectorDefType<any>).ngInjectorDef = defineInjector({
        factory: () => new type(...injectArgs(deps)),
        providers: providers,
        imports: imports,
      });
    });

/**
 * Define injector
 *
 * @experimental
 */
export function defineInjector<T>(opts: InjectorDef<T>): InjectorDef<T> {
  return opts;
}

export function convertStaticProviders(
    moduleProviders: Provider[] | undefined,
    reflectionCapabilities: ReflectionCapabilities): StaticProvider[] {
  let providers: StaticProvider[] = [];
  if (moduleProviders) {
    moduleProviders.forEach(provider => {
      if (!provider) {
        // just ignore it
      } else if ((provider as ValueProvider).useValue) {
        providers.push(provider as ValueProvider);
      } else if ((provider as FactoryProvider).useFactory) {
        providers.push(provider as FactoryProvider);
      } else if ((provider as ExistingProvider).useExisting) {
        providers.push(provider as ExistingProvider);
      } else if ((provider as ClassProvider).useClass) {
        // Convert ClassProvider to StaticClassProvider
        const providerDeps = reflectionCapabilities.parameters((provider as ClassProvider).provide);
        providers.push({
          provide: (provider as ClassProvider).provide,
              useClass: (provider as ClassProvider).useClass, deps: providerDeps
        } as StaticClassProvider);
      } else if (provider instanceof Array) {
        providers.push(...convertStaticProviders(provider, reflectionCapabilities));
      } else {
        // Is TypeProvider
        const providerDeps = reflectionCapabilities.parameters(provider as TypeProvider);
        providers.push({ provide: provider, deps: providerDeps } as ConstructorProvider);
      }
    });
  }
  return providers;
}

export function convertImports(
    moduleImports: Array<Type<any>|ModuleWithProviders|any[]>| undefined,
    reflectionCapabilities: ReflectionCapabilities): InjectorDefType<any>[] {
  let imports: InjectorDefType<any>[] = [];
  if (moduleImports) {
    moduleImports.forEach(moduleImport => {
      if (!moduleImport) {
        // Just ignore it
      } else if (moduleImport instanceof Array) {
        imports.push(...convertImports(moduleImport, reflectionCapabilities));
      } else if ((moduleImport as InjectorDefType<any>).ngInjectorDef) {
        imports.push(moduleImport as InjectorDefType<any>);
      } else if ((moduleImport as ModuleWithProviders).ngModule) {
        const typeName = (moduleImport as ModuleWithProviders).ngModule;
        if ((typeName as InjectorDefType<any>).ngInjectorDef) {
          imports.push((moduleImport as ModuleWithProviders).ngModule as InjectorDefType<any>);
        }
      }
    });
  }
  return imports;
}
