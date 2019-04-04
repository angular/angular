/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AttributeMarker, ΔdefineComponent, ΔdefineDirective} from '../../src/render3/index';
import {Δbind, Δcontainer, ΔcontainerRefreshEnd, ΔcontainerRefreshStart, Δelement, ΔelementAttribute, ΔelementClassProp, ΔelementEnd, ΔelementProperty, ΔelementStart, ΔelementStyling, ΔelementStylingApply, ΔembeddedViewEnd, ΔembeddedViewStart, Δinterpolation2, ΔnextContext, Δreference, Δtemplate, Δtext, ΔtextBinding} from '../../src/render3/instructions/all';
import {RenderFlags} from '../../src/render3/interfaces/definition';

import {NgIf} from './common_with_def';
import {ComponentFixture, createComponent, renderToHtml} from './render_util';

describe('exports', () => {
  // For basic use cases, see core/test/acceptance/exports_spec.ts.

  describe('forward refs', () => {
    it('should work with basic text bindings', () => {
      /** {{ myInput.value}} <input value="one" #myInput> */
      const App = createComponent('app', function(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          Δtext(0);
          Δelement(1, 'input', ['value', 'one'], ['myInput', '']);
        }
        if (rf & RenderFlags.Update) {
          const tmp = Δreference(2) as any;
          ΔtextBinding(0, Δbind(tmp.value));
        }
      }, 3, 1);

      const fixture = new ComponentFixture(App);
      expect(fixture.html).toEqual('one<input value="one">');
    });


    it('should work with element properties', () => {
      /** <div [title]="myInput.value"</div> <input value="one" #myInput> */
      const App = createComponent('app', function(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          Δelement(0, 'div');
          Δelement(1, 'input', ['value', 'one'], ['myInput', '']);
        }
        if (rf & RenderFlags.Update) {
          const tmp = Δreference(2) as any;
          ΔelementProperty(0, 'title', Δbind(tmp.value));
        }
      }, 3, 1);

      const fixture = new ComponentFixture(App);
      expect(fixture.html).toEqual('<div title="one"></div><input value="one">');
    });

    it('should work with element attrs', () => {
      /** <div [attr.aria-label]="myInput.value"</div> <input value="one" #myInput> */
      const App = createComponent('app', function(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          Δelement(0, 'div');
          Δelement(1, 'input', ['value', 'one'], ['myInput', '']);
        }
        if (rf & RenderFlags.Update) {
          const tmp = Δreference(2) as any;
          ΔelementAttribute(0, 'aria-label', Δbind(tmp.value));
        }
      }, 3, 1);

      const fixture = new ComponentFixture(App);
      expect(fixture.html).toEqual('<div aria-label="one"></div><input value="one">');
    });

    it('should work with element classes', () => {
      /** <div [class.red]="myInput.checked"</div> <input type="checkbox" checked #myInput> */
      const App = createComponent('app', function(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          ΔelementStart(0, 'div', [AttributeMarker.Classes, 'red']);
          ΔelementStyling(['red']);
          ΔelementEnd();
          Δelement(1, 'input', ['type', 'checkbox', 'checked', 'true'], ['myInput', '']);
        }
        if (rf & RenderFlags.Update) {
          const tmp = Δreference(2) as any;
          ΔelementClassProp(0, 0, tmp.checked);
          ΔelementStylingApply(0);
        }
      }, 3);

      const fixture = new ComponentFixture(App);
      expect(fixture.html).toEqual('<div class="red"></div><input checked="true" type="checkbox">');
    });

    it('should work with component refs', () => {

      let myComponent: MyComponent;
      let myDir: MyDir;

      class MyComponent {
        constructor() { myComponent = this; }

        static ngComponentDef = ΔdefineComponent({
          type: MyComponent,
          selectors: [['comp']],
          consts: 0,
          vars: 0,
          template: function(rf: RenderFlags, ctx: MyComponent) {},
          factory: () => new MyComponent
        });
      }

      class MyDir {
        // TODO(issue/24571): remove '!'.
        myDir !: MyComponent;

        constructor() { myDir = this; }

        static ngDirectiveDef = ΔdefineDirective({
          type: MyDir,
          selectors: [['', 'myDir', '']],
          factory: () => new MyDir,
          inputs: {myDir: 'myDir'}
        });
      }

      /** <div [myDir]="myComp"></div><comp #myComp></comp> */
      const App = createComponent('app', function(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          Δelement(0, 'div', ['myDir', '']);
          Δelement(1, 'comp', null, ['myComp', '']);
        }
        if (rf & RenderFlags.Update) {
          const tmp = Δreference(2) as any;
          ΔelementProperty(0, 'myDir', Δbind(tmp));
        }
      }, 3, 1, [MyComponent, MyDir]);

      const fixture = new ComponentFixture(App);
      expect(myDir !.myDir).toEqual(myComponent !);
    });

    it('should work with multiple forward refs', () => {
      let myComponent: MyComponent;

      class MyComponent {
        name = 'Nancy';

        constructor() { myComponent = this; }

        static ngComponentDef = ΔdefineComponent({
          type: MyComponent,
          selectors: [['comp']],
          consts: 0,
          vars: 0,
          template: function() {},
          factory: () => new MyComponent
        });
      }

      /** {{ myInput.value }} {{ myComp.name }} <comp #myComp></comp> <input value="one" #myInput>
       */
      const App = createComponent('app', function(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          Δtext(0);
          Δtext(1);
          Δelement(2, 'comp', null, ['myComp', '']);
          Δelement(4, 'input', ['value', 'one'], ['myInput', '']);
        }
        if (rf & RenderFlags.Update) {
          const tmp1 = Δreference(3) as any;
          const tmp2 = Δreference(5) as any;
          ΔtextBinding(0, Δbind(tmp2.value));
          ΔtextBinding(1, Δbind(tmp1.name));
        }
      }, 6, 2, [MyComponent]);

      const fixture = new ComponentFixture(App);
      expect(fixture.html).toEqual('oneNancy<comp></comp><input value="one">');
    });

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

    it('should support local refs in nested dynamic views', () => {
      /**
       * <input value="one" #outerInput>
       * <div *ngIf="outer">
       *     {{ outerInput.value }}
       *
       *     <input value = "two" #innerInput>
       *
       *     <div *ngIf="inner">
       *         {{ outerInput.value }} - {{ innerInput.value}}
       *     </div>
       * </div>
       */
      const App = createComponent('app', function(rf: RenderFlags, app: any) {
        if (rf & RenderFlags.Create) {
          ΔelementStart(0, 'input', ['value', 'one'], ['outerInput', '']);
          ΔelementEnd();
          Δtemplate(2, outerTemplate, 5, 2, 'div', [AttributeMarker.Template, 'ngIf']);
        }
        if (rf & RenderFlags.Update) {
          ΔelementProperty(2, 'ngIf', Δbind(app.outer));
        }
      }, 3, 1, [NgIf]);

      function outerTemplate(rf: RenderFlags, outer: any) {
        if (rf & RenderFlags.Create) {
          ΔelementStart(0, 'div');
          {
            Δtext(1);
            ΔelementStart(2, 'input', ['value', 'two'], ['innerInput', '']);
            ΔelementEnd();
            Δtemplate(4, innerTemplate, 2, 2, 'div', [AttributeMarker.Template, 'ngIf']);
          }
          ΔelementEnd();
        }

        if (rf & RenderFlags.Update) {
          const app = ΔnextContext();
          const outerInput = Δreference(1) as any;
          ΔtextBinding(1, Δbind(outerInput.value));
          ΔelementProperty(4, 'ngIf', Δbind(app.inner));
        }
      }

      function innerTemplate(rf: RenderFlags, inner: any) {
        if (rf & RenderFlags.Create) {
          ΔelementStart(0, 'div');
          { Δtext(1); }
          ΔelementEnd();
        }

        if (rf & RenderFlags.Update) {
          ΔnextContext();
          const innerInput = Δreference(3) as any;
          ΔnextContext();
          const outerInput = Δreference(1) as any;
          ΔtextBinding(1, Δinterpolation2('', outerInput.value, ' - ', innerInput.value, ''));
        }
      }

      const fixture = new ComponentFixture(App);
      fixture.component.outer = true;
      fixture.component.inner = true;
      fixture.update();
      expect(fixture.html)
          .toEqual(`<input value="one"><div>one<input value="two"><div>one - two</div></div>`);
    });

  });
});
