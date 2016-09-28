import {bindAction} from '../../util';
import {buildTree, flattenTree} from '../util';

declare var Polymer: any;

export function main() {
  const rootEl: any = document.querySelector('binary-tree');

  function destroyDom() {
    while (rootEl.firstChild) rootEl.removeChild(rootEl.firstChild);
  }

  function createDom() {
    const flatTree = flattenTree(buildTree(), []);
    for (var i = 0; i < flatTree.length; i++) {
      const el: any = document.createElement('tree-leaf');
      el.data = flatTree[i];
      rootEl.appendChild(el);
    }
  }

  bindAction('#destroyDom', destroyDom);
  bindAction('#createDom', createDom);
}
