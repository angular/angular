/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {CdkDrop} from './drop';
import {CdkDrag} from './drag';
import {CdkDragHandle} from './drag-handle';
import {CdkDragPreview} from './drag-preview';
import {CdkDragPlaceholder} from './drag-placeholder';

@NgModule({
  declarations: [
    CdkDrop,
    CdkDrag,
    CdkDragHandle,
    CdkDragPreview,
    CdkDragPlaceholder,
  ],
  exports: [
    CdkDrop,
    CdkDrag,
    CdkDragHandle,
    CdkDragPreview,
    CdkDragPlaceholder,
  ],
})
export class DragDropModule {}
