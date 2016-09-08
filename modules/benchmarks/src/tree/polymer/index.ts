import {bindAction} from '../../util';
import {buildTree, emptyTree} from '../util';

declare var Polymer: any;

export function main() {
  const rootEl: any = document.querySelector('binary-tree');
  rootEl.data = emptyTree;

  function destroyDom() { rootEl.data = emptyTree; }

  function createDom() { rootEl.data = buildTree(); }

  bindAction('#destroyDom', destroyDom);
  bindAction('#createDom', createDom);
}
