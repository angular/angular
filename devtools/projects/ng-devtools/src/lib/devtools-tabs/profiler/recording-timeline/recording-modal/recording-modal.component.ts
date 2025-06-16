/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component} from '@angular/core';
import {RecordingDialogComponent} from './recording-dialog/recording-dialog.component';

@Component({
  selector: 'ng-recording-modal',
  templateUrl: './recording-modal.component.html',
  styleUrls: ['./recording-modal.component.scss'],
  imports: [RecordingDialogComponent],
})
export class RecordingModalComponent {}
