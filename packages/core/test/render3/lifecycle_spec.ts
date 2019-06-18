/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ComponentTemplate, ɵɵdefineComponent, ɵɵdefineDirective, ɵɵproperty} from '../../src/render3/index';
import {ɵɵcontainer, ɵɵcontainerRefreshEnd, ɵɵcontainerRefreshStart, ɵɵelement, ɵɵelementEnd, ɵɵelementStart, ɵɵembeddedViewEnd, ɵɵembeddedViewStart, ɵɵprojection, ɵɵprojectionDef, ɵɵselect, ɵɵtext} from '../../src/render3/instructions/all';
import {RenderFlags} from '../../src/render3/interfaces/definition';
import {NgIf} from './common_with_def';
import {ComponentFixture, createComponent} from './render_util';

describe('lifecycles', () => {

  function getParentTemplate(name: string) {
    return (rf: RenderFlags, ctx: any) => {
      if (rf & RenderFlags.Create) {
        ɵɵelement(0, name);
      }
      if (rf & RenderFlags.Update) {
        ɵɵselect(0);
        ɵɵproperty('val', ctx.val);
      }
    };
  }

  describe('onInit', () => {
    let events: string[];

    beforeEach(() => { events = []; });

    let Comp = createOnInitComponent('comp', (rf: RenderFlags) => {
      if (rf & RenderFlags.Create) {
        ɵɵprojectionDef();
        ɵɵelementStart(0, 'div');
        { ɵɵprojection(1); }
        ɵɵelementEnd();
      }
    }, 2);
    let Parent = createOnInitComponent('parent', getParentTemplate('comp'), 1, 1, [Comp]);
    let ProjectedComp = createOnInitComponent('projected', (rf: RenderFlags) => {
      if (rf & RenderFlags.Create) {
        ɵɵtext(0, 'content');
      }
    }, 1);

    function createOnInitComponent(
        name: string, template: ComponentTemplate<any>, consts: number, vars: number = 0,
        directives: any[] = []) {
      return class Component {
        val: string = '';
        ngOnInit() {
          if (!this.val) this.val = '';
          events.push(`${name}${this.val}`);
        }

        static ngComponentDef = ɵɵdefineComponent({
          type: Component,
          selectors: [[name]],
          consts: consts,
          vars: vars,
          factory: () => new Component(),
          inputs: {val: 'val'}, template,
          directives: directives
        });
      };
    }

    class Directive {
      ngOnInit() { events.push('dir'); }

      static ngDirectiveDef = ɵɵdefineDirective(
          {type: Directive, selectors: [['', 'dir', '']], factory: () => new Directive()});
    }

    const directives = [Comp, Parent, ProjectedComp, Directive, NgIf];

    it('should call onInit every time a new view is created (if block)', () => {
      /**
       * % if (!skip) {
       *   <comp></comp>
       * % }
       */
      const App = createComponent('app', function(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          ɵɵcontainer(0);
        }
        if (rf & RenderFlags.Update) {
          ɵɵcontainerRefreshStart(0);
          {
            if (!ctx.skip) {
              let rf1 = ɵɵembeddedViewStart(0, 1, 0);
              if (rf1 & RenderFlags.Create) {
                ɵɵelement(0, 'comp');
              }
              ɵɵembeddedViewEnd();
            }
          }
          ɵɵcontainerRefreshEnd();
        }
      }, 1, 0, directives);

      const fixture = new ComponentFixture(App);
      expect(events).toEqual(['comp']);

      fixture.component.skip = true;
      fixture.update();
      expect(events).toEqual(['comp']);

      fixture.component.skip = false;
      fixture.update();
      expect(events).toEqual(['comp', 'comp']);
    });
  });
});
