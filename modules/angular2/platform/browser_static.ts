export * from 'angular2/src/core/angular_entrypoint';
export {
  BROWSER_PROVIDERS,
  ELEMENT_PROBE_PROVIDERS,
  ELEMENT_PROBE_PROVIDERS_PROD_MODE,
  inspectNativeElement,
  BrowserDomAdapter,
  By,
  Title,
  enableDebugTools,
  disableDebugTools
} from 'angular2/src/platform/browser_common';

import {Type, isPresent, isBlank, CONST_EXPR} from 'angular2/src/facade/lang';
import {
  BROWSER_APP_COMMON_PROVIDERS,
  BROWSER_PLATFORM_MARKER,
  createInitDomAdapter
} from 'angular2/src/platform/browser_common';
import {
  ComponentRef,
  coreLoadAndBootstrap,
  ReflectiveInjector,
  PlatformRef,
  getPlatform,
  createPlatform,
  assertPlatform,
  PLATFORM_INITIALIZER,
  MapInjector
} from 'angular2/core';

import {PlatformRef_} from 'angular2/src/core/application_ref';
import {Reflector, reflector} from 'angular2/src/core/reflection/reflection';
import {ReflectorReader} from 'angular2/src/core/reflection/reflector_reader';
import {TestabilityRegistry} from 'angular2/src/core/testability/testability';
import {Console} from 'angular2/src/core/console';

/**
 * An array of providers that should be passed into `application()` when bootstrapping a component
 * when all templates
 * have been precompiled offline.
 */
export const BROWSER_APP_PROVIDERS: Array<any /*Type | Provider | any[]*/> =
    CONST_EXPR([BROWSER_APP_COMMON_PROVIDERS]);

export function browserStaticPlatform(): PlatformRef {
  if (isBlank(getPlatform())) {
    var tokens = new Map<any, any>();
    var platform = new PlatformRef_();
    tokens.set(PlatformRef, platform);
    tokens.set(PlatformRef_, platform);
    tokens.set(Reflector, reflector);
    tokens.set(ReflectorReader, reflector);
    var testabilityRegistry = new TestabilityRegistry();
    tokens.set(TestabilityRegistry, testabilityRegistry);
    tokens.set(Console, new Console());
    tokens.set(BROWSER_PLATFORM_MARKER, true);
    tokens.set(PLATFORM_INITIALIZER, [createInitDomAdapter(testabilityRegistry)]);
    createPlatform(new MapInjector(null, tokens));
  }
  return assertPlatform(BROWSER_PLATFORM_MARKER);
}

/**
 * See {@link bootstrap} for more information.
 */
export function bootstrapStatic(appComponentType: Type,
                                customProviders?: Array<any /*Type | Provider | any[]*/>,
                                initReflector?: Function): Promise<ComponentRef> {
  if (isPresent(initReflector)) {
    initReflector();
  }

  let appProviders =
      isPresent(customProviders) ? [BROWSER_APP_PROVIDERS, customProviders] : BROWSER_APP_PROVIDERS;
  var appInjector =
      ReflectiveInjector.resolveAndCreate(appProviders, browserStaticPlatform().injector);
  return coreLoadAndBootstrap(appInjector, appComponentType);
}
