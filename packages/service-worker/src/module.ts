/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {isPlatformBrowser} from '@angular/common';
import {APP_INITIALIZER, ApplicationRef, InjectionToken, Injector, ModuleWithProviders, NgModule, PLATFORM_ID} from '@angular/core';
import {filter, take} from 'rxjs/operators';

import {NgswCommChannel} from './low_level';
import {SwPush} from './push';
import {SwUpdate} from './update';

export abstract class RegistrationOptions {
  scope?: string;
  enabled?: boolean;
}

export const SCRIPT = new InjectionToken<string>('NGSW_REGISTER_SCRIPT');

export function ngswAppInitializer(
    injector: Injector, script: string, options: RegistrationOptions,
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
    whenStable.then(() => navigator.serviceWorker.register(script, {scope: options.scope}));
  };
  return initializer;
}

export function ngswCommChannelFactory(
    opts: RegistrationOptions, platformId: string): NgswCommChannel {
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
  static register(script: string, opts: {scope?: string; enabled?: boolean;} = {}):
      ModuleWithProviders<ServiceWorkerModule> {
    return {
      ngModule: ServiceWorkerModule,
      providers: [
        {provide: SCRIPT, useValue: script},
        {provide: RegistrationOptions, useValue: opts},
        {
          provide: NgswCommChannel,
          useFactory: ngswCommChannelFactory,
          deps: [RegistrationOptions, PLATFORM_ID]
        },
        {
          provide: APP_INITIALIZER,
          useFactory: ngswAppInitializer,
          deps: [Injector, SCRIPT, RegistrationOptions, PLATFORM_ID],
          multi: true,
        },
      ],
    };
  }
}
