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
  GLOBAL_EVENT_DELEGATION,
  GlobalEventDelegation,
  JSACTION_EVENT_CONTRACT,
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
        const eventContractDetails = injector.get(JSACTION_EVENT_CONTRACT);
        initGlobalEventDelegation(eventContractDetails, injector);
        setStashFn(sharedStashFunction);
      },
      multi: true,
    },
    {
      provide: GLOBAL_EVENT_DELEGATION,
      useClass: GlobalEventDelegation,
    },
  ];
}
