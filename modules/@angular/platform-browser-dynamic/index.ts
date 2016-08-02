/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {XHR, analyzeAppProvidersForDeprecatedConfiguration, platformCoreDynamic} from '@angular/compiler';
import {ApplicationRef, COMPILER_OPTIONS, Compiler, CompilerFactory, CompilerOptions, ComponentRef, ComponentResolver, ExceptionHandler, NgModule, NgModuleRef, OpaqueToken, PLATFORM_DIRECTIVES, PLATFORM_INITIALIZER, PLATFORM_PIPES, PlatformRef, ReflectiveInjector, SchemaMetadata, Type, assertPlatform, createPlatform, createPlatformFactory, getPlatform, isDevMode} from '@angular/core';
import {BROWSER_PLATFORM_PROVIDERS, BrowserModule, WORKER_APP_PLATFORM_PROVIDERS, WORKER_SCRIPT, WorkerAppModule, platformBrowser, platformWorkerApp, platformWorkerUi} from '@angular/platform-browser';

import {Console} from './core_private';
import {ConcreteType, isPresent, stringify} from './src/facade/lang';
import {INTERNAL_BROWSER_DYNAMIC_PLATFORM_PROVIDERS} from './src/platform_providers';
import {CachedXHR} from './src/xhr/xhr_cache';
import {XHRImpl} from './src/xhr/xhr_impl';



/**
 * @deprecated The compiler providers are already included in the {@link CompilerFactory} that is
 * contained the {@link browserDynamicPlatform}()`.
 */
export const BROWSER_APP_COMPILER_PROVIDERS: Array<any /*Type | Provider | any[]*/> = [];

/**
 * @experimental
 */
export const CACHED_TEMPLATE_PROVIDER: Array<any /*Type | Provider | any[]*/> =
    [{provide: XHR, useClass: CachedXHR}];

/**
 * @experimental API related to bootstrapping are still under review.
 */
export const platformBrowserDynamic = createPlatformFactory(
    platformCoreDynamic, 'browserDynamic', INTERNAL_BROWSER_DYNAMIC_PLATFORM_PROVIDERS);

/**
 * @deprecated Use {@link platformBrowserDynamic} instead
 */
export const browserDynamicPlatform = platformBrowserDynamic;

/**
 * Bootstrapping for Angular applications.
 *
 * You instantiate an Angular application by explicitly specifying a component to use
 * as the root component for your application via the `bootstrap()` method.
 *
 * ## Simple Example
 *
 * Assuming this `index.html`:
 *
 * ```html
 * <html>
 *   <!-- load Angular script tags here. -->
 *   <body>
 *     <my-app>loading...</my-app>
 *   </body>
 * </html>
 * ```
 *
 * An application is bootstrapped inside an existing browser DOM, typically `index.html`.
 * Unlike Angular 1, Angular 2 does not compile/process providers in `index.html`. This is
 * mainly for security reasons, as well as architectural changes in Angular 2. This means
 * that `index.html` can safely be processed using server-side technologies such as
 * providers. Bindings can thus use double-curly `{{ syntax }}` without collision from
 * Angular 2 component double-curly `{{ syntax }}`.
 *
 * We can use this script code:
 *
 * {@example core/ts/bootstrap/bootstrap.ts region='bootstrap'}
 *
 * When the app developer invokes `bootstrap()` with the root component `MyApp` as its
 * argument, Angular performs the following tasks:
 *
 *  1. It uses the component's `selector` property to locate the DOM element which needs
 *     to be upgraded into the angular component.
 *  2. It creates a new child injector (from the platform injector). Optionally, you can
 *     also override the injector configuration for an app by invoking `bootstrap` with the
 *     `componentInjectableBindings` argument.
 *  3. It creates a new `Zone` and connects it to the angular application's change detection
 *     domain instance.
 *  4. It creates an emulated or shadow DOM on the selected component's host element and loads the
 *     template into it.
 *  5. It instantiates the specified component.
 *  6. Finally, Angular performs change detection to apply the initial data providers for the
 *     application.
 *
 *
 * ## Bootstrapping Multiple Applications
 *
 * When working within a browser window, there are many singleton resources: cookies, title,
 * location, and others. Angular services that represent these resources must likewise be
 * shared across all Angular applications that occupy the same browser window. For this
 * reason, Angular creates exactly one global platform object which stores all shared
 * services, and each angular application injector has the platform injector as its parent.
 *
 * Each application has its own private injector as well. When there are multiple
 * applications on a page, Angular treats each application injector's services as private
 * to that application.
 *
 * ## API (version 1)
 *
 * - `appComponentType`: The root component which should act as the application. This is
 *   a reference to a `Type` which is annotated with `@Component(...)`.
 * - `customProviders`: An additional set of providers that can be added to the
 *   app injector to override default injection behavior.
 *
 * ## API (version 2)
 * - `appComponentType`: The root component which should act as the application. This is
 *   a reference to a `Type` which is annotated with `@Component(...)`.
 * - `providers`, `declarations`, `imports`, `entryComponents`: Defines the properties
 *   of the dynamically created module that is used to bootstrap the module.
 * - to configure the compiler, use the `compilerOptions` parameter.
 *
 * Returns a `Promise` of {@link ComponentRef}.
 *
 * @experimental This api cannot be used with the offline compiler and thus is still subject to
 * change.
 */
