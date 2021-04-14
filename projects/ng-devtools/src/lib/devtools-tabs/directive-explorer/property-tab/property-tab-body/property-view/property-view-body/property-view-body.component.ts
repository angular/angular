import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
  DirectivePropertyResolver,
  DirectiveTreeData,
} from '../../../../property-resolver/directive-property-resolver';
import { FlatNode } from '../../../../property-resolver/element-property-resolver';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { DirectivePosition } from 'protocol';

@Component({
  selector: 'ng-property-view-body',
  templateUrl: './property-view-body.component.html',
  styleUrls: ['./property-view-body.component.scss'],
})
export class PropertyViewBodyComponent {
  @Input() controller: DirectivePropertyResolver;
  @Input() directiveInputControls: DirectiveTreeData;
  @Input() directiveOutputControls: DirectiveTreeData;
  @Input() directiveStateControls: DirectiveTreeData;

  @Output() inspect = new EventEmitter<{ node: FlatNode; directivePosition: DirectivePosition }>();

  categoryOrder = [0, 1, 2];

  get panels(): { title: string; hidden: boolean; controls: DirectiveTreeData }[] {
    return [
      {
        title: '@Inputs',
        hidden: this.directiveInputControls.dataSource.data.length === 0,
        controls: this.directiveInputControls,
      },
      {
        title: '@Outputs',
        hidden: this.directiveOutputControls.dataSource.data.length === 0,
        controls: this.directiveOutputControls,
      },
      {
        title: 'Properties',
        hidden: this.directiveStateControls.dataSource.data.length === 0,
        controls: this.directiveStateControls,
      },
    ];
  }

  get controlsLoaded(): boolean {
    return !!this.directiveStateControls && !!this.directiveOutputControls && !!this.directiveInputControls;
  }

  updateValue({ node, newValue }: { node: FlatNode; newValue: any }): void {
    this.controller.updateValue(node, newValue);
  }

  drop(event: CdkDragDrop<any, any>): void {
    moveItemInArray(this.categoryOrder, event.previousIndex, event.currentIndex);
  }

  handleInspect(node: FlatNode): void {
    this.inspect.emit({
      node,
      directivePosition: this.controller.directivePosition,
    });
  }
}
