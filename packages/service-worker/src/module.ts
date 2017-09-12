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

export const SCRIPT = new InjectionToken<string>('NGSW_REGISTER_SCRIPT');
export const OPTS = new InjectionToken<Object>('NGSW_REGISTER_OPTIONS');

export function ngswAppInitializer(
    injector: Injector, script: string, options: RegistrationOptions): Function {
  const initializer = () => {
    const app = injector.get<ApplicationRef>(ApplicationRef);
    if (!('serviceWorker' in navigator)) {
      return;
    }
    const onStable =
        op_filter.call(app.isStable, (stable: boolean) => !!stable) as Observable<boolean>;
    const isStable = op_take.call(onStable, 1) as Observable<boolean>;
    const whenStable = op_toPromise.call(isStable) as Promise<boolean>;
    return whenStable.then(() => navigator.serviceWorker.register(script, options))
        .then(() => undefined) as Promise<void>;
  };
  return initializer;
}

export function ngswCommChannelFactory(): NgswCommChannel {
  return new NgswCommChannel(navigator.serviceWorker);
}

/**
 * @experimental
 */
@NgModule({
  providers: [SwPush, SwUpdate],
})
export class ServiceWorkerModule {
  static register(script: string, opts: RegistrationOptions = {}): ModuleWithProviders {
    return {
      ngModule: ServiceWorkerModule,
      providers: [
        {provide: SCRIPT, useValue: script},
        {provide: OPTS, useValue: opts},
        {provide: NgswCommChannel, useFactory: ngswCommChannelFactory},
        {
          provide: APP_INITIALIZER,
          useFactory: ngswAppInitializer,
          deps: [Injector, SCRIPT, OPTS],
          multi: true,
        },
      ],
    };
  }
}