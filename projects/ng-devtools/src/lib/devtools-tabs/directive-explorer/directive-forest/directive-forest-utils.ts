import { FlatNode } from './component-data-source';
import { FlatTreeControl } from '@angular/cdk/tree';

export const isChildOf = (childId: number[], parentId: number[]) => {
  if (childId.length <= parentId.length) {
    return false;
  }
  for (let i = 0; i < parentId.length; i++) {
    if (childId[i] !== parentId[i]) {
      return false;
    }
  }
  return true;
};

export const parentCollapsed = (nodeIdx: number, all: FlatNode[], treeControl: FlatTreeControl<FlatNode>) => {
  const node = all[nodeIdx];
  for (let i = nodeIdx - 1; i >= 0; i--) {
    if (isChildOf(node.id, all[i].id) && !treeControl.isExpanded(all[i])) {
      return true;
    }
  }
  return false;
};
