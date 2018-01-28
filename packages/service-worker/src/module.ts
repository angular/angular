/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {isPlatformBrowser} from '@angular/common';
import {APP_INITIALIZER, ApplicationRef, InjectionToken, Injector, ModuleWithProviders, NgModule, PLATFORM_ID} from '@angular/core';
import {Observable} from 'rxjs';
import {filter, take} from 'rxjs/operators';

import {NgswCommChannel} from './low_level';
import {SwPush} from './push';
import {SwUpdate} from './update';

/**
 * Token that can be used to provide options for `ServiceWorkerModule` outside of
 * `ServiceWorkerModule.register()`.
 *
 * You can use this token to define a provider that generates the registration options at runtime,
 * for example via a function call:
 *
 * {@example service-worker/registration-options/module.ts region="registration-options"
 *     header="app.module.ts" linenums="false"}
 *
 * @publicApi
 */
export abstract class SwRegistrationOptions {
  /**
   * Whether the ServiceWorker will be registered and the related services (such as `SwPush` and
   * `SwUpdate`) will attempt to communicate and interact with it.
   *
   * Default: true
   */
  enabled?: boolean;

  /**
   * A URL that defines the ServiceWorker's registration scope; that is, what range of URLs it can
   * control. It will be used when calling
   * [ServiceWorkerContainer#register()](https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerContainer/register).
   */
  scope?: string;

  registrationStrategy?: (() => Observable<any>)|string;
}

export const SCRIPT = new InjectionToken<string>('NGSW_REGISTER_SCRIPT');

export function ngswAppInitializer(
    injector: Injector, script: string, options: SwRegistrationOptions,
    platformId: string): Function {
  const initializer = () => {
    const app = injector.get<ApplicationRef>(ApplicationRef);
    if (!(isPlatformBrowser(platformId) && ('serviceWorker' in navigator) &&
          options.enabled !== false)) {
      return;
    }
    const whenStable =
        app.isStable.pipe(filter((stable: boolean) => !!stable), take(1)).toPromise();

    // Wait for service worker controller changes, and fire an INITIALIZE action when a new SW
    // becomes active. This allows the SW to initialize itself even if there is no application
    // traffic.
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (navigator.serviceWorker.controller !== null) {
        navigator.serviceWorker.controller.postMessage({action: 'INITIALIZE'});
      }
    });

    // Don't return the Promise, as that will block the application until the SW is registered, and
    // cause a crash if the SW registration fails.
    if (typeof options.registrationStrategy === 'function') {
      const observable = options.registrationStrategy();
      const subscription = observable.subscribe(() => {
        navigator.serviceWorker.register(script, {scope: options.scope});
        subscription.unsubscribe();
      });
    } else {
      const registrationStrategy = typeof options.registrationStrategy === 'string' ?
          options.registrationStrategy :
          'registerWhenStable';
      if (registrationStrategy === 'registerWhenStable') {
        whenStable.then(() => navigator.serviceWorker.register(script, {scope: options.scope}));
      } else if (registrationStrategy === 'registerImmediately') {
        navigator.serviceWorker.register(script, {scope: options.scope});
      } else if (registrationStrategy.indexOf('registerDelay') !== -1) {
        const split = registrationStrategy.split(':');
        const delayStr = split.length > 1 ? split[1] : undefined;
        const delay = Number(delayStr);
        setTimeout(
            () => navigator.serviceWorker.register(script, {scope: options.scope}),
            typeof delay === 'number' ? delay : 0);
      } else {
        // wrong strategy
        throw new Error(
            `Unknown service worker registration strategy: ${options.registrationStrategy}`);
      }
    }
  };
  return initializer;
}

export function ngswCommChannelFactory(
    opts: SwRegistrationOptions, platformId: string): NgswCommChannel {
  return new NgswCommChannel(
      isPlatformBrowser(platformId) && opts.enabled !== false ? navigator.serviceWorker :
                                                                undefined);
}

/**
 * @publicApi
 */
@NgModule({
  providers: [SwPush, SwUpdate],
})
export class ServiceWorkerModule {
  /**
   * Register the given Angular Service Worker script.
   *
   * If `enabled` is set to `false` in the given options, the module will behave as if service
   * workers are not supported by the browser, and the service worker will not be registered.
   */
  static register(script: string, opts: SwRegistrationOptions = {}):
      ModuleWithProviders<ServiceWorkerModule> {
    return {
      ngModule: ServiceWorkerModule,
      providers: [
        {provide: SCRIPT, useValue: script},
        {provide: SwRegistrationOptions, useValue: opts},
        {
          provide: NgswCommChannel,
          useFactory: ngswCommChannelFactory,
          deps: [SwRegistrationOptions, PLATFORM_ID]
        },
        {
          provide: APP_INITIALIZER,
          useFactory: ngswAppInitializer,
          deps: [Injector, SCRIPT, SwRegistrationOptions, PLATFORM_ID],
          multi: true,
        },
      ],
    };
  }
}
