/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ɵɵcontainer, ɵɵcontainerRefreshEnd, ɵɵcontainerRefreshStart, ɵɵelement, ɵɵelementEnd, ɵɵelementStart, ɵɵembeddedViewEnd, ɵɵembeddedViewStart, ɵɵreference, ɵɵselect, ɵɵtext, ɵɵtextBinding} from '../../src/render3/instructions/all';
import {RenderFlags} from '../../src/render3/interfaces/definition';
import {ComponentFixture, createComponent} from './render_util';

describe('exports', () => {
  // For basic use cases, see core/test/acceptance/exports_spec.ts.

  describe('forward refs', () => {

    /**
     * This test needs to be moved to acceptance/exports_spec.ts
     * when Ivy compiler supports inline views.
     */
    it('should work inside a view container', () => {
      const App = createComponent('app', function(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          ɵɵelementStart(0, 'div');
          { ɵɵcontainer(1); }
          ɵɵelementEnd();
        }
        if (rf & RenderFlags.Update) {
          ɵɵcontainerRefreshStart(1);
          {
            if (ctx.condition) {
              let rf1 = ɵɵembeddedViewStart(1, 2, 1);
              {
                if (rf1 & RenderFlags.Create) {
                  ɵɵtext(0);
                  ɵɵelement(1, 'input', ['value', 'one'], ['myInput', '']);
                }
                if (rf1 & RenderFlags.Update) {
                  const tmp = ɵɵreference(2) as any;
                  ɵɵselect(0);
                  ɵɵtextBinding(tmp.value);
                }
              }
              ɵɵembeddedViewEnd();
            }
          }
          ɵɵcontainerRefreshEnd();
        }
      }, 2);

      const fixture = new ComponentFixture(App);
      fixture.component.condition = true;
      fixture.update();
      expect(fixture.html).toEqual('<div>one<input value="one"></div>');

      fixture.component.condition = false;
      fixture.update();
      expect(fixture.html).toEqual('<div></div>');
    });
  });
});
