/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgForOfContext} from '@angular/common';

import {C, E, T, b, cR, cr, defineComponent, e, p, r, t} from '../../src/render3/index';

import {NgForOf} from './common_with_def';
import {renderComponent, toHtml} from './render_util';

describe('@angular/common integration', () => {
  describe('NgForOf', () => {
    it('should update a loop', () => {
      class MyApp {
        items: string[] = ['first', 'second'];

        static ngComponentDef = defineComponent({
          type: MyApp,
          factory: () => new MyApp(),
          tag: 'my-app',
          // <ul>
          //   <li *ngFor="let item of items">{{item}}</li>
          // </ul>
          template: (myApp: MyApp, cm: boolean) => {
            if (cm) {
              E(0, 'ul');
              { C(1, [NgForOf], liTemplate); }
              e();
            }
            p(1, 'ngForOf', b(myApp.items));
            cR(1);
            r(2, 0);
            cr();

            function liTemplate(row: NgForOfContext<string>, cm: boolean) {
              if (cm) {
                E(0, 'li');
                { T(1); }
                e();
              }
              t(1, b(row.$implicit));
            }
          }
        });
      }

      const myApp = renderComponent(MyApp);
      expect(toHtml(myApp)).toEqual('<ul><li>first</li><li>second</li></ul>');
    });
    // TODO: Test inheritance
  });
});