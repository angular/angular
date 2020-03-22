import { Component, EventEmitter, Input, Output } from '@angular/core';
import { PropertyDataSource } from '../../../../../property-resolver/property-data-source';
import { FlatNode } from '../../../../../property-resolver/element-property-resolver';
import { FlatTreeControl } from '@angular/cdk/tree';

@Component({
  selector: 'ng-property-view-tree',
  templateUrl: './property-view-tree.component.html',
  styleUrls: ['./property-view-tree.component.css'],
})
export class PropertyViewTreeComponent {
  @Input() set dataSource(dataSource: PropertyDataSource) {
    this._dataSource = dataSource;
  }
  @Output() updateValue = new EventEmitter<any>();

  _dataSource: PropertyDataSource;
  _treeControl: FlatTreeControl<FlatNode>;

  hasChild = (_: number, node: FlatNode): boolean => {
    return node.expandable;
  };

  toggle(node: FlatNode): void {
    if (this._treeControl.isExpanded(node)) {
      this._treeControl.collapse(node);
      return;
    }
    this.expand(node);
  }

  expand(node: FlatNode): void {
    const { prop } = node;
    if (!prop.descriptor.expandable) {
      return;
    }
    this._treeControl.expand(node);
  }

  handleUpdate(node: FlatNode, updatedValue: any): void {
    this.updateValue.emit({
      node,
      updatedValue,
    });
  }
}
