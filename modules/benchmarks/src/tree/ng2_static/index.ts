import {ApplicationRef, enableProdMode} from '@angular/core';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';

import {bindAction, profile} from '../../util';
import {buildTree, emptyTree} from '../util';

import {AppModule, RootTreeComponent} from './tree';

export function main() {
  var tree: RootTreeComponent;
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

  function init() {
    enableProdMode();
    platformBrowserDynamic().bootstrapModule(AppModule).then((ref) => {
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
