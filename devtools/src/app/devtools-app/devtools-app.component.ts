/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component, ElementRef, viewChild} from '@angular/core';

import {IFrameMessageBus} from '../../iframe-message-bus';
import {DevToolsComponent} from '../../../projects/ng-devtools';
import {SplitAreaDirective} from '../../../projects/ng-devtools/src/lib/shared/split/splitArea.directive';
import {SplitComponent} from '../../../projects/ng-devtools/src/lib/shared/split/split.component';

@Component({
  templateUrl: './devtools-app.component.html',
  styleUrls: ['./devtools-app.component.scss'],
  imports: [DevToolsComponent, SplitAreaDirective, SplitComponent],
})
export class AppDevToolsComponent {
  messageBus: IFrameMessageBus | null = null;
  readonly iframe = viewChild<ElementRef>('ref');
}
