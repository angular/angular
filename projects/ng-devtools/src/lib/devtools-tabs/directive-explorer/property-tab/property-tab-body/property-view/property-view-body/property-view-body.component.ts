import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { FlatTreeControl } from '@angular/cdk/tree';
import { PropertyDataSource } from '../../../../property-resolver/property-data-source';
import { FlatNode } from '../../../../property-resolver/element-property-resolver';
import { DirectivePropertyResolver } from '../../../../property-resolver/directive-property-resolver';

@Component({
  selector: 'ng-property-view-body',
  templateUrl: './property-view-body.component.html',
  styleUrls: ['./property-view-body.component.css'],
})
export class PropertyViewBodyComponent implements OnChanges {
  @Input() dataSource: PropertyDataSource;
  @Input() treeControl: FlatTreeControl<FlatNode>;
  @Input() controller: DirectivePropertyResolver;
  @Input() filterList: string[] | null = null;

  hasChild = (_: number, node: FlatNode): boolean => node.expandable;

  ngOnChanges(): void {
    this.filterTreeNodes();
  }

  filterTreeNodes(): void {
    this.dataSource.filterDataSource(this.filterList);
  }

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
