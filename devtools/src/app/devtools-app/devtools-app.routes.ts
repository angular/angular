/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Routes} from '@angular/router';

import {AppDevToolsComponent} from './devtools-app.component';
import {FrameManager} from '../../../projects/ng-devtools/src/lib/application-services/frame_manager';
import {Events, MessageBus, PriorityAwareMessageBus} from '../../../projects/protocol';
import {IFrameMessageBus} from '../../iframe-message-bus';
import {DEVTOOLS_BACKEND_URI, DEVTOOLS_FRONTEND_URI} from '../../communication';

export const DEVTOOL_ROUTES: Routes = [
  {
    path: '',
    component: AppDevToolsComponent,
    pathMatch: 'full',
    providers: [
      {
        provide: MessageBus,
        useFactory(): MessageBus<Events> {
          return new PriorityAwareMessageBus(
            new IFrameMessageBus(
              DEVTOOLS_FRONTEND_URI,
              DEVTOOLS_BACKEND_URI,
              () => (document.querySelector('#sample-app') as HTMLIFrameElement).contentWindow!,
            ),
          );
        },
      },
      {provide: FrameManager, useFactory: () => FrameManager.initialize(null)},
    ],
  },
];
