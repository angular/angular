/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ENVIRONMENT_INITIALIZER, Injector} from '../di';
import {inject} from '../di/injector_compatibility';
import {Provider} from '../di/interface/provider';
import {setStashFn} from '../render3/instructions/listener';
import {
  EnabledGlobalEventDelegation,
  GlobalEventDelegation,
  initGlobalEventDelegation,
  sharedStashFunction,
} from '../event_delegation_utils';

import {IS_GLOBAL_EVENT_DELEGATION_ENABLED} from '../hydration/tokens';

/**
 * Returns a set of providers required to setup support for event delegation.
 */
export function provideGlobalEventDelegation(): Provider[] {
  return [
    {
      provide: IS_GLOBAL_EVENT_DELEGATION_ENABLED,
      useValue: true,
    },
    {
      provide: ENVIRONMENT_INITIALIZER,
      useValue: () => {
        const injector = inject(Injector);
        const globalEventDelegation = injector.get(GlobalEventDelegation);
        initGlobalEventDelegation(globalEventDelegation, injector);
        setStashFn(sharedStashFunction);
      },
      multi: true,
    },
    {
      provide: GlobalEventDelegation,
      useClass: EnabledGlobalEventDelegation,
    },
  ];
}
