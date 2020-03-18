import { Injectable } from '@angular/core';
import { DirectivesProperties, ComponentExplorerViewProperties } from 'protocol';
import { PropertyDataSource, FlatNode } from './property-data-source';
import { FlatTreeControl } from '@angular/cdk/tree';

@Injectable({
  providedIn: 'root',
})
export class NestedPropertyResolver {
  constructor() {}

  setProperties(data: DirectivesProperties) {}

  getExpandedProperties(): ComponentExplorerViewProperties {
    return {} as any;
  }

  updateValue(node: FlatNode, value: any) {}

  getDirectiveControls(directive: string): { dataSource: PropertyDataSource; treeControl: FlatTreeControl<FlatNode> } {
    return {} as any;
  }
}

// private _constructPathOfKeysToPropertyValue(nodePropToGetKeysFor: Property, keys: string[] = []): string[] {
//   keys.unshift(nodePropToGetKeysFor.name);
//   const parentNodeProp = nodePropToGetKeysFor.parent;
//   if (parentNodeProp) {
//     this._constructPathOfKeysToPropertyValue(parentNodeProp, keys);
//   }
//   return keys;
// }
