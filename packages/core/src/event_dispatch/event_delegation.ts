/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {EventContract} from '@angular/core/primitives/event-dispatch';
import {ENVIRONMENT_INITIALIZER, Injector} from '../di';
import {inject} from '../di/injector_compatibility';
import {Provider} from '../di/interface/provider';
import {
  GLOBAL_EVENT_DELEGATION,
  GlobalEventDelegation,
  JSACTION_EVENT_CONTRACT,
  initGlobalEventDelegation,
} from '../event_delegation_utils';

import {IS_GLOBAL_EVENT_DELEGATION_ENABLED} from '../hydration/tokens';

declare global {
  interface Window {
    __jsaction_contract: EventContract | undefined;
  }
}

/**
 * Returns a set of providers required to setup support for event delegation.
 * @param multiContract - Experimental support to provide one event contract
 * when there are multiple binaries on the page.
 */
export function provideGlobalEventDelegation(multiContract = false): Provider[] {
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
        if (multiContract && window.__jsaction_contract) {
          eventContractDetails.instance = window.__jsaction_contract;
          return;
        }
        initGlobalEventDelegation(eventContractDetails, injector);
        window.__jsaction_contract = eventContractDetails.instance;
      },
      multi: true,
    },
    {
      provide: GLOBAL_EVENT_DELEGATION,
      useClass: GlobalEventDelegation,
    },
  ];
}
