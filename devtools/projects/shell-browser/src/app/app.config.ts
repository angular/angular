/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ApplicationConfig, provideZonelessChangeDetection} from '@angular/core';
import {ApplicationEnvironment, ApplicationOperations, provideSettings} from '../../../ng-devtools';

import {ChromeApplicationEnvironment} from './chrome-application-environment';
import {ChromeApplicationOperations} from './chrome-application-operations';
import {Events, MessageBus, PriorityAwareMessageBus} from '../../../protocol';
import {FrameManager} from '../../../ng-devtools/src/lib/application-services/frame_manager';
import {ChromeMessageBus} from './chrome-message-bus';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    {provide: FrameManager, useFactory: () => FrameManager.initialize()},
    {
      provide: ApplicationOperations,
      useClass: ChromeApplicationOperations,
    },
    {
      provide: ApplicationEnvironment,
      useClass: ChromeApplicationEnvironment,
    },
    {
      provide: MessageBus,
      useFactory(): MessageBus<Events> {
        const port = chrome.runtime.connect({
          name: '' + chrome.devtools.inspectedWindow.tabId,
        });

        return new PriorityAwareMessageBus(new ChromeMessageBus(port));
      },
    },
    provideSettings(),
  ],
};
