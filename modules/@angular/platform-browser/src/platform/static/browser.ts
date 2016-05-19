import {
  ComponentRef,
  coreLoadAndBootstrap,
  ReflectiveInjector
} from '@angular/core';
import {Type, isPresent} from '../../facade/lang';
import {
  BROWSER_APP_COMMON_PROVIDERS,
  browserPlatform
} from '../common/browser';

/**
 * An array of providers that should be passed into `application()` when bootstrapping a component
 * when all templates have been pre-compiled.
 */
export const BROWSER_APP_STATIC_PROVIDERS: Array<any /*Type | Provider | any[]*/> =
    /*@ts2dart_const*/ BROWSER_APP_COMMON_PROVIDERS;

/**
 * See {@link bootstrap} for more information.
 */
export function bootstrapStatic(appComponentType: Type,
                                customProviders?: Array<any /*Type | Provider | any[]*/>,
                                initReflector?: Function): Promise<ComponentRef<any>> {
  if (isPresent(initReflector)) {
    initReflector();
  }

  let appProviders = isPresent(customProviders) ? [BROWSER_APP_STATIC_PROVIDERS, customProviders] :
                                                  BROWSER_APP_STATIC_PROVIDERS;
  var appInjector =
      ReflectiveInjector.resolveAndCreate(appProviders, browserPlatform().injector);
  return coreLoadAndBootstrap(appInjector, appComponentType);
}
