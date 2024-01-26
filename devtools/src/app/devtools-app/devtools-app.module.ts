/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';

import {AppDevToolsComponent} from './devtools-app.component';
import {FrameManager} from '../../../projects/ng-devtools/src/lib/frame_manager';
import {Events, MessageBus, PriorityAwareMessageBus} from 'protocol';
import {IFrameMessageBus} from '../../../src/iframe-message-bus';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        component: AppDevToolsComponent,
        pathMatch: 'full',
      },
    ]),
    AppDevToolsComponent,
  ],
  providers: [
    {
      provide: MessageBus,
      useFactory(): MessageBus<Events> {
        return new PriorityAwareMessageBus(
          new IFrameMessageBus(
            'angular-devtools',
            'angular-devtools-backend',
            // tslint:disable-next-line: no-non-null-assertion
            () => (document.querySelector('#sample-app') as HTMLIFrameElement).contentWindow!,
          ),
        );
      },
    },
    {provide: FrameManager, useFactory: () => FrameManager.initialize(null)},
  ],
})
export class DevToolsModule {}
