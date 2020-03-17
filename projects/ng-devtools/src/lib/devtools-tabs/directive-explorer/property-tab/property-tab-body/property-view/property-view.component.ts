import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { Descriptor, MessageBus, Events, DirectivePosition, NestedProp } from 'protocol';
import { FlatTreeControl } from '@angular/cdk/tree';
import { FlatNode, Property, PropertyDataSource } from './property-data-source';
import { NestedPropertyResolver } from '../../../nested-property-resolver';

@Component({
  selector: 'ng-property-view',
  templateUrl: './property-view.component.html',
  styleUrls: ['./property-view.component.css'],
})
export class PropertyViewComponent {
  @Input() set name(name: string) {
    const result = this._nestedProps.getDirectiveControls(name);
    this.dataSource = result.dataSource;
    this.treeControl = result.treeControl;
  }
  dataSource: PropertyDataSource;
  treeControl: FlatTreeControl<FlatNode>;

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
    this._nestedProps.updateValue(newValue, node);
    node.prop.descriptor.value = newValue;
  }
}
