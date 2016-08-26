import {bindAction} from '@angular/platform-browser/testing/benchmark_util';

import {buildTree, emptyTree} from '../app/util';

declare var Polymer: any;

export function main() {
  const rootEl: any = document.querySelector('binary-tree');
  rootEl.data = emptyTree();

  function destroyDom() { rootEl.data = emptyTree(); }

  function createDom() { rootEl.data = buildTree(); }

  bindAction('#destroyDom', destroyDom);
  bindAction('#createDom', createDom);
}
