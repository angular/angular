import {bindAction} from '@angular/platform-browser/testing/benchmark_util';

import {TreeNode, buildTree, emptyTree} from '../app/util';

declare var Polymer: any;

export function main() {
  const rootEl: any = document.querySelector('binary-tree');

  rootEl.data = emptyTree();

  function destroyDom() {
    while (rootEl.firstChild) rootEl.removeChild(rootEl.firstChild);
  }

  function createDom() {
    const flatTree = flattenTree(buildTree(), []);
    for (var i = 0; i < flatTree.length; i++) {
      const el: any = document.createElement('tree-leaf');
      el.value = flatTree[i];
      rootEl.appendChild(el);
    }
  }

  bindAction('#destroyDom', destroyDom);
  bindAction('#createDom', createDom);
}

function flattenTree(node: TreeNode, target: string[]): string[] {
  target.push(node.value);
  if (node.left) {
    flattenTree(node.left, target);
  }
  if (node.right) {
    flattenTree(node.right, target);
  }
  return target;
}
