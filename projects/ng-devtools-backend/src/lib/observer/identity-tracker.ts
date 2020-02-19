import { ElementID } from 'protocol';
import { getComponentForest } from '../component-tree';
import { Type } from '@angular/core';
import { IndexedNode } from './observer';
import { DebuggingAPI } from '../interfaces';

interface TreeNode {
  parent: TreeNode;
  component?: Type<any>;
  directives?: Type<any>[];
  children: TreeNode[];
}

export class IdentityTracker {
  private _elementComponent = new Map<Node, any>();
  private _elementDirectives = new Map<Node, any[]>();
  private _currentDirectiveID = new Map<any, ElementID>();
  private _createdDirectives = new Set<any>();
  private _forest: TreeNode[] = [];
  private _componentTreeNode = new Map<any, TreeNode>();

  constructor(private _ng: DebuggingAPI) {}

  getDirectiveID(dir: any) {
    return this._currentDirectiveID.get(dir);
  }

  insert(node: HTMLElement, cmpOrDirective: any | any[]): void {
    const isComponent = !Array.isArray(cmpOrDirective);
    const parent = getParentComponentFromDomNode(node, this._ng);

    (isComponent ? [cmpOrDirective] : cmpOrDirective).forEach((dir: any) => {
      this._elementComponent.set(node, dir);
      this._createdDirectives.add(dir);
    });

    let parentTreeNode = null;
    let parentID = [];
    let childIdx = 0;
    let siblingsArray = this._forest;
    if (parent) {
      const parentElement = this._ng.getHostElement(parent) || document.documentElement;

      const children = getComponentForest(parentElement, this._ng)[0].children;

      parentID = this._currentDirectiveID.get(parent);
      parentTreeNode = this._componentTreeNode.get(parent);
      siblingsArray = parentTreeNode.children;

      if (isComponent) {
        for (const child of children) {
          if (child.component.instance === cmpOrDirective) {
            break;
          }
          if (this._createdDirectives.has(child.component.instance)) {
            childIdx++;
          }
        }
      } else {
        for (const child of children) {
          if (child.directives && child.directives.length && child.directives.some(d => d === cmpOrDirective[0])) {
            break;
          }
          if (this._createdDirectives.has(child.component.instance)) {
            childIdx++;
          }
        }
      }
    }

    const treeNode: TreeNode = {
      parent: parentTreeNode,
      children: [],
      directives: isComponent ? undefined : cmpOrDirective,
      component: isComponent ? cmpOrDirective : cmpOrDirective[0],
    };
    siblingsArray.splice(childIdx, 0, treeNode);

    if (isComponent) {
      this._currentDirectiveID.set(cmpOrDirective, parentID.concat([childIdx]));
      this._componentTreeNode.set(cmpOrDirective, treeNode);
    } else {
      const elID = parentID.concat([childIdx]);
      cmpOrDirective.forEach((dir: any) => {
        this._currentDirectiveID.set(dir, elID);
        this._componentTreeNode.set(dir, treeNode);
      });
    }

    for (let i = childIdx + 1; i < siblingsArray.length; i++) {
      const sibling = siblingsArray[i];
      const siblingId = this._currentDirectiveID.get(sibling.component);
      siblingId[siblingId.length - 1] = siblingId[siblingId.length - 1] + 1;
      this._updateNestedNodeIds(sibling, siblingId.length - 1, 1);
    }
  }

  delete(cmp: any): void {
    const node = this._componentTreeNode.get(cmp);
    const parent = node.parent;
    let childrenArray = this._forest;
    if (parent) {
      childrenArray = parent.children;
    }

    const childIdx = childrenArray.indexOf(node);
    childrenArray.splice(childIdx, 1);

    for (let i = childIdx; i < childrenArray.length; i++) {
      const sibling = childrenArray[i].component;
      const siblingId = this._currentDirectiveID.get(sibling);
      // We removed the sibling node, so we need to decrease the position
      siblingId[siblingId.length - 1] = siblingId[siblingId.length - 1] - 1;
      this._updateNestedNodeIds(childrenArray[i], siblingId.length - 1, -1);
    }
  }

  index(root: IndexedNode, parent: TreeNode | null = null): void {
    if (root.component) {
      this._createdDirectives.add(root.component.instance);
      const node = {
        component: root.component.instance,
        parent,
        directives: [],
        children: [],
      };
      this._componentTreeNode.set(root.component.instance, node);
      if (parent) {
        parent.children.push(node);
      } else {
        this._forest.push(node);
      }
      parent = node;
      this._currentDirectiveID.set(root.component.instance, root.id);
      root.directives.forEach(dir => {
        this._currentDirectiveID.set(dir.instance, root.id);
      });
    }
    root.children.forEach(child => this.index(child, parent));
  }

  hasDirective(dir: any) {
    return this._createdDirectives.has(dir);
  }

  destroy() {
    this._elementComponent = new Map<Node, any>();
    this._currentDirectiveID = new Map<any, ElementID>();
    this._createdDirectives = new Set<any>();
    this._elementDirectives = new Map<Node, any[]>();
    this._forest = [];
    this._componentTreeNode = new Map<any, TreeNode>();
  }

  private _updateNestedNodeIds(p: TreeNode, level: number, incrementBy: number): void {
    p.children.forEach(c => {
      const id = this._currentDirectiveID.get(c.component);
      id[level] = id[level] + incrementBy;
      this._updateNestedNodeIds(c, level, incrementBy);
    });
  }
}

const getParentComponentFromDomNode = (node: Node, ng: DebuggingAPI) => {
  let current = node;
  let parent = null;
  while (current.parentElement) {
    current = current.parentElement;
    const parentComponent = ng.getComponent(current);
    if (parentComponent) {
      parent = parentComponent;
      break;
    }
  }
  return parent;
};
