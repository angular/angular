/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Δbind, Δcontainer, ΔcontainerRefreshEnd, ΔcontainerRefreshStart, Δelement, ΔelementEnd, ΔelementStart, ΔembeddedViewEnd, ΔembeddedViewStart, Δreference, Δtext, ΔtextBinding} from '../../src/render3/instructions/all';
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
          ΔelementStart(0, 'div');
          { Δcontainer(1); }
          ΔelementEnd();
        }
        if (rf & RenderFlags.Update) {
          ΔcontainerRefreshStart(1);
          {
            if (ctx.condition) {
              let rf1 = ΔembeddedViewStart(1, 2, 1);
              {
                if (rf1 & RenderFlags.Create) {
                  Δtext(0);
                  Δelement(1, 'input', ['value', 'one'], ['myInput', '']);
                }
                if (rf1 & RenderFlags.Update) {
                  const tmp = Δreference(2) as any;
                  ΔtextBinding(0, Δbind(tmp.value));
                }
              }
              ΔembeddedViewEnd();
            }
          }
          ΔcontainerRefreshEnd();
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
