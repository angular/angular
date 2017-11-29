/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {APP_INITIALIZER, ApplicationRef, Inject, InjectionToken, Injector, ModuleWithProviders, NgModule} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {filter as op_filter} from 'rxjs/operator/filter';
import {take as op_take} from 'rxjs/operator/take';
import {toPromise as op_toPromise} from 'rxjs/operator/toPromise';

import {NgswCommChannel} from './low_level';
import {SwPush} from './push';
import {SwUpdate} from './update';

export abstract class RegistrationOptions {
  scope?: string;
  enabled?: boolean;
}

export const SCRIPT = new InjectionToken<string>('NGSW_REGISTER_SCRIPT');

export function ngswAppInitializer(
    injector: Injector, script: string, options: RegistrationOptions): Function {
  const initializer = () => {
    const app = injector.get<ApplicationRef>(ApplicationRef);
    if (!('serviceWorker' in navigator) || options.enabled === false) {
      return;
    }
    const onStable =
        op_filter.call(app.isStable, (stable: boolean) => !!stable) as Observable<boolean>;
    const isStable = op_take.call(onStable, 1) as Observable<boolean>;
    const whenStable = op_toPromise.call(isStable) as Promise<boolean>;

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

export function ngswCommChannelFactory(opts: RegistrationOptions): NgswCommChannel {
  return new NgswCommChannel(opts.enabled !== false ? navigator.serviceWorker : undefined);
}

/**
 * @experimental
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
      ModuleWithProviders {
    return {
      ngModule: ServiceWorkerModule,
      providers: [
        {provide: SCRIPT, useValue: script},
        {provide: RegistrationOptions, useValue: opts},
        {provide: NgswCommChannel, useFactory: ngswCommChannelFactory, deps: [RegistrationOptions]},
        {
          provide: APP_INITIALIZER,
          useFactory: ngswAppInitializer,
          deps: [Injector, SCRIPT, RegistrationOptions],
          multi: true,
        },
      ],
    };
  }
}
