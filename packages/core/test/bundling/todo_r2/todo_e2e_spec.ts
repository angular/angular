/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import '@angular/compiler';
import {ɵwhenRendered as whenRendered} from '@angular/core';
import {withBody} from '@angular/private/testing';
import * as path from 'path';

const UTF8 = {
  encoding: 'utf-8'
};
const PACKAGE = 'angular/packages/core/test/bundling/todo_r2';
const BUNDLES = ['bundle.js', 'bundle.min_debug.js', 'bundle.min.js'];

describe('functional test for todo', () => {
  BUNDLES.forEach(bundle => {
    describe(bundle, () => {
      it('should place styles on the elements within the component',
         withBody('<todo-app></todo-app>', async () => {
           require(path.join(PACKAGE, bundle));
           await (window as any).waitForApp;
           const toDoAppComponent = (window as any).toDoAppComponent;
           await whenRendered(toDoAppComponent);

           const styleContent =
               findStyleTextForSelector('.todo-list\\\[_ngcontent-[a-z]+-\\\w+\\\]');
           expect(styleContent).toMatch(/font-weight:\s*bold;/);
           expect(styleContent).toMatch(/color:\s*#d9d9d9;/);
         }));
    });
  });
});

function findStyleTextForSelector(selector: string): string {
  const styles = document.querySelectorAll('head style');
  const matchExp = new RegExp(`${selector}.+?\\\{([\\s\\S]+)\\\}`, 'm');
  for (let i = 0; i < styles.length; i++) {
    const styleElement = styles[i];
    const content = styleElement.textContent || '';
    const result = matchExp.exec(content);
    if (result && result.length > 1) {
      return result[1];
    }
  }

  throw new Error(`The CSS Style Rule ${selector} was not found`);
}
