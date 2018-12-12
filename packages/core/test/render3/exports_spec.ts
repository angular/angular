/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AttributeMarker, defineComponent, defineDirective} from '../../src/render3/index';
import {bind, container, containerRefreshEnd, containerRefreshStart, element, elementAttribute, elementClassProp, elementEnd, elementProperty, elementStart, elementStyling, elementStylingApply, embeddedViewEnd, embeddedViewStart, interpolation2, nextContext, reference, template, text, textBinding} from '../../src/render3/instructions';
import {InitialStylingFlags, RenderFlags} from '../../src/render3/interfaces/definition';

import {NgIf} from './common_with_def';
import {ComponentFixture, createComponent, renderToHtml} from './render_util';

describe('exports', () => {
  it('should support export of DOM element', () => {

    /** <input value="one" #myInput> {{ myInput.value }} */
    const App = createComponent('app', function(rf: RenderFlags, ctx: any) {
      if (rf & RenderFlags.Create) {
        element(0, 'input', ['value', 'one'], ['myInput', '']);
        text(2);
      }
      if (rf & RenderFlags.Update) {
        const tmp = reference(1) as any;
        textBinding(2, bind(tmp.value));
      }
    }, 3, 1);

    const fixture = new ComponentFixture(App);
    expect(fixture.html).toEqual('<input value="one">one');
  });

  it('should support basic export of component', () => {
    class MyComponent {
      name = 'Nancy';

      static ngComponentDef = defineComponent({
        type: MyComponent,
        selectors: [['comp']],
        consts: 0,
        vars: 0,
        template: function() {},
        factory: () => new MyComponent
      });
    }

    /** <comp #myComp></comp> {{ myComp.name }} */
    const App = createComponent('app', function(rf: RenderFlags, ctx: any) {
      if (rf & RenderFlags.Create) {
        element(0, 'comp', null, ['myComp', '']);
        text(2);
      }
      if (rf & RenderFlags.Update) {
        const tmp = reference(1) as any;
        textBinding(2, tmp.name);
      }
    }, 3, 1, [MyComponent]);

    const fixture = new ComponentFixture(App);
    expect(fixture.html).toEqual('<comp></comp>Nancy');
  });

  it('should support component instance fed into directive', () => {

    let myComponent: MyComponent;
    let myDir: MyDir;
    class MyComponent {
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

    const defs = [MyComponent, MyDir];

    /** <comp #myComp></comp> <div [myDir]="myComp"></div> */
    const App = createComponent('app', function(rf: RenderFlags, ctx: any) {
      if (rf & RenderFlags.Create) {
        element(0, 'comp', null, ['myComp', '']);
        element(2, 'div', ['myDir', '']);
      }
      if (rf & RenderFlags.Update) {
        const tmp = reference(1) as any;
        elementProperty(2, 'myDir', bind(tmp));
      }
    }, 3, 1, defs);

    const fixture = new ComponentFixture(App);
    expect(myDir !.myDir).toEqual(myComponent !);
  });

  it('should work with directives with exportAs set', () => {
    class SomeDir {
      name = 'Drew';
      static ngDirectiveDef = defineDirective({
        type: SomeDir,
        selectors: [['', 'someDir', '']],
        factory: () => new SomeDir,
        exportAs: 'someDir'
      });
    }

    /** <div someDir #myDir="someDir"></div> {{ myDir.name }} */
    const App = createComponent('app', function(rf: RenderFlags, ctx: any) {
      if (rf & RenderFlags.Create) {
        element(0, 'div', ['someDir', ''], ['myDir', 'someDir']);
        text(2);
      }
      if (rf & RenderFlags.Update) {
        const tmp = reference(1) as any;
        textBinding(2, bind(tmp.name));
      }
    }, 3, 1, [SomeDir]);

    const fixture = new ComponentFixture(App);
    expect(fixture.html).toEqual('<div somedir=""></div>Drew');
  });

  it('should throw if export name is not found', () => {

    /** <div #myDir="someDir"></div> */
    const App = createComponent('app', function(rf: RenderFlags, ctx: any) {
      if (rf & RenderFlags.Create) {
        element(0, 'div', null, ['myDir', 'someDir']);
      }
    }, 1);

    expect(() => {
      const fixture = new ComponentFixture(App);
    }).toThrowError(/Export of name 'someDir' not found!/);
  });

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
          elementStart(0, 'div');
          elementStyling([InitialStylingFlags.VALUES_MODE, 'red', true]);
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
          template(2, outerTemplate, 5, 2, 'div', [AttributeMarker.SelectOnly, 'ngIf']);
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
            template(4, innerTemplate, 2, 2, 'div', [AttributeMarker.SelectOnly, 'ngIf']);
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
