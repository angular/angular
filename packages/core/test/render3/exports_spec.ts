/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {defineComponent, defineDirective} from '../../src/render3/index';
import {bind, container, containerRefreshEnd, containerRefreshStart, elementAttribute, elementClassNamed, elementEnd, elementProperty, elementStart, embeddedViewEnd, embeddedViewStart, load, text, textBinding} from '../../src/render3/instructions';

import {ComponentFixture, createComponent, renderToHtml} from './render_util';

describe('exports', () => {
  it('should support export of DOM element', () => {

    /** <input value="one" #myInput> {{ myInput.value }} */
    function Template(ctx: any, cm: boolean) {
      if (cm) {
        elementStart(0, 'input', ['value', 'one'], ['myInput', '']);
        elementEnd();
        text(2);
      }
      const tmp = load(1) as any;
      textBinding(2, tmp.value);
    }

    expect(renderToHtml(Template, {})).toEqual('<input value="one">one');
  });

  it('should support basic export of component', () => {

    /** <comp #myComp></comp> {{ myComp.name }} */
    function Template(ctx: any, cm: boolean) {
      if (cm) {
        elementStart(0, 'comp', null, ['myComp', '']);
        elementEnd();
        text(2);
      }
      const tmp = load(1) as any;
      textBinding(2, tmp.name);
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
      myDir: MyComponent;
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
    function Template(ctx: any, cm: boolean) {
      if (cm) {
        elementStart(0, 'comp', null, ['myComp', '']);
        elementEnd();
        elementStart(2, 'div', ['myDir', '']);
        elementEnd();
      }
      const tmp = load(1) as any;
      elementProperty(2, 'myDir', bind(tmp));
    }

    renderToHtml(Template, {}, defs);
    expect(myDir !.myDir).toEqual(myComponent !);
  });

  it('should work with directives with exportAs set', () => {

    /** <div someDir #myDir="someDir"></div> {{ myDir.name }} */
    function Template(ctx: any, cm: boolean) {
      if (cm) {
        elementStart(0, 'div', ['someDir', ''], ['myDir', 'someDir']);
        elementEnd();
        text(2);
      }
      const tmp = load(1) as any;
      textBinding(2, tmp.name);
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
    const App = createComponent('app', function(ctx: any, cm: boolean) {
      if (cm) {
        elementStart(0, 'div', null, ['myDir', 'someDir']);
        elementEnd();
      }
    });

    expect(() => {
      const fixture = new ComponentFixture(App);
    }).toThrowError(/Export of name 'someDir' not found!/);
  });

  describe('forward refs', () => {
    it('should work with basic text bindings', () => {
      /** {{ myInput.value}} <input value="one" #myInput> */
      function Template(ctx: any, cm: boolean) {
        if (cm) {
          text(0);
          elementStart(1, 'input', ['value', 'one'], ['myInput', '']);
          elementEnd();
        }
        const tmp = load(2) as any;
        textBinding(0, bind(tmp.value));
      }

      expect(renderToHtml(Template, {})).toEqual('one<input value="one">');
    });


    it('should work with element properties', () => {
      /** <div [title]="myInput.value"</div> <input value="one" #myInput> */
      function Template(ctx: any, cm: boolean) {
        if (cm) {
          elementStart(0, 'div');
          elementEnd();
          elementStart(1, 'input', ['value', 'one'], ['myInput', '']);
          elementEnd();
        }
        const tmp = load(2) as any;
        elementProperty(0, 'title', bind(tmp.value));
      }

      expect(renderToHtml(Template, {})).toEqual('<div title="one"></div><input value="one">');
    });

    it('should work with element attrs', () => {
      /** <div [attr.aria-label]="myInput.value"</div> <input value="one" #myInput> */
      function Template(ctx: any, cm: boolean) {
        if (cm) {
          elementStart(0, 'div');
          elementEnd();
          elementStart(1, 'input', ['value', 'one'], ['myInput', '']);
          elementEnd();
        }
        const tmp = load(2) as any;
        elementAttribute(0, 'aria-label', bind(tmp.value));
      }

      expect(renderToHtml(Template, {})).toEqual('<div aria-label="one"></div><input value="one">');
    });

    it('should work with element classes', () => {
      /** <div [class.red]="myInput.checked"</div> <input type="checkbox" checked #myInput> */
      function Template(ctx: any, cm: boolean) {
        if (cm) {
          elementStart(0, 'div');
          elementEnd();
          elementStart(1, 'input', ['type', 'checkbox', 'checked', 'true'], ['myInput', '']);
          elementEnd();
        }
        const tmp = load(2) as any;
        elementClassNamed(0, 'red', bind(tmp.checked));
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
          template: function(ctx: MyComponent, cm: boolean) {},
          factory: () => new MyComponent
        });
      }

      class MyDir {
        myDir: MyComponent;

        constructor() { myDir = this; }

        static ngDirectiveDef = defineDirective({
          type: MyDir,
          selectors: [['', 'myDir', '']],
          factory: () => new MyDir,
          inputs: {myDir: 'myDir'}
        });
      }

      /** <div [myDir]="myComp"></div><comp #myComp></comp> */
      function Template(ctx: any, cm: boolean) {
        if (cm) {
          elementStart(0, 'div', ['myDir', '']);
          elementEnd();
          elementStart(1, 'comp', null, ['myComp', '']);
          elementEnd();
        }
        const tmp = load(2) as any;
        elementProperty(0, 'myDir', bind(tmp));
      }

      renderToHtml(Template, {}, [MyComponent, MyDir]);
      expect(myDir !.myDir).toEqual(myComponent !);
    });

    it('should work with multiple forward refs', () => {
      /** {{ myInput.value }} {{ myComp.name }} <comp #myComp></comp> <input value="one" #myInput>
       */
      function Template(ctx: any, cm: boolean) {
        if (cm) {
          text(0);
          text(1);
          elementStart(2, 'comp', null, ['myComp', '']);
          elementEnd();
          elementStart(4, 'input', ['value', 'one'], ['myInput', '']);
          elementEnd();
        }
        const tmp1 = load(3) as any;
        const tmp2 = load(5) as any;
        textBinding(0, bind(tmp2.value));
        textBinding(1, bind(tmp1.name));
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
      function Template(ctx: any, cm: boolean) {
        if (cm) {
          elementStart(0, 'div');
          { container(1); }
          elementEnd();
        }
        containerRefreshStart(1);
        {
          if (ctx.condition) {
            let cm1 = embeddedViewStart(1);
            {
              if (cm1) {
                text(0);
                elementStart(1, 'input', ['value', 'one'], ['myInput', '']);
                elementEnd();
              }
              const tmp = load(2) as any;
              textBinding(0, bind(tmp.value));
            }
            embeddedViewEnd();
          }
        }
        containerRefreshEnd();
      }

      expect(renderToHtml(Template, {
        condition: true
      })).toEqual('<div>one<input value="one"></div>');
      expect(renderToHtml(Template, {condition: false})).toEqual('<div></div>');
    });
  });
});
