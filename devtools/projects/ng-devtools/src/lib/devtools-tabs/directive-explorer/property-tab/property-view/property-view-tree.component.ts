import { Component, EventEmitter, Input, Output } from '@angular/core';
import { PropertyDataSource } from '../../property-resolver/property-data-source';
import { FlatNode } from '../../property-resolver/element-property-resolver';
import { FlatTreeControl } from '@angular/cdk/tree';

@Component({
  selector: 'ng-property-view-tree',
  templateUrl: './property-view-tree.component.html',
  styleUrls: ['./property-view-tree.component.scss'],
})
export class PropertyViewTreeComponent {
  @Input() dataSource: PropertyDataSource;
  @Input() treeControl: FlatTreeControl<FlatNode>;
  @Output() updateValue = new EventEmitter<any>();
  @Output() inspect = new EventEmitter<any>();

  hasChild = (_: number, node: FlatNode): boolean => node.expandable;

  toggle(node: FlatNode): void {
    if (this.treeControl.isExpanded(node)) {
      this.treeControl.collapse(node);
      return;
    }
    this.expand(node);
  }

  expand(node: FlatNode): void {
    const { prop } = node;
    if (!prop.descriptor.expandable) {
      return;
    }
    this.treeControl.expand(node);
  }

  handleUpdate(node: FlatNode, newValue: any): void {
    this.updateValue.emit({
      node,
      newValue,
    });
  }
}
