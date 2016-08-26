import {getDOM} from '@angular/platform-browser/src/dom/dom_adapter';
import {TreeNode} from '../../app/util';

// http://jsperf.com/nextsibling-vs-childnodes

const BASELINE_TREE_TEMPLATE =document.createElement('template');
BASELINE_TREE_TEMPLATE.innerHTML = '<span>_<template class="ng-provider"></template><template class="ng-provider"></template></span>';
const BASELINE_IF_TEMPLATE =document.createElement('template');
BASELINE_IF_TEMPLATE.innerHTML = '<span template="if"><tree></tree></span>';

export class BaseLineTreeComponent {
  value: BaseLineInterpolation;
  left: BaseLineIf;
  right: BaseLineIf;
  constructor(public element: HTMLElement) {
    var clone = getDOM().clone(BASELINE_TREE_TEMPLATE.content.firstChild);
    getDOM().appendChild(element, clone);

    var child = clone.firstChild;
    this.value = new BaseLineInterpolation(child);
    child = getDOM().nextSibling(child);
    this.left = new BaseLineIf(child);
    child = getDOM().nextSibling(child);
    this.right = new BaseLineIf(child);
  }
  update(value: TreeNode) {
    this.value.update(value.value);
    this.left.update(value.left);
    this.right.update(value.right);
  }
}

export class BaseLineInterpolation {
  value: string;
  constructor(public textNode: Node) {
    this.value = null;
  }
  update(value: string) {
    if (this.value !== value) {
      this.value = value;
      getDOM().setText(this.textNode, value + ' ');
    }
  }
}

export class BaseLineIf {
  condition: boolean;
  component: BaseLineTreeComponent;
  constructor(public anchor: Node) {
    this.condition = false;
    this.component = null;
  }
  update(value: TreeNode) {
    var newCondition = !!value;
    if (this.condition !== newCondition) {
      this.condition = newCondition;
      if (this.component) {
        getDOM().remove(this.component.element);
        this.component = null;
      }
      if (this.condition) {
        var element = getDOM().firstChild((<any>getDOM().clone(BASELINE_IF_TEMPLATE)).content);
        this.anchor.parentNode.insertBefore(element, getDOM().nextSibling(this.anchor));
        this.component = new BaseLineTreeComponent(<HTMLElement>getDOM().firstChild(element));
      }
    }
    if (this.component) {
      this.component.update(value);
    }
  }
}
