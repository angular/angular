/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ɵRenderFlags, ɵbind, ɵcontainer, ɵcontainerRefreshEnd, ɵcontainerRefreshStart, ɵdefineComponent, ɵdetectChanges, ɵelementEnd, ɵelementStart, ɵelementStyling, ɵelementStylingProp, ɵembeddedViewEnd, ɵembeddedViewStart, ɵtext, ɵtextBinding as ɵtextBinding} from '@angular/core';
import {ComponentDefInternal} from '@angular/core/src/render3/interfaces/definition';

import {TableCell, buildTable, emptyTable} from '../util';

const c0 = ['background-color'];
export class LargeTableComponent {
  data: TableCell[][] = emptyTable;

  /** @nocollapse */
  static ngComponentDef: ComponentDefInternal<LargeTableComponent> = ɵdefineComponent({
    type: LargeTableComponent,
    selectors: [['largetable']],
    consts: 3,
    vars: 0,
    template: function(rf: ɵRenderFlags, ctx: LargeTableComponent) {
      if (rf & ɵRenderFlags.Create) {
        ɵelementStart(0, 'table');
        {
          ɵelementStart(1, 'tbody');
          { ɵcontainer(2); }
          ɵelementEnd();
        }
        ɵelementEnd();
      }
      if (rf & ɵRenderFlags.Update) {
        ɵcontainerRefreshStart(2);
        {
          for (let row of ctx.data) {
            let rf1 = ɵembeddedViewStart(1, 2, 0);
            {
              if (rf1 & ɵRenderFlags.Create) {
                ɵelementStart(0, 'tr');
                ɵcontainer(1);
                ɵelementEnd();
              }
              if (rf1 & ɵRenderFlags.Update) {
                ɵcontainerRefreshStart(1);
                {
                  for (let cell of row) {
                    let rf2 = ɵembeddedViewStart(2, 2, 1);
                    {
                      if (rf2 & ɵRenderFlags.Create) {
                        ɵelementStart(0, 'td');
                        ɵelementStyling(null, c0);
                        { ɵtext(1); }
                        ɵelementEnd();
                      }
                      if (rf2 & ɵRenderFlags.Update) {
                        ɵelementStylingProp(0, 0, null, cell.row % 2 ? '' : 'grey');
                        ɵtextBinding(1, ɵbind(cell.value));
                      }
                    }
                    ɵembeddedViewEnd();
                  }
                }
                ɵcontainerRefreshEnd();
              }
            }
            ɵembeddedViewEnd();
          }
        }
        ɵcontainerRefreshEnd();
      }
    },
    factory: () => new LargeTableComponent(),
    inputs: {data: 'data'}
  });
}

export function destroyDom(component: LargeTableComponent) {
  component.data = emptyTable;
  ɵdetectChanges(component);
}

export function createDom(component: LargeTableComponent) {
  component.data = buildTable();
  ɵdetectChanges(component);
}
