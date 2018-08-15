/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {enableProdMode} from '@angular/core';

import {bindAction, profile} from '../../util';
import {buildTree, emptyTree} from '../util';

import {AppModule, TreeComponent} from './tree';

let tree: TreeComponent;
let appMod: AppModule;
let detectChangesRuns = 0;

function destroyDom() {
  tree.data = emptyTree;
  appMod.tick();
}

function createDom() {
  tree.data = buildTree();
  appMod.tick();
}

function detectChanges() {
  for (let i = 0; i < 10; i++) {
    appMod.tick();
  }
  detectChangesRuns += 10;
  numberOfChecksEl.textContent = `${detectChangesRuns}`;
}

function noop() {}

const numberOfChecksEl = document.getElementById('numberOfChecks');

enableProdMode();
appMod = new AppModule();
appMod.bootstrap();
tree = appMod.componentRef.instance;

bindAction('#destroyDom', destroyDom);
bindAction('#createDom', createDom);
bindAction('#detectChanges', detectChanges);
bindAction('#detectChangesProfile', profile(detectChanges, noop, 'detectChanges'));
bindAction('#updateDomProfile', profile(createDom, noop, 'update'));
bindAction('#createDomProfile', profile(createDom, destroyDom, 'create'));
