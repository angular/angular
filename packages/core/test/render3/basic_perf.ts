/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ɵɵdefineComponent} from '../../src/render3/index';
import {ɵɵcontainer, ɵɵcontainerRefreshEnd, ɵɵcontainerRefreshStart, ɵɵelementEnd, ɵɵelementStart, ɵɵembeddedViewEnd, ɵɵembeddedViewStart, ɵɵtext} from '../../src/render3/instructions/all';
import {RenderFlags} from '../../src/render3/interfaces/definition';

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
          static ngComponentDef = ɵɵdefineComponent({
            type: Component,
            selectors: [['div']],
            consts: 1,
            vars: 0,
            template: function Template(rf: RenderFlags, ctx: any) {
              if (rf & RenderFlags.Create) {
                ɵɵcontainer(0);
              }
              if (rf & RenderFlags.Update) {
                ɵɵcontainerRefreshStart(0);
                {
                  for (let i = 0; i < count; i++) {
                    let rf0 = ɵɵembeddedViewStart(0, 2, 0);
                    {
                      if (rf0 & RenderFlags.Create) {
                        ɵɵelementStart(0, 'div');
                        ɵɵtext(1, '-');
                        ɵɵelementEnd();
                      }
                    }
                    ɵɵembeddedViewEnd();
                  }
                }
                ɵɵcontainerRefreshEnd();
              }
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
