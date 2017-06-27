/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {APP_INITIALIZER, ApplicationRef, InjectionToken, ModuleWithProviders, NgModule} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {filter as op_filter} from 'rxjs/operator/filter';
import {take as op_take} from 'rxjs/operator/take';
import {toPromise as op_toPromise} from 'rxjs/operator/toPromise';

import {NgswDebug} from './debug';
import {NgswCommChannel} from './low_level';
import {NgswPush} from './push';
import {NgswUpdate} from './update';

export function ngswAppInitializer(
    app: ApplicationRef, script: string, options: RegistrationOptions): Function {
  return () => {
    if (!('serviceWorker' in navigator)) {
      return;
    }
    const onStable =
        op_filter.call(app.isStable, (stable: boolean) => !!stable) as Observable<boolean>;
    const isStable = op_take.call(onStable, 1) as Observable<boolean>;
    const whenStable = op_toPromise.call(isStable) as Promise<boolean>;
    return whenStable.then(() => navigator.serviceWorker.register(script, options))
        .then(() => undefined) as Promise<void>;
  }
}

const SCRIPT = new InjectionToken<string>('NGSW_REGISTER_SCRIPT');
const OPTS = new InjectionToken<object>('NGSW_REGISTER_OPTIONS');

/**
 * @experimental
 */
@NgModule({
  providers: [NgswCommChannel, NgswDebug, NgswPush, NgswUpdate],
})
export class NgswModule {
  static register(script: string, opts?: RegistrationOptions): ModuleWithProviders {
    return {
      ngModule: NgswModule,
      providers: [
        {provide: SCRIPT, useValue: script},
        {provide: OPTS, useValue: opts || {}},
        {
          provide: APP_INITIALIZER,
          useFactory: ngswAppInitializer,
          deps: [SCRIPT, OPTS, ApplicationRef],
          multi: true,
        },
      ],
    };
  }
}
