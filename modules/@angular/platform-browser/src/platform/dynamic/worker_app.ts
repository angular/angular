import {WORKER_APP_STATIC_APPLICATION_PROVIDERS} from '../static/worker_app';
import {workerAppPlatform} from '../common/worker_app';
import {COMPILER_PROVIDERS, XHR} from '@angular/compiler';
import {XHRImpl} from '../../xhr/xhr_impl';
import {isPresent} from '../../facade/lang';

import {
  Type,
  ComponentRef,
  ReflectiveInjector,
  coreLoadAndBootstrap,
} from '@angular/core';

export const WORKER_APP_APPLICATION_PROVIDERS: Array<any /*Type | Provider | any[]*/> = [
  WORKER_APP_STATIC_APPLICATION_PROVIDERS,
  COMPILER_PROVIDERS,
  /* @ts2dart_Provider */ {provide: XHR, useClass: XHRImpl},
];

export function bootstrapApp(
    appComponentType: Type,
    customProviders?: Array<any /*Type | Provider | any[]*/>): Promise<ComponentRef<any>> {
  var appInjector = ReflectiveInjector.resolveAndCreate(
      [WORKER_APP_APPLICATION_PROVIDERS, isPresent(customProviders) ? customProviders : []],
      workerAppPlatform().injector);
  return coreLoadAndBootstrap(appComponentType, appInjector);
}
