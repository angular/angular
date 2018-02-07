/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {C, E, T, V, cR, cr, defineComponent, e, v} from '../../src/render3/index';

import {document, renderComponent} from './render_util';

describe('iv perf test', () => {

  const count = 100000;
  const noOfIterations = 10;

  describe('render', () => {
    for (let iteration = 0; iteration < noOfIterations; iteration++) {
      it(`${iteration}. create ${count} divs in DOM`, () => {
        const start = new Date().getTime();
        const container = document.createElement('div');
        for (let i = 0; i < count; i++) {
          const div = document.createElement('div');
          div.appendChild(document.createTextNode('-'));
          container.appendChild(div);
        }
        const end = new Date().getTime();
        log(`${count} DIVs in DOM`, (end - start) / count);
      });

      it(`${iteration}. create ${count} divs in Render3`, () => {
        class Component {
          static ngComponentDef = defineComponent({
            type: Component,
            tag: 'div',
            template: function Template(ctx: any, cm: any) {
              if (cm) {
                C(0);
              }
              cR(0);
              {
                for (let i = 0; i < count; i++) {
                  let cm0 = V(0);
                  {
                    if (cm0) {
                      E(0, 'div');
                      T(1, '-');
                      e();
                    }
                  }
                  v();
                }
              }
              cr();
            },
            factory: () => new Component
          });
        }

        const start = new Date().getTime();
        renderComponent(Component);
        const end = new Date().getTime();
        log(`${count} DIVs in Render3`, (end - start) / count);
      });
    }
  });
});

function log(text: string, duration: number) {
  // tslint:disable-next-line:no-console
  console.log(text, duration * 1000, 'ns');
}
