/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {CdkDropList} from './directives/drop-list';
import {CdkDropListGroup} from './directives/drop-list-group';
import {CdkDrag} from './directives/drag';
import {CdkDragHandle} from './directives/drag-handle';
import {CdkDragPreview} from './directives/drag-preview';
import {CdkDragPlaceholder} from './directives/drag-placeholder';
import {DragDrop} from './drag-drop';

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
  providers: [
    DragDrop,
  ]
})
export class DragDropModule {}
