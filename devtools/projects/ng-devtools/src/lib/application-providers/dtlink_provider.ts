/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {DestroyRef, inject, InjectionToken, Provider} from '@angular/core';
import {MessageBus} from '../../../../protocol';
import {DtLinkInitiator} from '../../../../shared-utils';
import {BackendDtLinkApi} from '../../../../ng-devtools-backend/types';

type BeDtLink = DtLinkInitiator<BackendDtLinkApi>;

export const DTLINK = new InjectionToken<BeDtLink>('DTLINK');

/**
 * Provides a `DtLink` instance, using the `DTLINK` injection token,
 * which enables remote calls to the backend.
 *
 * The provider expects a ready-to-use `MessageBus`.
 */
export function provideDtLink(): Provider {
  return {
    provide: DTLINK,
    useFactory: () => {
      const messageBus = inject(MessageBus);
      const dtLink = new DtLinkInitiator<BackendDtLinkApi>(messageBus);

      inject(DestroyRef).onDestroy(() => {
        dtLink.destroy();
      });

      return dtLink;
    },
  };
}
