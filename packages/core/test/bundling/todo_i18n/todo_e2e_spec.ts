/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import '@angular/localize/init';
import '@angular/compiler';

import {ɵwhenRendered as whenRendered} from '@angular/core';
import {getComponent} from '@angular/core/src/render3';
import {clearTranslations} from '@angular/localize';
import {withBody} from '@angular/private/testing';
import * as path from 'path';

const PACKAGE = 'angular/packages/core/test/bundling/todo_i18n';
const BUNDLES = ['bundle.js', 'bundle.min_debug.js', 'bundle.min.js'];

describe('functional test for todo i18n', () => {
  BUNDLES.forEach(bundle => {
    describe(bundle, () => {
      it('should render todo i18n', withBody('<todo-app></todo-app>', async () => {
           clearTranslations();
           require(path.join(PACKAGE, bundle));
           const toDoAppComponent = getComponent(document.querySelector('todo-app')!);
           expect(document.body.textContent).toContain('liste de tâches');
           expect(document.body.textContent).toContain('Démontrer les components');
           expect(document.body.textContent).toContain('Démontrer NgModules');
           expect(document.body.textContent).toContain('4 tâches restantes');
           expect(document.querySelector('.new-todo')!.getAttribute('placeholder'))
               .toEqual(`Qu'y a-t-il à faire ?`);
           document.querySelector('button')!.click();
           await whenRendered(toDoAppComponent);
           expect(document.body.textContent).toContain('3 tâches restantes');
         }));
    });
  });
});
