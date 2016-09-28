import {ApplicationRef, NgModule, enableProdMode} from '@angular/core';
import {platformBrowser} from '@angular/platform-browser';

import {bindAction, profile} from '../../util';
import {TreeNode, buildTree, emptyTree} from '../util';

import {AppModuleNgFactory} from './app.ngfactory';
import {TreeComponent} from './tree';

export function main() {
  let tree: TreeComponent;
  let appRef: ApplicationRef;

  function destroyDom() {
    tree.data = emptyTree;
    appRef.tick();
  }

  function createDom() {
    tree.data = buildTree();
    appRef.tick();
  }

  function noop() {}

  function init() {
    enableProdMode();
    platformBrowser().bootstrapModuleFactory(AppModuleNgFactory).then((ref) => {
      const injector = ref.injector;
      appRef = injector.get(ApplicationRef);

      tree = appRef.components[0].instance;
      bindAction('#destroyDom', destroyDom);
      bindAction('#createDom', createDom);
      bindAction('#updateDomProfile', profile(createDom, noop, 'update'));
      bindAction('#createDomProfile', profile(createDom, destroyDom, 'create'));
    });
  }

  init();
}
