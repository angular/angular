/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component, ElementRef, ViewChild} from '@angular/core';

import {IFrameMessageBus} from '../../iframe-message-bus';
import {DevToolsComponent} from 'ng-devtools';

@Component({
  templateUrl: './devtools-app.component.html',
  styleUrls: ['./devtools-app.component.scss'],
  imports: [DevToolsComponent],
})
export class AppDevToolsComponent {
  messageBus: IFrameMessageBus | null = null;
  @ViewChild('ref') iframe!: ElementRef;
}
