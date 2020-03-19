import { Component, Input } from '@angular/core';
import { FlatTreeControl } from '@angular/cdk/tree';
import { PropertyDataSource } from '../../../property-resolver/property-data-source';
import { ElementPropertyResolver, FlatNode } from '../../../property-resolver/element-property-resolver';
import { DirectivePropertyResolver } from '../../../property-resolver/directive-property-resolver';

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

  private _controller: DirectivePropertyResolver;

  constructor(private _nestedProps: ElementPropertyResolver) {}

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
  }
}
