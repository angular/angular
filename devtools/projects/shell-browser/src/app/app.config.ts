/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ApplicationConfig, inject, NgZone} from '@angular/core';
import {provideAnimations} from '@angular/platform-browser/animations';
import {ApplicationEnvironment, ApplicationOperations} from '../../../ng-devtools';

import {ChromeApplicationEnvironment} from './chrome-application-environment';
import {ChromeApplicationOperations} from './chrome-application-operations';
import {ZoneAwareChromeMessageBus} from './zone-aware-chrome-message-bus';
import {Events, MessageBus, PriorityAwareMessageBus} from '../../../protocol';
import {FrameManager} from '../../../ng-devtools/src/lib/application-services/frame_manager';
import {Platform} from '@angular/cdk/platform';

export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimations(),
    {provide: FrameManager, useFactory: () => FrameManager.initialize()},
    {
      provide: ApplicationOperations,
      useClass: ChromeApplicationOperations,
      deps: [Platform],
    },
    {
      provide: ApplicationEnvironment,
      useClass: ChromeApplicationEnvironment,
    },
    {
      provide: MessageBus,
      useFactory(): MessageBus<Events> {
        const ngZone = inject(NgZone);
        const port = chrome.runtime.connect({
          name: '' + chrome.devtools.inspectedWindow.tabId,
        });

        return new PriorityAwareMessageBus(new ZoneAwareChromeMessageBus(port, ngZone));
      },
    },
  ],
};
