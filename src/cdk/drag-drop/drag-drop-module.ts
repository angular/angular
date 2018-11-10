/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {CdkDropList} from './drop-list';
import {CdkDropListGroup} from './drop-list-group';
import {CdkDrag} from './drag';
import {CdkDragHandle} from './drag-handle';
import {CdkDragPreview} from './drag-preview';
import {CdkDragPlaceholder} from './drag-placeholder';

@NgModule({
  declarations: [
    CdkDropList,
    CdkDropListGroup,
    CdkDrag,
    CdkDragHandle,
    CdkDragPreview,
    CdkDragPlaceholder,
  ],
  exports: [
    CdkDropList,
    CdkDropListGroup,
    CdkDrag,
    CdkDragHandle,
    CdkDragPreview,
    CdkDragPlaceholder,
  ],
})
export class DragDropModule {}
