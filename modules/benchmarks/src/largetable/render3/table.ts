/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ɵC as C, ɵE as E, ɵRenderFlags as RenderFlags, ɵT as T, ɵV as V, ɵb as b, ɵcR as cR, ɵcr as cr, ɵdefineComponent as defineComponent, ɵdetectChanges as detectChanges, ɵe as e, ɵsn as sn, ɵt as t, ɵv as v} from '@angular/core';
import {ComponentDef} from '@angular/core/src/render3/interfaces/definition';

import {TableCell, buildTable, emptyTable} from '../util';

export class LargeTableComponent {
  data: TableCell[][] = emptyTable;

  /** @nocollapse */
  static ngComponentDef: ComponentDef<LargeTableComponent> = defineComponent({
    type: LargeTableComponent,
    selectors: [['largetable']],
    template: function(rf: RenderFlags, ctx: LargeTableComponent) {
      if (rf & RenderFlags.Create) {
        E(0, 'table');
        {
          E(1, 'tbody');
          { C(2); }
          e();
        }
        e();
      }
      if (rf & RenderFlags.Update) {
        cR(2);
        {
          for (let row of ctx.data) {
            let rf1 = V(1);
            {
              if (rf1 & RenderFlags.Create) {
                E(0, 'tr');
                C(1);
                e();
              }
              if (rf1 & RenderFlags.Update) {
                cR(1);
                {
                  for (let cell of row) {
                    let rf2 = V(2);
                    {
                      if (rf2 & RenderFlags.Create) {
                        E(0, 'td');
                        { T(1); }
                        e();
                      }
                      if (rf2 & RenderFlags.Update) {
                        sn(0, 'background-color', b(cell.row % 2 ? '' : 'grey'));
                        t(1, b(cell.value));
                      }
                    }
                    v();
                  }
                }
                cr();
              }
            }
            v();
          }
        }
        cr();
      }
    },
    factory: () => new LargeTableComponent(),
    inputs: {data: 'data'}
  });
}

export function destroyDom(component: LargeTableComponent) {
  component.data = emptyTable;
  detectChanges(component);
}

export function createDom(component: LargeTableComponent) {
  component.data = buildTable();
  detectChanges(component);
}
