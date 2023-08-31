/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, ElementRef, ViewChild} from '@angular/core';
import {DevToolsModule as NgDevToolsModule} from 'ng-devtools';
import {Events, MessageBus, PriorityAwareMessageBus} from 'protocol';

import {IFrameMessageBus} from '../../../../../src/iframe-message-bus';

@Component({
  standalone: true,
  imports: [NgDevToolsModule],
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
  styles: [`
    iframe {
      height: 340px;
      width: 100%;
      border: 0;
    }

    .devtools-wrapper {
      height: calc(100vh - 345px);
    }
  `],
  template: `
    <iframe #ref src="demo-app/todos/app" id="sample-app"></iframe>
    <br />
    <div class="devtools-wrapper">
      <ng-devtools></ng-devtools>
    </div>
  `
})
export class DevToolsComponent {
  messageBus: IFrameMessageBus|null = null;
  @ViewChild('ref') iframe: ElementRef;
}
