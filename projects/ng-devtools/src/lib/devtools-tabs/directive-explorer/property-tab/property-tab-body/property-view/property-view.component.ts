import { Component, Input } from '@angular/core';
import { FlatTreeControl } from '@angular/cdk/tree';
import { PropertyDataSource } from '../../../property-resolver/property-data-source';
import { FlatNode } from '../../../property-resolver/element-property-resolver';
import { DirectivePropertyResolver } from '../../../property-resolver/directive-property-resolver';

@Component({
  selector: 'ng-property-view',
  templateUrl: './property-view.component.html',
  styleUrls: ['./property-view.component.css'],
})
export class PropertyViewComponent {
  @Input() dataSource: PropertyDataSource;
  @Input() treeControl: FlatTreeControl<FlatNode>;
  @Input() controller: DirectivePropertyResolver;

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
    this.controller.updateValue(newValue, node);
  }
}
