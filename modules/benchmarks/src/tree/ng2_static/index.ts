/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import '@angular/compiler';

import {ApplicationRef, enableProdMode} from '@angular/core';
import {platformBrowser} from '@angular/platform-browser';

import {bindAction, profile} from '../../util';
import {buildTree, emptyTree, initTreeUtils} from '../util';

import {createAppModule, RootTreeComponent} from './tree';

let tree: RootTreeComponent;
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
  initTreeUtils();
  enableProdMode();

  const appModule = createAppModule();

  platformBrowser()
    .bootstrapModule(appModule)
    .then((ref) => {
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
