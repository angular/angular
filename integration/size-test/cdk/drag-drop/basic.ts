import {DragDropModule} from '@angular/cdk/drag-drop';
import {Component, NgModule} from '@angular/core';

/**
 * Basic component using `CdkDropList` and `CdkDrag`. Other parts of the drag-drop
 * module such as `CdkDropListGroup`, `CdkDragPlaceholder`, `CdkDragPreview` or
 * `CdkDragHandle` are not used and should be tree-shaken away.
 */
@Component({
  template: `
    <div cdkDropList>
      <div cdkDrag></div>
    </div>
  `,
})
export class TestComponent {}

@NgModule({
  imports: [DragDropModule],
  declarations: [TestComponent],
  bootstrap: [TestComponent],
})
export class AppModule {}
