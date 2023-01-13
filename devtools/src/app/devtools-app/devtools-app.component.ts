/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, ElementRef, ViewChild} from '@angular/core';
import {Events, MessageBus, PriorityAwareMessageBus} from 'protocol';

import {IFrameMessageBus} from '../../iframe-message-bus';

@Component({
  templateUrl: './devtools-app.component.html',
  styleUrls: ['./devtools-app.component.scss'],
  providers: [
    {
      provide: MessageBus,
      useFactory(): MessageBus<Events> {
        return new PriorityAwareMessageBus(new IFrameMessageBus(
            'angular-devtools', 'angular-devtools-backend',
            // tslint:disable-next-line: no-non-null-assertion
            () => (document.querySelector('#sample-app') as HTMLIFrameElement).contentWindow!));
      },
    },
  ],
})
export class DevToolsComponent {
  messageBus: IFrameMessageBus|null = null;
  @ViewChild('ref') iframe: ElementRef;
}
