import {DragDropModule} from '@angular/cdk/drag-drop';
import {OverlayModule} from '@angular/cdk/overlay';
import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {
  CdkDragDropAxisLockExample
} from './cdk-drag-drop-axis-lock/cdk-drag-drop-axis-lock-example';
import {CdkDragDropBoundaryExample} from './cdk-drag-drop-boundary/cdk-drag-drop-boundary-example';
import {
  CdkDragDropConnectedSortingGroupExample
} from './cdk-drag-drop-connected-sorting-group/cdk-drag-drop-connected-sorting-group-example';
import {
  CdkDragDropConnectedSortingExample
} from './cdk-drag-drop-connected-sorting/cdk-drag-drop-connected-sorting-example';
import {
  CdkDragDropCustomPlaceholderExample
} from './cdk-drag-drop-custom-placeholder/cdk-drag-drop-custom-placeholder-example';
import {
  CdkDragDropCustomPreviewExample
} from './cdk-drag-drop-custom-preview/cdk-drag-drop-custom-preview-example';
import {CdkDragDropDelayExample} from './cdk-drag-drop-delay/cdk-drag-drop-delay-example';
import {
  CdkDragDropDisabledSortingExample
} from './cdk-drag-drop-disabled-sorting/cdk-drag-drop-disabled-sorting-example';
import {CdkDragDropDisabledExample} from './cdk-drag-drop-disabled/cdk-drag-drop-disabled-example';
import {
  CdkDragDropEnterPredicateExample
} from './cdk-drag-drop-enter-predicate/cdk-drag-drop-enter-predicate-example';
import {
  CdkDragDropFreeDragPositionExample
} from './cdk-drag-drop-free-drag-position/cdk-drag-drop-free-drag-position-example';
import {CdkDragDropHandleExample} from './cdk-drag-drop-handle/cdk-drag-drop-handle-example';
import {
  CdkDragDropHorizontalSortingExample
} from './cdk-drag-drop-horizontal-sorting/cdk-drag-drop-horizontal-sorting-example';
import {CdkDragDropOverviewExample} from './cdk-drag-drop-overview/cdk-drag-drop-overview-example';
import {
  CdkDragDropRootElementExample
} from './cdk-drag-drop-root-element/cdk-drag-drop-root-element-example';
import {CdkDragDropSortingExample} from './cdk-drag-drop-sorting/cdk-drag-drop-sorting-example';
import {
  CdkDragDropSortPredicateExample
} from './cdk-drag-drop-sort-predicate/cdk-drag-drop-sort-predicate-example';

export {
  CdkDragDropAxisLockExample,
  CdkDragDropBoundaryExample,
  CdkDragDropConnectedSortingExample,
  CdkDragDropConnectedSortingGroupExample,
  CdkDragDropCustomPlaceholderExample,
  CdkDragDropCustomPreviewExample,
  CdkDragDropDelayExample,
  CdkDragDropDisabledExample,
  CdkDragDropDisabledSortingExample,
  CdkDragDropEnterPredicateExample,
  CdkDragDropFreeDragPositionExample,
  CdkDragDropHandleExample,
  CdkDragDropHorizontalSortingExample,
  CdkDragDropOverviewExample,
  CdkDragDropRootElementExample,
  CdkDragDropSortingExample,
  CdkDragDropSortPredicateExample,
};

const EXAMPLES = [
  CdkDragDropAxisLockExample,
  CdkDragDropBoundaryExample,
  CdkDragDropConnectedSortingExample,
  CdkDragDropConnectedSortingGroupExample,
  CdkDragDropCustomPlaceholderExample,
  CdkDragDropCustomPreviewExample,
  CdkDragDropDelayExample,
  CdkDragDropDisabledExample,
  CdkDragDropDisabledSortingExample,
  CdkDragDropEnterPredicateExample,
  CdkDragDropFreeDragPositionExample,
  CdkDragDropHandleExample,
  CdkDragDropHorizontalSortingExample,
  CdkDragDropOverviewExample,
  CdkDragDropRootElementExample,
  CdkDragDropSortingExample,
  CdkDragDropSortPredicateExample,
];

@NgModule({
  imports: [
    DragDropModule,
    OverlayModule,
    CommonModule,
  ],
  declarations: EXAMPLES,
  exports: EXAMPLES,
  entryComponents: EXAMPLES,
})
export class CdkDragDropExamplesModule {
}
