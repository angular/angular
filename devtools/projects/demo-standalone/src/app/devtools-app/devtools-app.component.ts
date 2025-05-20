/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component, ElementRef, ViewChild} from '@angular/core';
import {Events, MessageBus, PriorityAwareMessageBus} from '../../../../protocol';

import {IFrameMessageBus} from '../../../../../src/iframe-message-bus';
import {DevToolsComponent} from '../../../../ng-devtools';
import {FrameManager} from '../../../../../projects/ng-devtools/src/lib/application-services/frame_manager';

@Component({
  imports: [DevToolsComponent],
  providers: [
    {provide: FrameManager, useFactory: () => FrameManager.initialize(null)},
    {
      provide: MessageBus,
      useFactory(): MessageBus<Events> {
        return new PriorityAwareMessageBus(
          new IFrameMessageBus(
            'angular-devtools',
            'angular-devtools-backend',
            () => (document.querySelector('#sample-app') as HTMLIFrameElement).contentWindow!,
          ),
        );
      },
    },
  ],
  styles: [
    `
      iframe {
        height: 340px;
        width: 100%;
        border: 0;
      }

      .devtools-wrapper {
        height: calc(100vh - 345px);
      }
    `,
  ],
  template: `
    <iframe #ref src="demo-app/todos/app" id="sample-app"></iframe>
    <br />
    <div class="devtools-wrapper">
      <ng-devtools></ng-devtools>
    </div>
  `,
})
export class DemoDevToolsComponent {
  messageBus: IFrameMessageBus | null = null;
  @ViewChild('ref') iframe!: ElementRef;
}
