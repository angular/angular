import {DragDropModule} from '@angular/cdk/drag-drop';
import {Component, NgModule} from '@angular/core';

/** Component using all parts of the drag-drop module. All directives should be preserved. */
@Component({
  template: `
    <div cdkDropListGroup>
      <div cdkDropList>
        <div cdkDrag>
          <span cdkDragHandle>handle</span>
          <ng-template cdkDragPlaceholder>Placeholder</ng-template>
          <ng-template cdkDragPreview>Preview</ng-template>
        </div>
      </div>
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
