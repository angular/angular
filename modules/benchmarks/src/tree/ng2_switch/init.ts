import {ApplicationRef, NgModuleRef} from '@angular/core';

import {bindAction, profile} from '../../util';
import {buildTree, emptyTree} from '../util';

import {AppModule, TreeComponent} from './tree';

export function init(moduleRef: NgModuleRef<AppModule>) {
  var tree: TreeComponent;
  var appRef: ApplicationRef;

  function destroyDom() {
    tree.data = emptyTree;
    appRef.tick();
  }

  function createDom() {
    tree.data = buildTree();
    appRef.tick();
  }

  function noop() {}

  const injector = moduleRef.injector;
  appRef = injector.get(ApplicationRef);

  tree = appRef.components[0].instance;
  bindAction('#destroyDom', destroyDom);
  bindAction('#createDom', createDom);
  bindAction('#updateDomProfile', profile(createDom, noop, 'update'));
  bindAction('#createDomProfile', profile(createDom, destroyDom, 'create'));
}
