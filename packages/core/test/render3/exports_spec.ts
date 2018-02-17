/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {defineComponent, defineDirective} from '../../src/render3/index';
import {bind, container, containerRefreshEnd, containerRefreshStart, elementAttribute, elementClass, elementEnd, elementProperty, elementStart, embeddedViewEnd, embeddedViewStart, load, text, textBinding} from '../../src/render3/instructions';

import {renderToHtml} from './render_util';

describe('exports', () => {
  it('should support export of DOM element', () => {

    /** <input value="one" #myInput> {{ myInput.value }} */
    function Template(ctx: any, cm: boolean) {
      if (cm) {
        elementStart(0, 'input', ['value', 'one']);
        elementEnd();
        text(1);
      }
      let myInput = elementStart(0);
      textBinding(1, (myInput as any).value);
    }

    expect(renderToHtml(Template, {})).toEqual('<input value="one">one');
  });

  it('should support basic export of component', () => {

    /** <comp #myComp></comp> {{ myComp.name }} */
    function Template(ctx: any, cm: boolean) {
      if (cm) {
        elementStart(0, MyComponent);
        elementEnd();
        text(2);
      }
      textBinding(2, load<MyComponent>(1).name);
    }

    class MyComponent {
      name = 'Nancy';

      static ngComponentDef = defineComponent({
        type: MyComponent,
        tag: 'comp',
        template: function() {},
        factory: () => new MyComponent
      });
    }

    expect(renderToHtml(Template, {})).toEqual('<comp></comp>Nancy');
  });

  it('should support component instance fed into directive', () => {

    let myComponent: MyComponent;
    let myDir: MyDir;
    class MyComponent {
      constructor() { myComponent = this; }
      static ngComponentDef = defineComponent({
        type: MyComponent,
        tag: 'comp',
        template: function() {},
        factory: () => new MyComponent
      });
    }

    class MyDir {
      myDir: MyComponent;
      constructor() { myDir = this; }
      static ngDirectiveDef =
          defineDirective({type: MyDir, factory: () => new MyDir, inputs: {myDir: 'myDir'}});
    }

    /** <comp #myComp></comp> <div [myDir]="myComp"></div> */
    function Template(ctx: any, cm: boolean) {
      if (cm) {
        elementStart(0, MyComponent);
        elementEnd();
        elementStart(2, 'div', null, [MyDir]);
        elementEnd();
      }
      elementProperty(2, 'myDir', bind(load<MyComponent>(1)));
    }

    renderToHtml(Template, {});
    expect(myDir !.myDir).toEqual(myComponent !);
  });

  it('should work with directives with exportAs set', () => {

    /** <div someDir #myDir="someDir"></div> {{ myDir.name }} */
    function Template(ctx: any, cm: boolean) {
      if (cm) {
        elementStart(0, 'div', null, [SomeDir]);
        elementEnd();
        text(2);
      }
      textBinding(2, load<SomeDir>(1).name);
    }

    class SomeDir {
      name = 'Drew';
      static ngDirectiveDef = defineDirective({type: SomeDir, factory: () => new SomeDir});
    }

    expect(renderToHtml(Template, {})).toEqual('<div></div>Drew');
  });

  describe('forward refs', () => {
    it('should work with basic text bindings', () => {
      /** {{ myInput.value}} <input value="one" #myInput> */
      function Template(ctx: any, cm: boolean) {
        if (cm) {
          text(0);
          elementStart(1, 'input', ['value', 'one']);
          elementEnd();
        }
        let myInput = elementStart(1);
        textBinding(0, bind((myInput as any).value));
      }

      expect(renderToHtml(Template, {})).toEqual('one<input value="one">');
    });


    it('should work with element properties', () => {
      /** <div [title]="myInput.value"</div> <input value="one" #myInput> */
      function Template(ctx: any, cm: boolean) {
        if (cm) {
          elementStart(0, 'div');
          elementEnd();
          elementStart(1, 'input', ['value', 'one']);
          elementEnd();
        }
        let myInput = elementStart(1);
        elementProperty(0, 'title', bind(myInput && (myInput as any).value));
      }

      expect(renderToHtml(Template, {})).toEqual('<div title="one"></div><input value="one">');
    });

    it('should work with element attrs', () => {
      /** <div [attr.aria-label]="myInput.value"</div> <input value="one" #myInput> */
      function Template(ctx: any, cm: boolean) {
        if (cm) {
          elementStart(0, 'div');
          elementEnd();
          elementStart(1, 'input', ['value', 'one']);
          elementEnd();
        }
        let myInput = elementStart(1);
        elementAttribute(0, 'aria-label', bind(myInput && (myInput as any).value));
      }

      expect(renderToHtml(Template, {})).toEqual('<div aria-label="one"></div><input value="one">');
    });

    it('should work with element classes', () => {
      /** <div [class.red]="myInput.checked"</div> <input type="checkbox" checked #myInput> */
      function Template(ctx: any, cm: boolean) {
        if (cm) {
          elementStart(0, 'div');
          elementEnd();
          elementStart(1, 'input', ['type', 'checkbox', 'checked', 'true']);
          elementEnd();
        }
        let myInput = elementStart(1);
        elementClass(0, 'red', bind(myInput && (myInput as any).checked));
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
          tag: 'comp',
          template: function(ctx: MyComponent, cm: boolean) {},
          factory: () => new MyComponent
        });
      }

      class MyDir {
        myDir: MyComponent;

        constructor() { myDir = this; }

        static ngDirectiveDef =
            defineDirective({type: MyDir, factory: () => new MyDir, inputs: {myDir: 'myDir'}});
      }

      /** <div [myDir]="myComp"></div><comp #myComp></comp> */
      function Template(ctx: any, cm: boolean) {
        if (cm) {
          elementStart(0, 'div', null, [MyDir]);
          elementEnd();
          elementStart(2, MyComponent);
          elementEnd();
        }
        elementProperty(0, 'myDir', bind(load<MyComponent>(3)));
      }

      renderToHtml(Template, {});
      expect(myDir !.myDir).toEqual(myComponent !);
    });

    it('should work with multiple forward refs', () => {
      /** {{ myInput.value }} {{ myComp.name }} <comp #myComp></comp> <input value="one" #myInput>
       */
      function Template(ctx: any, cm: boolean) {
        if (cm) {
          text(0);
          text(1);
          elementStart(2, MyComponent);
          elementEnd();
          elementStart(4, 'input', ['value', 'one']);
          elementEnd();
        }
        let myInput = elementStart(4);
        let myComp = load<MyComponent>(3);
        textBinding(0, bind(myInput && (myInput as any).value));
        textBinding(1, bind(myComp && myComp.name));
      }

      let myComponent: MyComponent;

      class MyComponent {
        name = 'Nancy';

        constructor() { myComponent = this; }

        static ngComponentDef = defineComponent({
          type: MyComponent,
          tag: 'comp',
          template: function() {},
          factory: () => new MyComponent
        });
      }
      expect(renderToHtml(Template, {})).toEqual('oneNancy<comp></comp><input value="one">');
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
                elementStart(1, 'input', ['value', 'one']);
                elementEnd();
              }
              let myInput = elementStart(1);
              textBinding(0, bind(myInput && (myInput as any).value));
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
