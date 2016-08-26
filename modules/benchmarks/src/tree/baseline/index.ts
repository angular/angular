import {BrowserDomAdapter} from '@angular/platform-browser/src/browser/browser_adapter';
import {bindAction} from '@angular/platform-browser/testing/benchmark_util';

import {TreeNode, buildTree, emptyTree, profile} from '../app/util';

import {BaseLineTreeComponent} from './app/tree';

export function main() {
  var app: BaseLineTreeComponent;

  function destroyDom() { app.update(emptyTree()); }

  function createDom() { app.update(buildTree()); }

  function noop() {}

  function init() {
    BrowserDomAdapter.makeCurrent();
    const tree = document.createElement('tree');
    document.querySelector('baseline').appendChild(tree);
    app = new BaseLineTreeComponent(tree);

    bindAction('#destroyDom', destroyDom);
    bindAction('#createDom', createDom);

    bindAction('#updateDomProfile', profile(createDom, noop, 'baseline-update'));
    bindAction('#createDomProfile', profile(createDom, destroyDom, 'baseline-create'));
  }

  init();
}
