/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import '@angular/localize/init';
import '@angular/compiler';

import {clearTranslations} from '@angular/localize';
import {withBody} from '@angular/private/testing';
import * as path from 'path';

const PACKAGE = 'angular/packages/core/test/bundling/todo_i18n';
const BUNDLES = ['bundle.js', 'bundle.debug.min.js', 'bundle.min.js'];

describe('functional test for todo i18n', () => {
  BUNDLES.forEach(bundle => {
    describe(bundle, () => {
      it('should render todo i18n', withBody('<todo-app></todo-app>', async () => {
           clearTranslations();
           // load the bundle
           await import(path.join(PACKAGE, bundle));
           // the bundle attaches the following fields to the `window` global.
           const {appReady} = window as any;
           await appReady;
           expect(document.body.textContent).toContain('liste de tâches');
           expect(document.body.textContent).toContain('Démontrer les components');
           expect(document.body.textContent).toContain('Démontrer NgModules');
           expect(document.body.textContent).toContain('4 tâches restantes');
           expect(document.querySelector('.new-todo')!.getAttribute('placeholder'))
               .toEqual(`Qu'y a-t-il à faire ?`);
           document.querySelector('button')!.click();
           expect(document.body.textContent).toContain('3 tâches restantes');
         }));
    });
  });
});
