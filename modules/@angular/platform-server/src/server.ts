/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {PlatformLocation} from '@angular/common';
import {analyzeAppProvidersForDeprecatedConfiguration, coreDynamicPlatform} from '@angular/compiler';
import {ApplicationRef, CompilerFactory, ComponentRef, NgModule, OpaqueToken, PLATFORM_COMMON_PROVIDERS, PLATFORM_INITIALIZER, PlatformRef, ReflectiveInjector, Type, assertPlatform, bootstrapModule, corePlatform, createPlatform, createPlatformFactory, getPlatform} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {Console, ReflectionCapabilities, reflector, wtfInit} from '../core_private';

import {ConcreteType} from './facade/lang';
import {Parse5DomAdapter} from './parse5_adapter';

function notSupported(feature: string): Error {
  throw new Error(`platform-server does not support '${feature}'.`);
}

class ServerPlatformLocation extends PlatformLocation {
  getBaseHrefFromDOM(): string { throw notSupported('getBaseHrefFromDOM'); };
  onPopState(fn: any): void { notSupported('onPopState'); };
  onHashChange(fn: any): void { notSupported('onHashChange'); };
  get pathname(): string { throw notSupported('pathname'); }
  get search(): string { throw notSupported('search'); }
  get hash(): string { throw notSupported('hash'); }
  replaceState(state: any, title: string, url: string): void { notSupported('replaceState'); };
  pushState(state: any, title: string, url: string): void { notSupported('pushState'); };
  forward(): void { notSupported('forward'); };
  back(): void { notSupported('back'); };
}

export const INTERNAL_SERVER_PLATFORM_PROVIDERS: Array<any /*Type | Provider | any[]*/> = [
  {provide: PLATFORM_INITIALIZER, useValue: initParse5Adapter, multi: true},
  {provide: PlatformLocation, useClass: ServerPlatformLocation},
];


/**
 * A set of providers to initialize the Angular platform in a server.
 *
 * Used automatically by `serverBootstrap`, or can be passed to `platform`.
 * @deprecated Use `serverPlatform()` or create a custom platform factory via
 * `createPlatformFactory(serverPlatform, ...)`
 */
export const SERVER_PLATFORM_PROVIDERS: Array<any /*Type | Provider | any[]*/> =
    [PLATFORM_COMMON_PROVIDERS, INTERNAL_SERVER_PLATFORM_PROVIDERS];

function initParse5Adapter() {
  Parse5DomAdapter.makeCurrent();
  wtfInit();
}

/**
 * @experimental
 */
export const serverPlatform =
    createPlatformFactory(corePlatform, 'server', INTERNAL_SERVER_PLATFORM_PROVIDERS);

/**
 * The server platform that supports the runtime compiler.
 *
 * @experimental
 */
export const serverDynamicPlatform =
    createPlatformFactory(coreDynamicPlatform, 'serverDynamic', INTERNAL_SERVER_PLATFORM_PROVIDERS);

/**
 * Used to bootstrap Angular in server environment (such as node).
 *
 * This version of bootstrap only creates platform injector and does not define anything for
 * application injector. It is expected that application providers are imported from other
 * packages such as `@angular/platform-browser` or `@angular/platform-browser-dynamic`.
 *
 * ```
 * import {BROWSER_APP_PROVIDERS} from '@angular/platform-browser';
 * import {BROWSER_APP_COMPILER_PROVIDERS} from '@angular/platform-browser-dynamic';
 *
 * serverBootstrap(..., [BROWSER_APP_PROVIDERS, BROWSER_APP_COMPILER_PROVIDERS])
 * ```
 *
 * @deprecated create an {@link NgModule} and use {@link bootstrapModule} with the {@link
 * serverDynamicPlatform}()
 * instead.
 */
export function serverBootstrap<T>(
    appComponentType: ConcreteType<T>,
    customProviders: Array<any /*Type | Provider | any[]*/>): Promise<ComponentRef<T>> {
  console.warn(
      'serverBootstrap is deprecated. Create an @NgModule and use `bootstrapModule` with the `serverDynamicPlatform()` instead.');
  reflector.reflectionCapabilities = new ReflectionCapabilities();

  const deprecatedConfiguration = analyzeAppProvidersForDeprecatedConfiguration(customProviders);
  const declarations = [deprecatedConfiguration.moduleDeclarations.concat([appComponentType])];

  @NgModule({
    providers: customProviders,
    declarations: declarations,
    imports: [BrowserModule],
    entryComponents: [appComponentType]
  })
  class DynamicModule {
  }

  return bootstrapModule(
             DynamicModule, serverDynamicPlatform(), deprecatedConfiguration.compilerOptions)
      .then((moduleRef) => {
        const console = moduleRef.injector.get(Console);
        deprecatedConfiguration.deprecationMessages.forEach((msg) => console.warn(msg));
        const appRef: ApplicationRef = moduleRef.injector.get(ApplicationRef);
        return appRef.bootstrap(appComponentType);
      });
}
