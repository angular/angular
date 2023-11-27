/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgIf, NgSwitch, NgSwitchCase} from '@angular/common';
import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {isFirefox, isIos} from '@angular/docs';

import {ErrorType, NodeRuntimeState} from '../node-runtime-state.service';

@Component({
  standalone: true,
  selector: 'docs-tutorial-preview-error',
  templateUrl: './preview-error.component.html',
  styleUrls: ['./preview-error.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgIf, NgSwitch, NgSwitchCase],
})
export class PreviewError {
  private readonly nodeRuntimeState = inject(NodeRuntimeState);

  readonly isIos = isIos;
  readonly isFirefox = isFirefox;

  readonly error = this.nodeRuntimeState.error;
  readonly ErrorType = ErrorType;
}