// Note: We are using typescript overloads here to have 2 function signatures!
export function bootstrap<C>(
    appComponentType: ConcreteType<C>,
    customProviders?: Array<any /*Type | Provider | any[]*/>): Promise<ComponentRef<C>>;
export function bootstrap<C>(
    appComponentType: ConcreteType<C>,
    {providers, imports, declarations, entryComponents, schemas, compilerOptions}?: {
      providers?: Array<any /*Type | Provider | any[]*/>,
      declarations?: any[],
      imports?: any[],
      entryComponents?: any[],
      schemas?: Array<SchemaMetadata|any[]>,
      compilerOptions?: CompilerOptions
    }): Promise<ComponentRef<C>>;
export function bootstrap<C>(
    appComponentType: ConcreteType<C>,
    customProvidersOrDynamicModule?: Array<any /*Type | Provider | any[]*/>| {
      providers: Array<any /*Type | Provider | any[]*/>,
      declarations?: any[],
      imports: any[],
      entryComponents: any[], schemas?: Array<SchemaMetadata|any[]>,
      compilerOptions: CompilerOptions
    }): Promise<ComponentRef<C>> {
  let compilerOptions: CompilerOptions;
  let providers: any[] = [];
  let declarations: any[] = [];
  let imports: any[] = [];
  let entryComponents: any[] = [];
  let deprecationMessages: string[] = [];
  let schemas: any[] = [];
  if (customProvidersOrDynamicModule instanceof Array) {
    providers = customProvidersOrDynamicModule;
    const deprecatedConfiguration = analyzeAppProvidersForDeprecatedConfiguration(providers);
    declarations = deprecatedConfiguration.moduleDeclarations.concat(declarations);
    compilerOptions = deprecatedConfiguration.compilerOptions;
    deprecationMessages = deprecatedConfiguration.deprecationMessages;
  } else if (customProvidersOrDynamicModule) {
    providers = normalizeArray(customProvidersOrDynamicModule.providers);
    declarations = normalizeArray(customProvidersOrDynamicModule.declarations);
    imports = normalizeArray(customProvidersOrDynamicModule.imports);
    entryComponents = normalizeArray(customProvidersOrDynamicModule.entryComponents);
    schemas = normalizeArray(customProvidersOrDynamicModule.schemas);
    compilerOptions = customProvidersOrDynamicModule.compilerOptions;
  }

  @NgModule({
    providers: providers,
    declarations: declarations.concat([appComponentType]),
    imports: [BrowserModule, imports],
    entryComponents: entryComponents,
    bootstrap: [appComponentType],
    schemas: schemas
  })
  class DynamicModule {
  }

  return platformBrowserDynamic()
      .bootstrapModule(DynamicModule, compilerOptions)
      .then((moduleRef) => {
        const console = moduleRef.injector.get(Console);
        deprecationMessages.forEach((msg) => console.warn(msg));
        const appRef: ApplicationRef = moduleRef.injector.get(ApplicationRef);
        return appRef.components[0];
      });
}

/**
 * Bootstraps the worker ui.
 *
 * @experimental
 */
export function bootstrapWorkerUi(
    workerScriptUri: string,
    customProviders: Array<any /*Type | Provider | any[]*/> = []): Promise<PlatformRef> {
  // For now, just creates the worker ui platform...
  return Promise.resolve(platformWorkerUi([{
                                            provide: WORKER_SCRIPT,
                                            useValue: workerScriptUri,
                                          }].concat(customProviders)));
}

/**
 * @experimental API related to bootstrapping are still under review.
 */
export const platformWorkerAppDynamic =
    createPlatformFactory(platformCoreDynamic, 'workerAppDynamic', [{
                            provide: COMPILER_OPTIONS,
                            useValue: {providers: [{provide: XHR, useClass: XHRImpl}]},
                            multi: true
                          }]);

/**
 * @deprecated Use {@link platformWorkerAppDynamic} instead
 */
export const workerAppDynamicPlatform = platformWorkerAppDynamic;

/**
 * @deprecated Create an {@link NgModule} that includes the {@link WorkerAppModule} and use {@link
 * bootstrapModule}
 * with the {@link workerAppDynamicPlatform}() instead.
 */
export function bootstrapWorkerApp<T>(
    appComponentType: ConcreteType<T>,
    customProviders?: Array<any /*Type | Provider | any[]*/>): Promise<ComponentRef<T>> {
  console.warn(
      'bootstrapWorkerApp is deprecated. Create an @NgModule that includes the `WorkerAppModule` and use `bootstrapModule` with the `workerAppDynamicPlatform()` instead.');

  const deprecatedConfiguration = analyzeAppProvidersForDeprecatedConfiguration(customProviders);
  const declarations = [deprecatedConfiguration.moduleDeclarations.concat([appComponentType])];

  @NgModule({
    providers: customProviders,
    declarations: declarations,
    imports: [WorkerAppModule],
    bootstrap: [appComponentType]
  })
  class DynamicModule {
  }

  return platformWorkerAppDynamic()
      .bootstrapModule(DynamicModule, deprecatedConfiguration.compilerOptions)
      .then((moduleRef) => {
        const console = moduleRef.injector.get(Console);
        deprecatedConfiguration.deprecationMessages.forEach((msg) => console.warn(msg));
        const appRef: ApplicationRef = moduleRef.injector.get(ApplicationRef);
        return appRef.components[0];
      });
}

function normalizeArray(arr: any[]): any[] {
  return arr ? arr : [];
}
