import { Component, Input } from '@angular/core';
import { FlatTreeControl } from '@angular/cdk/tree';
import { PropertyDataSource } from '../../../property-data-source';
import { NestedPropertyResolver, FlatNode, PropertyController } from '../../../nested-property-resolver';

@Component({
  selector: 'ng-property-view',
  templateUrl: './property-view.component.html',
  styleUrls: ['./property-view.component.css'],
})
export class PropertyViewComponent {
  @Input() set name(name: string) {
    this._controller = this._nestedProps.getDirectiveController(name);
    const result = this._controller.getDirectiveControls();
    this.dataSource = result.dataSource;
    this.treeControl = result.treeControl;
  }
  dataSource: PropertyDataSource;
  treeControl: FlatTreeControl<FlatNode>;

  private _controller: PropertyController;

  constructor(private _nestedProps: NestedPropertyResolver) {}

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

  updateValue(newValue: any, node: FlatNode): void {
    this._controller.updateValue(newValue, node);
    node.prop.descriptor.value = newValue;
  }
}
