/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

export {DragDrop} from './drag-drop';
export {DragRef, DragRefConfig} from './drag-ref';
export {DropListRef} from './drop-list-ref';

export * from './drop-list-container';
export * from './drag-events';
export * from './drag-utils';
export * from './drag-drop-module';
export * from './drag-drop-registry';

export {CdkDropList} from './directives/drop-list';
export * from './directives/drop-list-group';
export * from './directives/drag';
export * from './directives/drag-handle';
export * from './directives/drag-preview';
export * from './directives/drag-placeholder';

import {DragRefConfig} from './drag-ref';

/**
 * @deprecated Use `DragRefConfig` instead.
 * @breaking-change 8.0.0
 */
export interface CdkDragConfig extends DragRefConfig {}
