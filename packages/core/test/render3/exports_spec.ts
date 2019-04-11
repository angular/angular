/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AttributeMarker, ɵɵdefineComponent, ɵɵdefineDirective} from '../../src/render3/index';
import {ɵɵbind, ɵɵcontainer, ɵɵcontainerRefreshEnd, ɵɵcontainerRefreshStart, ɵɵelement, ɵɵelementAttribute, ɵɵelementClassProp, ɵɵelementEnd, ɵɵelementProperty, ɵɵelementStart, ɵɵelementStyling, ɵɵelementStylingApply, ɵɵembeddedViewEnd, ɵɵembeddedViewStart, ɵɵinterpolation2, ɵɵnextContext, ɵɵreference, ɵɵtemplate, ɵɵtext, ɵɵtextBinding} from '../../src/render3/instructions/all';
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
          ɵɵtext(0);
          ɵɵelement(1, 'input', ['value', 'one'], ['myInput', '']);
        }
        if (rf & RenderFlags.Update) {
          const tmp = ɵɵreference(2) as any;
          ɵɵtextBinding(0, ɵɵbind(tmp.value));
        }
      }, 3, 1);

      const fixture = new ComponentFixture(App);
      expect(fixture.html).toEqual('one<input value="one">');
    });


    it('should work with element properties', () => {
      /** <div [title]="myInput.value"</div> <input value="one" #myInput> */
      const App = createComponent('app', function(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          ɵɵelement(0, 'div');
          ɵɵelement(1, 'input', ['value', 'one'], ['myInput', '']);
        }
        if (rf & RenderFlags.Update) {
          const tmp = ɵɵreference(2) as any;
          ɵɵelementProperty(0, 'title', ɵɵbind(tmp.value));
        }
      }, 3, 1);

      const fixture = new ComponentFixture(App);
      expect(fixture.html).toEqual('<div title="one"></div><input value="one">');
    });

    it('should work with element attrs', () => {
      /** <div [attr.aria-label]="myInput.value"</div> <input value="one" #myInput> */
      const App = createComponent('app', function(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          ɵɵelement(0, 'div');
          ɵɵelement(1, 'input', ['value', 'one'], ['myInput', '']);
        }
        if (rf & RenderFlags.Update) {
          const tmp = ɵɵreference(2) as any;
          ɵɵelementAttribute(0, 'aria-label', ɵɵbind(tmp.value));
        }
      }, 3, 1);

      const fixture = new ComponentFixture(App);
      expect(fixture.html).toEqual('<div aria-label="one"></div><input value="one">');
    });

    it('should work with element classes', () => {
      /** <div [class.red]="myInput.checked"</div> <input type="checkbox" checked #myInput> */
      const App = createComponent('app', function(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          ɵɵelementStart(0, 'div', [AttributeMarker.Classes, 'red']);
          ɵɵelementStyling(['red']);
          ɵɵelementEnd();
          ɵɵelement(1, 'input', ['type', 'checkbox', 'checked', 'true'], ['myInput', '']);
        }
        if (rf & RenderFlags.Update) {
          const tmp = ɵɵreference(2) as any;
          ɵɵelementClassProp(0, 0, tmp.checked);
          ɵɵelementStylingApply(0);
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

        static ngComponentDef = ɵɵdefineComponent({
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

        static ngDirectiveDef = ɵɵdefineDirective({
          type: MyDir,
          selectors: [['', 'myDir', '']],
          factory: () => new MyDir,
          inputs: {myDir: 'myDir'}
        });
      }

      /** <div [myDir]="myComp"></div><comp #myComp></comp> */
      const App = createComponent('app', function(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          ɵɵelement(0, 'div', ['myDir', '']);
          ɵɵelement(1, 'comp', null, ['myComp', '']);
        }
        if (rf & RenderFlags.Update) {
          const tmp = ɵɵreference(2) as any;
          ɵɵelementProperty(0, 'myDir', ɵɵbind(tmp));
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

        static ngComponentDef = ɵɵdefineComponent({
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
          ɵɵtext(0);
          ɵɵtext(1);
          ɵɵelement(2, 'comp', null, ['myComp', '']);
          ɵɵelement(4, 'input', ['value', 'one'], ['myInput', '']);
        }
        if (rf & RenderFlags.Update) {
          const tmp1 = ɵɵreference(3) as any;
          const tmp2 = ɵɵreference(5) as any;
          ɵɵtextBinding(0, ɵɵbind(tmp2.value));
          ɵɵtextBinding(1, ɵɵbind(tmp1.name));
        }
      }, 6, 2, [MyComponent]);

      const fixture = new ComponentFixture(App);
      expect(fixture.html).toEqual('oneNancy<comp></comp><input value="one">');
    });

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
                  ɵɵtextBinding(0, ɵɵbind(tmp.value));
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
          ɵɵelementStart(0, 'input', ['value', 'one'], ['outerInput', '']);
          ɵɵelementEnd();
          ɵɵtemplate(2, outerTemplate, 5, 2, 'div', [AttributeMarker.Template, 'ngIf']);
        }
        if (rf & RenderFlags.Update) {
          ɵɵelementProperty(2, 'ngIf', ɵɵbind(app.outer));
        }
      }, 3, 1, [NgIf]);

      function outerTemplate(rf: RenderFlags, outer: any) {
        if (rf & RenderFlags.Create) {
          ɵɵelementStart(0, 'div');
          {
            ɵɵtext(1);
            ɵɵelementStart(2, 'input', ['value', 'two'], ['innerInput', '']);
            ɵɵelementEnd();
            ɵɵtemplate(4, innerTemplate, 2, 2, 'div', [AttributeMarker.Template, 'ngIf']);
          }
          ɵɵelementEnd();
        }

        if (rf & RenderFlags.Update) {
          const app = ɵɵnextContext();
          const outerInput = ɵɵreference(1) as any;
          ɵɵtextBinding(1, ɵɵbind(outerInput.value));
          ɵɵelementProperty(4, 'ngIf', ɵɵbind(app.inner));
        }
      }

      function innerTemplate(rf: RenderFlags, inner: any) {
        if (rf & RenderFlags.Create) {
          ɵɵelementStart(0, 'div');
          { ɵɵtext(1); }
          ɵɵelementEnd();
        }

        if (rf & RenderFlags.Update) {
          ɵɵnextContext();
          const innerInput = ɵɵreference(3) as any;
          ɵɵnextContext();
          const outerInput = ɵɵreference(1) as any;
          ɵɵtextBinding(1, ɵɵinterpolation2('', outerInput.value, ' - ', innerInput.value, ''));
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
