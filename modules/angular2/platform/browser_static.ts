export {AngularEntrypoint} from 'angular2/src/core/angular_entrypoint';
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

import {Type, isPresent, isBlank} from 'angular2/src/facade/lang';
import {
  BROWSER_PROVIDERS,
  BROWSER_APP_COMMON_PROVIDERS
} from 'angular2/src/platform/browser_common';
import {
  ComponentRef,
  basicLoadAndBootstrap,
  ReflectiveInjector,
  Compiler,
  PlatformRef
} from 'angular2/core';

/**
 * An array of providers that should be passed into `application()` when bootstrapping a component
 * when all templates
 * have been precompiled offline.
 */
export const BROWSER_APP_PROVIDERS: Array<any /*Type | Provider | any[]*/> =
    BROWSER_APP_COMMON_PROVIDERS;

var _platform: PlatformRef = null;

export function browserStaticPlatform(): PlatformRef {
  if (isBlank(_platform) || _platform.disposed) {
    _platform = ReflectiveInjector.resolveAndCreate(BROWSER_PROVIDERS).get(PlatformRef);
  }
  return _platform;
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
  return basicLoadAndBootstrap(appInjector, appComponentType);
}
