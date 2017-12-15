/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {C, D, E, T, V, a, b, c, defineComponent, defineDirective, e, k, p, cR, cr, t, v} from '../../src/render3/index';

import {renderToHtml} from './render_util';

describe('exports', () => {
  it('should support export of DOM element', () => {

    /** <input value="one" #myInput> {{ myInput.value }} */
    function Template(ctx: any, cm: boolean) {
      if (cm) {
        E(0, 'input', ['value', 'one']);
        e();
        T(1);
      }
      let myInput = E(0);
      t(1, (myInput as any).value);
    }

    expect(renderToHtml(Template, {})).toEqual('<input value="one">one');
  });

  it('should support basic export of component', () => {

    /** <comp #myComp></comp> {{ myComp.name }} */
    function Template(ctx: any, cm: boolean) {
      if (cm) {
        E(0, MyComponent.ngComponentDef);
        { D(1, MyComponent.ngComponentDef.n(), MyComponent.ngComponentDef); }
        e();
        T(2);
      }
      t(2, D<MyComponent>(1).name);
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
        E(0, MyComponent.ngComponentDef);
        { D(1, MyComponent.ngComponentDef.n(), MyComponent.ngComponentDef); }
        e();
        E(2, 'div');
        { D(3, MyDir.ngDirectiveDef.n(), MyDir.ngDirectiveDef); }
        e();
      }
      p(2, 'myDir', b(D<MyComponent>(1)));
    }

    renderToHtml(Template, {});
    expect(myDir !.myDir).toEqual(myComponent !);
  });

  it('should work with directives with exportAs set', () => {

    /** <div someDir #myDir="someDir"></div> {{ myDir.name }} */
    function Template(ctx: any, cm: boolean) {
      if (cm) {
        E(0, 'div');
        D(1, SomeDirDef.n(), SomeDirDef);
        e();
        T(2);
      }
      t(2, D<SomeDir>(1).name);
    }

    class SomeDir {
      name = 'Drew';
    }
    const SomeDirDef = defineDirective({type: SomeDir, factory: () => new SomeDir});

    expect(renderToHtml(Template, {})).toEqual('<div></div>Drew');
  });

  describe('forward refs', () => {
    it('should work with basic text bindings', () => {
      /** {{ myInput.value}} <input value="one" #myInput> */
      function Template(ctx: any, cm: boolean) {
        if (cm) {
          T(0);
          E(1, 'input', ['value', 'one']);
          e();
        }
        let myInput = E(1);
        t(0, b((myInput as any).value));
      }

      expect(renderToHtml(Template, {})).toEqual('one<input value="one">');
    });


    it('should work with element properties', () => {
      /** <div [title]="myInput.value"</div> <input value="one" #myInput> */
      function Template(ctx: any, cm: boolean) {
        if (cm) {
          E(0, 'div');
          e();
          E(1, 'input', ['value', 'one']);
          e();
        }
        let myInput = E(1);
        p(0, 'title', b(myInput && (myInput as any).value));
      }

      expect(renderToHtml(Template, {})).toEqual('<div title="one"></div><input value="one">');
    });

    it('should work with element attrs', () => {
      /** <div [attr.aria-label]="myInput.value"</div> <input value="one" #myInput> */
      function Template(ctx: any, cm: boolean) {
        if (cm) {
          E(0, 'div');
          e();
          E(1, 'input', ['value', 'one']);
          e();
        }
        let myInput = E(1);
        a(0, 'aria-label', b(myInput && (myInput as any).value));
      }

      expect(renderToHtml(Template, {})).toEqual('<div aria-label="one"></div><input value="one">');
    });

    it('should work with element classes', () => {
      /** <div [class.red]="myInput.checked"</div> <input type="checkbox" checked #myInput> */
      function Template(ctx: any, cm: boolean) {
        if (cm) {
          E(0, 'div');
          e();
          E(1, 'input', ['type', 'checkbox', 'checked', 'true']);
          e();
        }
        let myInput = E(1);
        k(0, 'red', b(myInput && (myInput as any).checked));
      }

      expect(renderToHtml(Template, {}))
          .toEqual('<div class="red"></div><input type="checkbox" checked="true">');
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
          E(0, 'div');
          { D(1, MyDir.ngDirectiveDef.n(), MyDir.ngDirectiveDef); }
          e();
          E(2, MyComponent.ngComponentDef);
          { D(3, MyComponent.ngComponentDef.n(), MyComponent.ngComponentDef); }
          e();
        }
        p(0, 'myDir', b(D<MyComponent>(3)));
      }

      renderToHtml(Template, {});
      expect(myDir !.myDir).toEqual(myComponent !);
    });

    it('should work with multiple forward refs', () => {
      /** {{ myInput.value }} {{ myComp.name }} <comp #myComp></comp> <input value="one" #myInput>
       */
      function Template(ctx: any, cm: boolean) {
        if (cm) {
          T(0);
          T(1);
          E(2, 'comp');
          { D(3, MyComponent.ngComponentDef.n(), MyComponent.ngComponentDef); }
          e();
          E(4, 'input', ['value', 'one']);
          e();
        }
        let myInput = E(4);
        let myComp = D(3) as MyComponent;
        t(0, b(myInput && (myInput as any).value));
        t(1, b(myComp && myComp.name));
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
          E(0, 'div');
          {
            C(1);
            c();
          }
          e();
        }
        cR(1);
        {
          if (ctx.condition) {
            let cm1 = V(1);
            {
              if (cm1) {
                T(0);
                E(1, 'input', ['value', 'one']);
                e();
              }
              let myInput = E(1);
              t(0, b(myInput && (myInput as any).value));
            }
            v();
          }
        }
        cr();
      }

      expect(renderToHtml(Template, {
        condition: true
      })).toEqual('<div>one<input value="one"></div>');
      expect(renderToHtml(Template, {condition: false})).toEqual('<div></div>');
    });
  });
});
