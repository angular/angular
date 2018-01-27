/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {C, E, NC, P, T, V, a, b, b1, b2, b3, b4, b5, b6, b7, b8, bV, cR, cr, defineComponent, e, k, m, p, pD, r, s, t, v} from '../../src/render3/index';
import {NO_CHANGE} from '../../src/render3/instructions';

import {containerEl, renderToHtml} from './render_util';

describe('render3 integration test', () => {

  describe('render', () => {

    it('should render basic template', () => {
      expect(renderToHtml(Template, {})).toEqual('<span title="Hello">Greetings</span>');

      function Template(ctx: any, cm: boolean) {
        if (cm) {
          E(0, 'span', ['title', 'Hello']);
          { T(1, 'Greetings'); }
          e();
        }
      }
    });

    it('should render and update basic "Hello, World" template', () => {
      expect(renderToHtml(Template, 'World')).toEqual('<h1>Hello, World!</h1>');
      expect(renderToHtml(Template, 'New World')).toEqual('<h1>Hello, New World!</h1>');

      function Template(name: string, cm: boolean) {
        if (cm) {
          E(0, 'h1');
          { T(1); }
          e();
        }
        t(1, b1('Hello, ', name, '!'));
      }
    });
  });

  describe('text bindings', () => {
    it('should render "undefined" as "" when used with `bind()`', () => {
      function Template(name: string, cm: boolean) {
        if (cm) {
          T(0);
        }
        t(0, b(name));
      }

      expect(renderToHtml(Template, 'benoit')).toEqual('benoit');
      expect(renderToHtml(Template, undefined)).toEqual('');
    });

    it('should render "null" as "" when used with `bind()`', () => {
      function Template(name: string, cm: boolean) {
        if (cm) {
          T(0);
        }
        t(0, b(name));
      }

      expect(renderToHtml(Template, 'benoit')).toEqual('benoit');
      expect(renderToHtml(Template, null)).toEqual('');
    });

    it('should support creation-time values in text nodes', () => {
      function Template(value: string, cm: boolean) {
        if (cm) {
          T(0);
        }
        t(0, cm ? value : NO_CHANGE);
      }
      expect(renderToHtml(Template, 'once')).toEqual('once');
      expect(renderToHtml(Template, 'twice')).toEqual('once');
    });

    it('should support creation-time bindings in interpolations', () => {
      function Template(v: string, cm: boolean) {
        if (cm) {
          T(0);
          T(1);
          T(2);
          T(3);
          T(4);
          T(5);
          T(6);
          T(7);
          T(8);
        }
        t(0, b1('', cm ? v : NC, '|'));
        t(1, b2('', v, '_', cm ? v : NC, '|'));
        t(2, b3('', v, '_', v, '_', cm ? v : NC, '|'));
        t(3, b4('', v, '_', v, '_', v, '_', cm ? v : NC, '|'));
        t(4, b5('', v, '_', v, '_', v, '_', v, '_', cm ? v : NC, '|'));
        t(5, b6('', v, '_', v, '_', v, '_', v, '_', v, '_', cm ? v : NC, '|'));
        t(6, b7('', v, '_', v, '_', v, '_', v, '_', v, '_', v, '_', cm ? v : NC, '|'));
        t(7, b8('', v, '_', v, '_', v, '_', v, '_', v, '_', v, '_', v, '_', cm ? v : NC, '|'));
        t(8, bV([
            '', v, '_', v, '_', v, '_', v, '_', v, '_', v, '_', v, '_', v, '_', cm ? v : NC, ''
          ]));
      }
      expect(renderToHtml(Template, 'a'))
          .toEqual(
              'a|a_a|a_a_a|a_a_a_a|a_a_a_a_a|a_a_a_a_a_a|a_a_a_a_a_a_a|a_a_a_a_a_a_a_a|a_a_a_a_a_a_a_a_a');
      expect(renderToHtml(Template, 'A'))
          .toEqual(
              'a|A_a|A_A_a|A_A_A_a|A_A_A_A_a|A_A_A_A_A_a|A_A_A_A_A_A_a|A_A_A_A_A_A_A_a|A_A_A_A_A_A_A_A_a');
    });

  });

  describe('Siblings update', () => {
    it('should handle a flat list of static/bound text nodes', () => {
      function Template(name: string, cm: boolean) {
        if (cm) {
          T(0, 'Hello ');
          T(1);
          T(2, '!');
        }
        t(1, b(name));
      }
      expect(renderToHtml(Template, 'world')).toEqual('Hello world!');
      expect(renderToHtml(Template, 'monde')).toEqual('Hello monde!');
    });

    it('should handle a list of static/bound text nodes as element children', () => {
      function Template(name: string, cm: boolean) {
        if (cm) {
          E(0, 'b');
          {
            T(1, 'Hello ');
            T(2);
            T(3, '!');
          }
          e();
        }
        t(2, b(name));
      }
      expect(renderToHtml(Template, 'world')).toEqual('<b>Hello world!</b>');
      expect(renderToHtml(Template, 'mundo')).toEqual('<b>Hello mundo!</b>');
    });

    it('should render/update text node as a child of a deep list of elements', () => {
      function Template(name: string, cm: boolean) {
        if (cm) {
          E(0, 'b');
          {
            E(1, 'b');
            {
              E(2, 'b');
              {
                E(3, 'b');
                { T(4); }
                e();
              }
              e();
            }
            e();
          }
          e();
        }
        t(4, b1('Hello ', name, '!'));
      }
      expect(renderToHtml(Template, 'world')).toEqual('<b><b><b><b>Hello world!</b></b></b></b>');
      expect(renderToHtml(Template, 'mundo')).toEqual('<b><b><b><b>Hello mundo!</b></b></b></b>');
    });

    it('should update 2 sibling elements', () => {
      function Template(id: any, cm: boolean) {
        if (cm) {
          E(0, 'b');
          {
            E(1, 'span');
            e();
            E(2, 'span', ['class', 'foo']);
            {}
            e();
          }
          e();
        }
        a(2, 'id', b(id));
      }
      expect(renderToHtml(Template, 'foo'))
          .toEqual('<b><span></span><span class="foo" id="foo"></span></b>');
      expect(renderToHtml(Template, 'bar'))
          .toEqual('<b><span></span><span class="foo" id="bar"></span></b>');
    });

    it('should handle sibling text node after element with child text node', () => {
      function Template(ctx: any, cm: boolean) {
        if (cm) {
          E(0, 'p');
          { T(1, 'hello'); }
          e();
          T(2, 'world');
        }
      }

      expect(renderToHtml(Template, null)).toEqual('<p>hello</p>world');
    });
  });

  describe('basic components', () => {

    class TodoComponent {
      value = ' one';

      static ngComponentDef = defineComponent({
        type: TodoComponent,
        tag: 'todo',
        template: function TodoTemplate(ctx: any, cm: boolean) {
          if (cm) {
            E(0, 'p');
            {
              T(1, 'Todo');
              T(2);
            }
            e();
          }
          t(2, b(ctx.value));
        },
        factory: () => new TodoComponent
      });
    }

    it('should support a basic component template', () => {
      function Template(ctx: any, cm: boolean) {
        if (cm) {
          E(0, TodoComponent);
          e();
        }
        TodoComponent.ngComponentDef.h(1, 0);
        r(1, 0);
      }

      expect(renderToHtml(Template, null)).toEqual('<todo><p>Todo one</p></todo>');
    });

    it('should support a component template with sibling', () => {
      function Template(ctx: any, cm: boolean) {
        if (cm) {
          E(0, TodoComponent);
          e();
          T(2, 'two');
        }
        TodoComponent.ngComponentDef.h(1, 0);
        r(1, 0);
      }
      expect(renderToHtml(Template, null)).toEqual('<todo><p>Todo one</p></todo>two');
    });

    it('should support a component template with component sibling', () => {
      /**
       * <todo></todo>
       * <todo></todo>
       */
      function Template(ctx: any, cm: boolean) {
        if (cm) {
          E(0, TodoComponent);
          e();
          E(2, TodoComponent);
          e();
        }
        TodoComponent.ngComponentDef.h(1, 0);
        TodoComponent.ngComponentDef.h(3, 2);
        r(1, 0);
        r(3, 2);
      }
      expect(renderToHtml(Template, null))
          .toEqual('<todo><p>Todo one</p></todo><todo><p>Todo one</p></todo>');
    });

    it('should support a component with binding on host element', () => {
      let cmptInstance: TodoComponentHostBinding|null;

      class TodoComponentHostBinding {
        title = 'one';
        static ngComponentDef = defineComponent({
          type: TodoComponentHostBinding,
          tag: 'todo',
          template: function TodoComponentHostBindingTemplate(
              ctx: TodoComponentHostBinding, cm: boolean) {
            if (cm) {
              T(0);
            }
            t(0, b(ctx.title));
          },
          factory: () => cmptInstance = new TodoComponentHostBinding,
          hostBindings: function(directiveIndex: number, elementIndex: number): void {
            // host bindings
            p(elementIndex, 'title', b(m<TodoComponentHostBinding>(directiveIndex).title));
          }
        });
      }

      function Template(ctx: any, cm: boolean) {
        if (cm) {
          E(0, TodoComponentHostBinding);
          e();
        }
        TodoComponentHostBinding.ngComponentDef.h(1, 0);
        r(1, 0);
      }

      expect(renderToHtml(Template, {})).toEqual('<todo title="one">one</todo>');
      cmptInstance !.title = 'two';
      expect(renderToHtml(Template, {})).toEqual('<todo title="two">two</todo>');
    });

    it('should support component with bindings in template', () => {
      /** <p> {{ name }} </p>*/
      class MyComp {
        name = 'Bess';
        static ngComponentDef = defineComponent({
          type: MyComp,
          tag: 'comp',
          template: function MyCompTemplate(ctx: any, cm: boolean) {
            if (cm) {
              E(0, 'p');
              { T(1); }
              e();
            }
            t(1, b(ctx.name));
          },
          factory: () => new MyComp
        });
      }

      function Template(ctx: any, cm: boolean) {
        if (cm) {
          E(0, MyComp);
          e();
        }
        MyComp.ngComponentDef.h(1, 0);
        r(1, 0);
      }

      expect(renderToHtml(Template, null)).toEqual('<comp><p>Bess</p></comp>');
    });

    it('should support a component with sub-views', () => {
      /**
       * % if (condition) {
       *   <div>text</div>
       * % }
       */
      class MyComp {
        condition: boolean;
        static ngComponentDef = defineComponent({
          type: MyComp,
          tag: 'comp',
          template: function MyCompTemplate(ctx: any, cm: boolean) {
            if (cm) {
              C(0);
            }
            cR(0);
            {
              if (ctx.condition) {
                if (V(0)) {
                  E(0, 'div');
                  { T(1, 'text'); }
                  e();
                }
                v();
              }
            }
            cr();
          },
          factory: () => new MyComp,
          inputs: {condition: 'condition'}
        });
      }

      /** <comp [condition]="condition"></comp> */
      function Template(ctx: any, cm: boolean) {
        if (cm) {
          E(0, MyComp);
          e();
        }
        p(0, 'condition', b(ctx.condition));
        MyComp.ngComponentDef.h(1, 0);
        r(1, 0);
      }

      expect(renderToHtml(Template, {condition: true})).toEqual('<comp><div>text</div></comp>');
      expect(renderToHtml(Template, {condition: false})).toEqual('<comp></comp>');

    });

  });

  describe('tree', () => {
    interface Tree {
      beforeLabel?: string;
      subTrees?: Tree[];
      afterLabel?: string;
    }

    interface ParentCtx {
      beforeTree: Tree;
      projectedTree: Tree;
      afterTree: Tree;
    }

    function showLabel(ctx: {label: string | undefined}, cm: boolean) {
      if (cm) {
        C(0);
      }
      cR(0);
      {
        if (ctx.label != null) {
          if (V(0)) {
            T(0);
          }
          t(0, b(ctx.label));
          v();
        }
      }
      cr();
    }

    function showTree(ctx: {tree: Tree}, cm: boolean) {
      if (cm) {
        C(0);
        C(1);
        C(2);
      }
      cR(0);
      {
        const cm0 = V(0);
        { showLabel({label: ctx.tree.beforeLabel}, cm0); }
        v();
      }
      cr();
      cR(1);
      {
        for (let subTree of ctx.tree.subTrees || []) {
          const cm0 = V(0);
          { showTree({tree: subTree}, cm0); }
          v();
        }
      }
      cr();
      cR(2);
      {
        const cm0 = V(0);
        { showLabel({label: ctx.tree.afterLabel}, cm0); }
        v();
      }
      cr();
    }

    class ChildComponent {
      beforeTree: Tree;
      afterTree: Tree;
      static ngComponentDef = defineComponent({
        tag: 'child',
        type: ChildComponent,
        template: function ChildComponentTemplate(
            ctx: {beforeTree: Tree, afterTree: Tree}, cm: boolean) {
          if (cm) {
            pD(0);
            C(1);
            P(2, 0);
            C(3);
          }
          cR(1);
          {
            const cm0 = V(0);
            { showTree({tree: ctx.beforeTree}, cm0); }
            v();
          }
          cr();
          cR(3);
          {
            const cm0 = V(0);
            { showTree({tree: ctx.afterTree}, cm0); }
            v();
          }
          cr();
        },
        factory: () => new ChildComponent,
        inputs: {beforeTree: 'beforeTree', afterTree: 'afterTree'}
      });
    }

    function parentTemplate(ctx: ParentCtx, cm: boolean) {
      if (cm) {
        E(0, ChildComponent);
        { C(2); }
        e();
      }
      p(0, 'beforeTree', b(ctx.beforeTree));
      p(0, 'afterTree', b(ctx.afterTree));
      cR(2);
      {
        const cm0 = V(0);
        { showTree({tree: ctx.projectedTree}, cm0); }
        v();
      }
      cr();
      ChildComponent.ngComponentDef.h(1, 0);
      r(1, 0);
    }

    it('should work with a tree', () => {

      const ctx: ParentCtx = {
        beforeTree: {subTrees: [{beforeLabel: 'a'}]},
        projectedTree: {beforeLabel: 'p'},
        afterTree: {afterLabel: 'z'}
      };
      expect(renderToHtml(parentTemplate, ctx)).toEqual('<child>apz</child>');
      ctx.projectedTree = {subTrees: [{}, {}, {subTrees: [{}, {}]}, {}]};
      ctx.beforeTree.subTrees !.push({afterLabel: 'b'});
      expect(renderToHtml(parentTemplate, ctx)).toEqual('<child>abz</child>');
      ctx.projectedTree.subTrees ![1].afterLabel = 'h';
      expect(renderToHtml(parentTemplate, ctx)).toEqual('<child>abhz</child>');
      ctx.beforeTree.subTrees !.push({beforeLabel: 'c'});
      expect(renderToHtml(parentTemplate, ctx)).toEqual('<child>abchz</child>');

      // To check the context easily:
      // console.log(JSON.stringify(ctx));
    });

  });

  describe('element bindings', () => {

    describe('elementAttribute', () => {
      it('should support attribute bindings', () => {
        const ctx: {title: string | null} = {title: 'Hello'};

        function Template(ctx: any, cm: boolean) {
          if (cm) {
            E(0, 'span');
            e();
          }
          a(0, 'title', b(ctx.title));
        }

        // initial binding
        expect(renderToHtml(Template, ctx)).toEqual('<span title="Hello"></span>');

        // update binding
        ctx.title = 'Hi!';
        expect(renderToHtml(Template, ctx)).toEqual('<span title="Hi!"></span>');

        // remove attribute
        ctx.title = null;
        expect(renderToHtml(Template, ctx)).toEqual('<span></span>');
      });

      it('should stringify values used attribute bindings', () => {
        const ctx: {title: any} = {title: NaN};

        function Template(ctx: any, cm: boolean) {
          if (cm) {
            E(0, 'span');
            e();
          }
          a(0, 'title', b(ctx.title));
        }

        expect(renderToHtml(Template, ctx)).toEqual('<span title="NaN"></span>');

        ctx.title = {toString: () => 'Custom toString'};
        expect(renderToHtml(Template, ctx)).toEqual('<span title="Custom toString"></span>');
      });

      it('should update bindings', () => {
        function Template(c: any, cm: boolean) {
          if (cm) {
            E(0, 'b');
            e();
          }
          a(0, 'a', bV(c));
          a(0, 'a0', b(c[1]));
          a(0, 'a1', b1(c[0], c[1], c[16]));
          a(0, 'a2', b2(c[0], c[1], c[2], c[3], c[16]));
          a(0, 'a3', b3(c[0], c[1], c[2], c[3], c[4], c[5], c[16]));
          a(0, 'a4', b4(c[0], c[1], c[2], c[3], c[4], c[5], c[6], c[7], c[16]));
          a(0, 'a5', b5(c[0], c[1], c[2], c[3], c[4], c[5], c[6], c[7], c[8], c[9], c[16]));
          a(0, 'a6',
            b6(c[0], c[1], c[2], c[3], c[4], c[5], c[6], c[7], c[8], c[9], c[10], c[11], c[16]));
          a(0, 'a7', b7(c[0], c[1], c[2], c[3], c[4], c[5], c[6], c[7], c[8], c[9], c[10], c[11],
                        c[12], c[13], c[16]));
          a(0, 'a8', b8(c[0], c[1], c[2], c[3], c[4], c[5], c[6], c[7], c[8], c[9], c[10], c[11],
                        c[12], c[13], c[14], c[15], c[16]));
        }
        let args = ['(', 0, 'a', 1, 'b', 2, 'c', 3, 'd', 4, 'e', 5, 'f', 6, 'g', 7, ')'];
        expect(renderToHtml(Template, args))
            .toEqual(
                '<b a="(0a1b2c3d4e5f6g7)" a0="0" a1="(0)" a2="(0a1)" a3="(0a1b2)" a4="(0a1b2c3)" a5="(0a1b2c3d4)" a6="(0a1b2c3d4e5)" a7="(0a1b2c3d4e5f6)" a8="(0a1b2c3d4e5f6g7)"></b>');
        args = args.reverse();
        expect(renderToHtml(Template, args))
            .toEqual(
                '<b a=")7g6f5e4d3c2b1a0(" a0="7" a1=")7(" a2=")7g6(" a3=")7g6f5(" a4=")7g6f5e4(" a5=")7g6f5e4d3(" a6=")7g6f5e4d3c2(" a7=")7g6f5e4d3c2b1(" a8=")7g6f5e4d3c2b1a0("></b>');
        args = args.reverse();
        expect(renderToHtml(Template, args))
            .toEqual(
                '<b a="(0a1b2c3d4e5f6g7)" a0="0" a1="(0)" a2="(0a1)" a3="(0a1b2)" a4="(0a1b2c3)" a5="(0a1b2c3d4)" a6="(0a1b2c3d4e5)" a7="(0a1b2c3d4e5f6)" a8="(0a1b2c3d4e5f6g7)"></b>');
      });

      it('should not update DOM if context has not changed', () => {
        const ctx: {title: string | null} = {title: 'Hello'};

        function Template(ctx: any, cm: boolean) {
          if (cm) {
            E(0, 'span');
            C(1);
            e();
          }
          a(0, 'title', b(ctx.title));
          cR(1);
          {
            if (true) {
              let cm1 = V(1);
              {
                if (cm1) {
                  E(0, 'b');
                  {}
                  e();
                }
                a(0, 'title', b(ctx.title));
              }
              v();
            }
          }
          cr();
        }

        // initial binding
        expect(renderToHtml(Template, ctx))
            .toEqual('<span title="Hello"><b title="Hello"></b></span>');
        // update DOM manually
        containerEl.querySelector('b') !.setAttribute('title', 'Goodbye');
        // refresh with same binding
        expect(renderToHtml(Template, ctx))
            .toEqual('<span title="Hello"><b title="Goodbye"></b></span>');
        // refresh again with same binding
        expect(renderToHtml(Template, ctx))
            .toEqual('<span title="Hello"><b title="Goodbye"></b></span>');
      });
    });

    describe('elementStyle', () => {

      it('should support binding to styles', () => {
        function Template(ctx: any, cm: boolean) {
          if (cm) {
            E(0, 'span');
            e();
          }
          s(0, 'border-color', b(ctx));
        }

        expect(renderToHtml(Template, 'red')).toEqual('<span style="border-color: red;"></span>');
        expect(renderToHtml(Template, 'green'))
            .toEqual('<span style="border-color: green;"></span>');
        expect(renderToHtml(Template, null)).toEqual('<span></span>');
      });

      it('should support binding to styles with suffix', () => {
        function Template(ctx: any, cm: boolean) {
          if (cm) {
            E(0, 'span');
            e();
          }
          s(0, 'font-size', b(ctx), 'px');
        }

        expect(renderToHtml(Template, '100')).toEqual('<span style="font-size: 100px;"></span>');
        expect(renderToHtml(Template, 200)).toEqual('<span style="font-size: 200px;"></span>');
        expect(renderToHtml(Template, null)).toEqual('<span></span>');
      });
    });

    describe('elementClass', () => {

      it('should support CSS class toggle', () => {
        function Template(ctx: any, cm: boolean) {
          if (cm) {
            E(0, 'span');
            e();
          }
          k(0, 'active', b(ctx));
        }

        expect(renderToHtml(Template, true)).toEqual('<span class="active"></span>');
        expect(renderToHtml(Template, false)).toEqual('<span class=""></span>');

        // truthy values
        expect(renderToHtml(Template, 'a_string')).toEqual('<span class="active"></span>');
        expect(renderToHtml(Template, 10)).toEqual('<span class="active"></span>');

        // falsy values
        expect(renderToHtml(Template, '')).toEqual('<span class=""></span>');
        expect(renderToHtml(Template, 0)).toEqual('<span class=""></span>');
      });

      it('should work correctly with existing static classes', () => {
        function Template(ctx: any, cm: boolean) {
          if (cm) {
            E(0, 'span', ['class', 'existing']);
            e();
          }
          k(0, 'active', b(ctx));
        }

        expect(renderToHtml(Template, true)).toEqual('<span class="existing active"></span>');
        expect(renderToHtml(Template, false)).toEqual('<span class="existing"></span>');
      });
    });
  });

  describe('template data', () => {

    it('should re-use template data and node data', () => {
      /**
       *  % if (condition) {
       *    <div></div>
       *  % }
       */
      function Template(ctx: any, cm: boolean) {
        if (cm) {
          C(0);
        }
        cR(0);
        {
          if (ctx.condition) {
            if (V(0)) {
              E(0, 'div');
              {}
              e();
            }
            v();
          }
        }
        cr();
      }

      expect((Template as any).ngPrivateData).toBeUndefined();

      renderToHtml(Template, {condition: true});

      const oldTemplateData = (Template as any).ngPrivateData;
      const oldContainerData = (oldTemplateData as any).data[0];
      const oldElementData = oldContainerData.data[0][0];
      expect(oldContainerData).not.toBeNull();
      expect(oldElementData).not.toBeNull();

      renderToHtml(Template, {condition: false});
      renderToHtml(Template, {condition: true});

      const newTemplateData = (Template as any).ngPrivateData;
      const newContainerData = (oldTemplateData as any).data[0];
      const newElementData = oldContainerData.data[0][0];
      expect(newTemplateData === oldTemplateData).toBe(true);
      expect(newContainerData === oldContainerData).toBe(true);
      expect(newElementData === oldElementData).toBe(true);
    });

  });

});
