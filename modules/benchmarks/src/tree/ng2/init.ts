/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ApplicationRef, NgModuleRef} from '@angular/core';

import {bindAction, profile} from '../../util';
import {buildTree, emptyTree, initTreeUtils} from '../util';

import {AppModule, TreeComponent} from './tree';

export function init(moduleRef: NgModuleRef<AppModule>) {
  let tree: TreeComponent;
  let appRef: ApplicationRef;
  let detectChangesRuns = 0;

  function destroyDom() {
    tree.data = emptyTree;
    appRef.tick();
  }

  function createDom() {
    tree.data = buildTree();
    appRef.tick();
  }

  function detectChanges() {
    for (let i = 0; i < 10; i++) {
      appRef.tick();
    }
    detectChangesRuns += 10;
    numberOfChecksEl.textContent = `${detectChangesRuns}`;
  }

  function noop() {}

  const injector = moduleRef.injector;
  appRef = injector.get(ApplicationRef);
  const numberOfChecksEl = document.getElementById('numberOfChecks')!;

  tree = appRef.components[0].instance;

  initTreeUtils();

  bindAction('#destroyDom', destroyDom);
  bindAction('#createDom', createDom);
  bindAction('#detectChanges', detectChanges);
  bindAction('#detectChangesProfile', profile(detectChanges, noop, 'detectChanges'));
  bindAction('#updateDomProfile', profile(createDom, noop, 'update'));
  bindAction('#createDomProfile', profile(createDom, destroyDom, 'create'));
}
