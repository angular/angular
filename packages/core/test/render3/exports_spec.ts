/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AttributeMarker, defineComponent, defineDirective} from '../../src/render3/index';
import {bind, container, containerRefreshEnd, containerRefreshStart, element, elementAttribute, elementClassProp, elementEnd, elementProperty, elementStart, elementStyling, elementStylingApply, embeddedViewEnd, embeddedViewStart, interpolation2, nextContext, reference, template, text, textBinding} from '../../src/render3/instructions';
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
          text(0);
          element(1, 'input', ['value', 'one'], ['myInput', '']);
        }
        if (rf & RenderFlags.Update) {
          const tmp = reference(2) as any;
          textBinding(0, bind(tmp.value));
        }
      }, 3, 1);

      const fixture = new ComponentFixture(App);
      expect(fixture.html).toEqual('one<input value="one">');
    });


    it('should work with element properties', () => {
      /** <div [title]="myInput.value"</div> <input value="one" #myInput> */
      const App = createComponent('app', function(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          element(0, 'div');
          element(1, 'input', ['value', 'one'], ['myInput', '']);
        }
        if (rf & RenderFlags.Update) {
          const tmp = reference(2) as any;
          elementProperty(0, 'title', bind(tmp.value));
        }
      }, 3, 1);

      const fixture = new ComponentFixture(App);
      expect(fixture.html).toEqual('<div title="one"></div><input value="one">');
    });

    it('should work with element attrs', () => {
      /** <div [attr.aria-label]="myInput.value"</div> <input value="one" #myInput> */
      const App = createComponent('app', function(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          element(0, 'div');
          element(1, 'input', ['value', 'one'], ['myInput', '']);
        }
        if (rf & RenderFlags.Update) {
          const tmp = reference(2) as any;
          elementAttribute(0, 'aria-label', bind(tmp.value));
        }
      }, 3, 1);

      const fixture = new ComponentFixture(App);
      expect(fixture.html).toEqual('<div aria-label="one"></div><input value="one">');
    });

    it('should work with element classes', () => {
      /** <div [class.red]="myInput.checked"</div> <input type="checkbox" checked #myInput> */
      const App = createComponent('app', function(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          elementStart(0, 'div', [AttributeMarker.Classes, 'red']);
          elementStyling(['red']);
          elementEnd();
          element(1, 'input', ['type', 'checkbox', 'checked', 'true'], ['myInput', '']);
        }
        if (rf & RenderFlags.Update) {
          const tmp = reference(2) as any;
          elementClassProp(0, 0, tmp.checked);
          elementStylingApply(0);
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

        static ngComponentDef = defineComponent({
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

        static ngDirectiveDef = defineDirective({
          type: MyDir,
          selectors: [['', 'myDir', '']],
          factory: () => new MyDir,
          inputs: {myDir: 'myDir'}
        });
      }

      /** <div [myDir]="myComp"></div><comp #myComp></comp> */
      const App = createComponent('app', function(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          element(0, 'div', ['myDir', '']);
          element(1, 'comp', null, ['myComp', '']);
        }
        if (rf & RenderFlags.Update) {
          const tmp = reference(2) as any;
          elementProperty(0, 'myDir', bind(tmp));
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

        static ngComponentDef = defineComponent({
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
          text(0);
          text(1);
          element(2, 'comp', null, ['myComp', '']);
          element(4, 'input', ['value', 'one'], ['myInput', '']);
        }
        if (rf & RenderFlags.Update) {
          const tmp1 = reference(3) as any;
          const tmp2 = reference(5) as any;
          textBinding(0, bind(tmp2.value));
          textBinding(1, bind(tmp1.name));
        }
      }, 6, 2, [MyComponent]);

      const fixture = new ComponentFixture(App);
      expect(fixture.html).toEqual('oneNancy<comp></comp><input value="one">');
    });

    it('should work inside a view container', () => {
      const App = createComponent('app', function(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          elementStart(0, 'div');
          { container(1); }
          elementEnd();
        }
        if (rf & RenderFlags.Update) {
          containerRefreshStart(1);
          {
            if (ctx.condition) {
              let rf1 = embeddedViewStart(1, 2, 1);
              {
                if (rf1 & RenderFlags.Create) {
                  text(0);
                  element(1, 'input', ['value', 'one'], ['myInput', '']);
                }
                if (rf1 & RenderFlags.Update) {
                  const tmp = reference(2) as any;
                  textBinding(0, bind(tmp.value));
                }
              }
              embeddedViewEnd();
            }
          }
          containerRefreshEnd();
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
          elementStart(0, 'input', ['value', 'one'], ['outerInput', '']);
          elementEnd();
          template(2, outerTemplate, 5, 2, 'div', [AttributeMarker.Template, 'ngIf']);
        }
        if (rf & RenderFlags.Update) {
          elementProperty(2, 'ngIf', bind(app.outer));
        }
      }, 3, 1, [NgIf]);

      function outerTemplate(rf: RenderFlags, outer: any) {
        if (rf & RenderFlags.Create) {
          elementStart(0, 'div');
          {
            text(1);
            elementStart(2, 'input', ['value', 'two'], ['innerInput', '']);
            elementEnd();
            template(4, innerTemplate, 2, 2, 'div', [AttributeMarker.Template, 'ngIf']);
          }
          elementEnd();
        }

        if (rf & RenderFlags.Update) {
          const app = nextContext();
          const outerInput = reference(1) as any;
          textBinding(1, bind(outerInput.value));
          elementProperty(4, 'ngIf', bind(app.inner));
        }
      }

      function innerTemplate(rf: RenderFlags, inner: any) {
        if (rf & RenderFlags.Create) {
          elementStart(0, 'div');
          { text(1); }
          elementEnd();
        }

        if (rf & RenderFlags.Update) {
          nextContext();
          const innerInput = reference(3) as any;
          nextContext();
          const outerInput = reference(1) as any;
          textBinding(1, interpolation2('', outerInput.value, ' - ', innerInput.value, ''));
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
