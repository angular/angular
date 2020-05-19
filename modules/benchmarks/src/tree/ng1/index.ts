/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {bindAction, profile} from '../../util';
import {buildTree, emptyTree} from '../util';

import {addTreeToModule} from './tree';

declare var angular: any;

function init() {
  let detectChangesRuns = 0;
  const numberOfChecksEl = document.getElementById('numberOfChecks')!;

  addTreeToModule(angular.module('app', [])).run([
    '$rootScope',
    ($rootScope: any) => {
      function detectChanges() {
        for (let i = 0; i < 10; i++) {
          $rootScope.$digest();
        }
        detectChangesRuns += 10;
        numberOfChecksEl.textContent = `${detectChangesRuns}`;
      }

      function noop() {}

      function destroyDom() {
        $rootScope.$apply(() => {
          $rootScope.initData = emptyTree;
        });
      }

      function createDom() {
        $rootScope.$apply(() => {
          $rootScope.initData = buildTree();
        });
      }

      bindAction('#destroyDom', destroyDom);
      bindAction('#createDom', createDom);
      bindAction('#detectChanges', detectChanges);
      bindAction('#detectChangesProfile', profile(detectChanges, noop, 'detectChanges'));
      bindAction('#updateDomProfile', profile(createDom, noop, 'update'));
      bindAction('#createDomProfile', profile(createDom, destroyDom, 'create'));
    }
  ]);

  angular.bootstrap(document.querySelector('tree'), ['app']);
}

init();
