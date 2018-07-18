/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AttributeMarker, defineComponent, defineDirective} from '../../src/render3/index';
import {bind, container, containerRefreshEnd, containerRefreshStart, element, elementAttribute, elementClassProp, elementEnd, elementProperty, elementStart, elementStyling, elementStylingApply, embeddedViewEnd, embeddedViewStart, interpolation2, load, reference, text, textBinding} from '../../src/render3/instructions';
import {InitialStylingFlags, RenderFlags} from '../../src/render3/interfaces/definition';

import {NgIf} from './common_with_def';
import {ComponentFixture, createComponent, renderToHtml} from './render_util';

describe('exports', () => {
  it('should support export of DOM element', () => {

    /** <input value="one" #myInput> {{ myInput.value }} */
    function Template(rf: RenderFlags, ctx: any) {
      if (rf & RenderFlags.Create) {
        element(0, 'input', ['value', 'one'], ['myInput', '']);
        text(2);
      }
      if (rf & RenderFlags.Update) {
        const tmp = load(1) as any;
        textBinding(2, tmp.value);
      }
    }

    expect(renderToHtml(Template, {})).toEqual('<input value="one">one');
  });

  it('should support basic export of component', () => {

    /** <comp #myComp></comp> {{ myComp.name }} */
    function Template(rf: RenderFlags, ctx: any) {
      if (rf & RenderFlags.Create) {
        element(0, 'comp', null, ['myComp', '']);
        text(2);
      }
      if (rf & RenderFlags.Update) {
        const tmp = load(1) as any;
        textBinding(2, tmp.name);
      }
    }

    class MyComponent {
      name = 'Nancy';

      static ngComponentDef = defineComponent({
        type: MyComponent,
        selectors: [['comp']],
        template: function() {},
        factory: () => new MyComponent
      });
    }

    expect(renderToHtml(Template, {}, [MyComponent])).toEqual('<comp></comp>Nancy');
  });

  it('should support component instance fed into directive', () => {

    let myComponent: MyComponent;
    let myDir: MyDir;
    class MyComponent {
      constructor() { myComponent = this; }
      static ngComponentDef = defineComponent({
        type: MyComponent,
        selectors: [['comp']],
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
    function Template(rf: RenderFlags, ctx: any) {
      if (rf & RenderFlags.Create) {
        element(0, 'comp', null, ['myComp', '']);
        element(2, 'div', ['myDir', '']);
      }
      if (rf & RenderFlags.Update) {
        const tmp = load(1) as any;
        elementProperty(2, 'myDir', bind(tmp));
      }
    }

    renderToHtml(Template, {}, defs);
    expect(myDir !.myDir).toEqual(myComponent !);
  });

  it('should work with directives with exportAs set', () => {

    /** <div someDir #myDir="someDir"></div> {{ myDir.name }} */
    function Template(rf: RenderFlags, ctx: any) {
      if (rf & RenderFlags.Create) {
        element(0, 'div', ['someDir', ''], ['myDir', 'someDir']);
        text(2);
      }
      if (rf & RenderFlags.Update) {
        const tmp = load(1) as any;
        textBinding(2, tmp.name);
      }
    }

    class SomeDir {
      name = 'Drew';
      static ngDirectiveDef = defineDirective({
        type: SomeDir,
        selectors: [['', 'someDir', '']],
        factory: () => new SomeDir,
        exportAs: 'someDir'
      });
    }

    expect(renderToHtml(Template, {}, [SomeDir])).toEqual('<div somedir=""></div>Drew');
  });

  it('should throw if export name is not found', () => {

    /** <div #myDir="someDir"></div> */
    const App = createComponent('app', function(rf: RenderFlags, ctx: any) {
      if (rf & RenderFlags.Create) {
        element(0, 'div', null, ['myDir', 'someDir']);
      }
    });

    expect(() => {
      const fixture = new ComponentFixture(App);
    }).toThrowError(/Export of name 'someDir' not found!/);
  });

  describe('forward refs', () => {
    it('should work with basic text bindings', () => {
      /** {{ myInput.value}} <input value="one" #myInput> */
      function Template(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          text(0);
          element(1, 'input', ['value', 'one'], ['myInput', '']);
        }
        if (rf & RenderFlags.Update) {
          const tmp = load(2) as any;
          textBinding(0, bind(tmp.value));
        }
      }

      expect(renderToHtml(Template, {})).toEqual('one<input value="one">');
    });


    it('should work with element properties', () => {
      /** <div [title]="myInput.value"</div> <input value="one" #myInput> */
      function Template(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          element(0, 'div');
          element(1, 'input', ['value', 'one'], ['myInput', '']);
        }
        if (rf & RenderFlags.Update) {
          const tmp = load(2) as any;
          elementProperty(0, 'title', bind(tmp.value));
        }
      }

      expect(renderToHtml(Template, {})).toEqual('<div title="one"></div><input value="one">');
    });

    it('should work with element attrs', () => {
      /** <div [attr.aria-label]="myInput.value"</div> <input value="one" #myInput> */
      function Template(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          element(0, 'div');
          element(1, 'input', ['value', 'one'], ['myInput', '']);
        }
        if (rf & RenderFlags.Update) {
          const tmp = load(2) as any;
          elementAttribute(0, 'aria-label', bind(tmp.value));
        }
      }

      expect(renderToHtml(Template, {})).toEqual('<div aria-label="one"></div><input value="one">');
    });

    it('should work with element classes', () => {
      /** <div [class.red]="myInput.checked"</div> <input type="checkbox" checked #myInput> */
      function Template(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          elementStart(0, 'div');
          elementStyling([InitialStylingFlags.VALUES_MODE, 'red', true]);
          elementEnd();
          element(1, 'input', ['type', 'checkbox', 'checked', 'true'], ['myInput', '']);
        }
        if (rf & RenderFlags.Update) {
          const tmp = load(2) as any;
          elementClassProp(0, 0, tmp.checked);
          elementStylingApply(0);
        }
      }

      expect(renderToHtml(Template, {}))
          .toEqual('<div class="red"></div><input checked="true" type="checkbox">');
    });

    it('should work with component refs', () => {

      let myComponent: MyComponent;
      let myDir: MyDir;

      class MyComponent {
        constructor() { myComponent = this; }

        static ngComponentDef = defineComponent({
          type: MyComponent,
          selectors: [['comp']],
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
      function Template(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          element(0, 'div', ['myDir', '']);
          element(1, 'comp', null, ['myComp', '']);
        }
        if (rf & RenderFlags.Update) {
          const tmp = load(2) as any;
          elementProperty(0, 'myDir', bind(tmp));
        }
      }

      renderToHtml(Template, {}, [MyComponent, MyDir]);
      expect(myDir !.myDir).toEqual(myComponent !);
    });

    it('should work with multiple forward refs', () => {
      /** {{ myInput.value }} {{ myComp.name }} <comp #myComp></comp> <input value="one" #myInput>
       */
      function Template(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          text(0);
          text(1);
          element(2, 'comp', null, ['myComp', '']);
          element(4, 'input', ['value', 'one'], ['myInput', '']);
        }
        if (rf & RenderFlags.Update) {
          const tmp1 = load(3) as any;
          const tmp2 = load(5) as any;
          textBinding(0, bind(tmp2.value));
          textBinding(1, bind(tmp1.name));
        }
      }

      let myComponent: MyComponent;

      class MyComponent {
        name = 'Nancy';

        constructor() { myComponent = this; }

        static ngComponentDef = defineComponent({
          type: MyComponent,
          selectors: [['comp']],
          template: function() {},
          factory: () => new MyComponent
        });
      }
      expect(renderToHtml(Template, {}, [MyComponent]))
          .toEqual('oneNancy<comp></comp><input value="one">');
    });

    it('should work inside a view container', () => {
      function Template(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          elementStart(0, 'div');
          { container(1); }
          elementEnd();
        }
        if (rf & RenderFlags.Update) {
          containerRefreshStart(1);
          {
            if (ctx.condition) {
              let rf1 = embeddedViewStart(1);
              {
                if (rf1 & RenderFlags.Create) {
                  text(0);
                  element(1, 'input', ['value', 'one'], ['myInput', '']);
                }
                if (rf1 & RenderFlags.Update) {
                  const tmp = load(2) as any;
                  textBinding(0, bind(tmp.value));
                }
              }
              embeddedViewEnd();
            }
          }
          containerRefreshEnd();
        }
      }

      expect(renderToHtml(Template, {
        condition: true
      })).toEqual('<div>one<input value="one"></div>');
      expect(renderToHtml(Template, {condition: false})).toEqual('<div></div>');
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
          container(2, outerTemplate, '', [AttributeMarker.SelectOnly, 'ngIf']);
        }
        if (rf & RenderFlags.Update) {
          elementProperty(2, 'ngIf', bind(app.outer));
        }
      }, [NgIf]);

      function outerTemplate(rf: RenderFlags, outer: any, app: any) {
        if (rf & RenderFlags.Create) {
          elementStart(0, 'div');
          {
            text(1);
            elementStart(2, 'input', ['value', 'two'], ['innerInput', '']);
            elementEnd();
            container(4, innerTemplate, '', [AttributeMarker.SelectOnly, 'ngIf']);
          }
          elementEnd();
        }

        const outerInput = reference(1, 1) as any;
        if (rf & RenderFlags.Update) {
          textBinding(1, bind(outerInput.value));
          elementProperty(4, 'ngIf', bind(app.inner));
        }
      }

      function innerTemplate(rf: RenderFlags, inner: any, outer: any, app: any) {
        if (rf & RenderFlags.Create) {
          elementStart(0, 'div');
          { text(1); }
          elementEnd();
        }

        const outerInput = reference(2, 1) as any;
        const innerInput = reference(1, 3) as any;
        if (rf & RenderFlags.Update) {
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
