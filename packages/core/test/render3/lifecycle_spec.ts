/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {C, ComponentTemplate, D, E, L, LifecycleHook, T, V, b, c, defineComponent, e, l, p, cR, cr, v} from '../../src/render3/index';
import {containerEl, renderToHtml} from './render_util';

describe('lifecycles', () => {

  describe('onDestroy', () => {
    let events: string[];

    beforeEach(() => { events = []; });

    let Comp = createOnDestroyComponent('comp', function(ctx: any, cm: boolean) {});
    let Parent = createOnDestroyComponent('parent', function(ctx: any, cm: boolean) {
      if (cm) {
        E(0, Comp.ngComponentDef);
        { D(1, Comp.ngComponentDef.n(), Comp.ngComponentDef); }
        e();
      }
      Comp.ngComponentDef.r(1, 0);
    });

    function createOnDestroyComponent(name: string, template: ComponentTemplate<any>) {
      return class Component {
        val: string = '';
        ngOnDestroy() { events.push(`${name}${this.val}`); }

        static ngComponentDef = defineComponent({
          type: Component,
          tag: name,
          factory: () => {
            const comp = new Component();
            l(LifecycleHook.ON_DESTROY, comp, comp.ngOnDestroy);
            return comp;
          },
          inputs: {val: 'val'},
          template: template
        });
      };
    }

    it('should call destroy when view is removed', () => {
      /**
       * % if (condition) {
       *   <comp></comp>
       * % }
       */

      function Template(ctx: any, cm: boolean) {
        if (cm) {
          C(0);
          c();
        }
        cR(0);
        {
          if (ctx.condition) {
            if (V(0)) {
              E(0, Comp.ngComponentDef);
              { D(1, Comp.ngComponentDef.n(), Comp.ngComponentDef); }
              e();
            }
            Comp.ngComponentDef.r(1, 0);
            v();
          }
        }
        cr();
      }

      renderToHtml(Template, {condition: true});
      renderToHtml(Template, {condition: false});
      expect(events).toEqual(['comp']);
    });

    it('should call destroy when multiple views are removed', () => {
      /**
       * % if (condition) {
       *   <comp [val]="1"></comp>
       *   <comp [val]="2"></comp>
       * % }
       */

      function Template(ctx: any, cm: boolean) {
        if (cm) {
          C(0);
          c();
        }
        cR(0);
        {
          if (ctx.condition) {
            if (V(0)) {
              E(0, Comp.ngComponentDef);
              { D(1, Comp.ngComponentDef.n(), Comp.ngComponentDef); }
              e();
              E(2, Comp.ngComponentDef);
              { D(3, Comp.ngComponentDef.n(), Comp.ngComponentDef); }
              e();
            }
            p(0, 'val', b('1'));
            p(2, 'val', b('2'));
            Comp.ngComponentDef.r(1, 0);
            Comp.ngComponentDef.r(3, 2);
            v();
          }
        }
        cr();
      }

      renderToHtml(Template, {condition: true});
      renderToHtml(Template, {condition: false});
      expect(events).toEqual(['comp1', 'comp2']);
    });

    it('should be called in child components before parent components', () => {
      /**
       * % if (condition) {
       *   <parent></parent>
       * % }
       *
       * parent template: <comp></comp>
       */

      function Template(ctx: any, cm: boolean) {
        if (cm) {
          C(0);
          c();
        }
        cR(0);
        {
          if (ctx.condition) {
            if (V(0)) {
              E(0, Parent.ngComponentDef);
              { D(1, Parent.ngComponentDef.n(), Parent.ngComponentDef); }
              e();
            }
            Parent.ngComponentDef.r(1, 0);
            v();
          }
        }
        cr();
      }

      renderToHtml(Template, {condition: true});
      renderToHtml(Template, {condition: false});
      expect(events).toEqual(['comp', 'parent']);
    });

    it('should be called bottom up with children nested 2 levels deep', () => {
      /**
       * % if (condition) {
       *   <grandparent></grandparent>
       * % }
       *
       * grandparent template: <parent></parent>
       * parent template: <comp></comp>
       */

      let Grandparent = createOnDestroyComponent('grandparent', function(ctx: any, cm: boolean) {
        if (cm) {
          E(0, Parent.ngComponentDef);
          { D(1, Parent.ngComponentDef.n(), Parent.ngComponentDef); }
          e();
        }
        Parent.ngComponentDef.r(1, 0);
      });

      function Template(ctx: any, cm: boolean) {
        if (cm) {
          C(0);
          c();
        }
        cR(0);
        {
          if (ctx.condition) {
            if (V(0)) {
              E(0, Grandparent.ngComponentDef);
              { D(1, Grandparent.ngComponentDef.n(), Grandparent.ngComponentDef); }
              e();
            }
            Grandparent.ngComponentDef.r(1, 0);
            v();
          }
        }
        cr();
      }

      renderToHtml(Template, {condition: true});
      renderToHtml(Template, {condition: false});
      expect(events).toEqual(['comp', 'parent', 'grandparent']);
    });


    it('should be called in consistent order if views are removed and re-added', () => {
      /**
       * % if (condition) {
       *   <comp [val]="1"></comp>
       *   % if (condition2) {
       *     <comp [val]="2"></comp>
       *   % }
       *   <comp [val]="3"></comp>
       * % }
       */

      function Template(ctx: any, cm: boolean) {
        if (cm) {
          C(0);
          c();
        }
        cR(0);
        {
          if (ctx.condition) {
            if (V(0)) {
              E(0, Comp.ngComponentDef);
              { D(1, Comp.ngComponentDef.n(), Comp.ngComponentDef); }
              e();
              C(2);
              c();
              E(3, Comp.ngComponentDef);
              { D(4, Comp.ngComponentDef.n(), Comp.ngComponentDef); }
              e();
            }
            p(0, 'val', b('1'));
            Comp.ngComponentDef.r(1, 0);
            cR(2);
            {
              if (ctx.condition2) {
                if (V(0)) {
                  E(0, Comp.ngComponentDef);
                  { D(1, Comp.ngComponentDef.n(), Comp.ngComponentDef); }
                  e();
                }
                p(0, 'val', b('2'));
                Comp.ngComponentDef.r(1, 0);
                v();
              }
            }
            cr();
            p(3, 'val', b('3'));
            Comp.ngComponentDef.r(4, 3);
            v();
          }
        }
        cr();
      }

      renderToHtml(Template, {condition: true, condition2: true});
      renderToHtml(Template, {condition: false});

      /**
       * Current angular will process in this same order (root is the top-level removed view):
       *
       * root.child (comp1 view) onDestroy: null
       * root.child.next (container) -> embeddedView
       * embeddedView.child (comp2 view) onDestroy: null
       * embeddedView onDestroy: [comp2]
       * root.child.next.next (comp3 view) onDestroy: null
       * root onDestroy: [comp1, comp3]
       */
      expect(events).toEqual(['comp2', 'comp1', 'comp3']);

      events = [];
      renderToHtml(Template, {condition: true, condition2: false});
      renderToHtml(Template, {condition: false});
      expect(events).toEqual(['comp1', 'comp3']);

      events = [];
      renderToHtml(Template, {condition: true, condition2: true});
      renderToHtml(Template, {condition: false});
      expect(events).toEqual(['comp2', 'comp1', 'comp3']);
    });

    it('should be called in every iteration of a destroyed for loop', () => {
      /**
       * % if (condition) {
       *   <comp [val]="1"></comp>
       *   % for (let i = 2; i < len; i++) {
       *       <comp [val]="i"></comp>
       *   % }
       *   <comp [val]="5"></comp>
       * % }
       */
      function Template(ctx: any, cm: boolean) {
        if (cm) {
          C(0);
          c();
        }
        cR(0);
        {
          if (ctx.condition) {
            if (V(0)) {
              E(0, Comp.ngComponentDef);
              { D(1, Comp.ngComponentDef.n(), Comp.ngComponentDef); }
              e();
              C(2);
              c();
              E(3, Comp.ngComponentDef);
              { D(4, Comp.ngComponentDef.n(), Comp.ngComponentDef); }
              e();
            }
            p(0, 'val', b('1'));
            Comp.ngComponentDef.r(1, 0);
            cR(2);
            {
              for (let j = 2; j < ctx.len; j++) {
                if (V(0)) {
                  E(0, Comp.ngComponentDef);
                  { D(1, Comp.ngComponentDef.n(), Comp.ngComponentDef); }
                  e();
                }
                p(0, 'val', b(j));
                Comp.ngComponentDef.r(1, 0);
                v();
              }
            }
            cr();
            p(3, 'val', b('5'));
            Comp.ngComponentDef.r(4, 3);
            v();
          }
        }
        cr();
      }

      /**
       * Current angular will process in this same order (root is the top-level removed view):
       *
       * root.child (comp1 view) onDestroy: null
       * root.child.next (container) -> embeddedView (children[0].data)
       * embeddedView.child (comp2 view) onDestroy: null
       * embeddedView onDestroy: [comp2]
       * embeddedView.next.child (comp3 view) onDestroy: null
       * embeddedView.next onDestroy: [comp3]
       * embeddedView.next.next.child (comp4 view) onDestroy: null
       * embeddedView.next.next onDestroy: [comp4]
       * embeddedView.next.next -> container -> root
       * root onDestroy: [comp1, comp5]
       */
      renderToHtml(Template, {condition: true, len: 5});
      renderToHtml(Template, {condition: false});
      expect(events).toEqual(['comp2', 'comp3', 'comp4', 'comp1', 'comp5']);

      events = [];
      renderToHtml(Template, {condition: true, len: 4});
      renderToHtml(Template, {condition: false});
      expect(events).toEqual(['comp2', 'comp3', 'comp1', 'comp5']);

      events = [];
      renderToHtml(Template, {condition: true, len: 5});
      renderToHtml(Template, {condition: false});
      expect(events).toEqual(['comp2', 'comp3', 'comp4', 'comp1', 'comp5']);
    });

    it('should call destroy properly if view also has listeners', () => {
      /**
       * % if (condition) {
       *   <button (click)="onClick()">Click me</button>
       *   <comp></comp>
       *   <button (click)="onClick()">Click me</button>
       * % }
       */

      function Template(ctx: any, cm: boolean) {
        if (cm) {
          C(0);
          c();
        }
        cR(0);
        {
          if (ctx.condition) {
            if (V(0)) {
              E(0, 'button');
              {
                L('click', ctx.onClick.bind(ctx));
                T(1, 'Click me');
              }
              e();
              E(2, Comp.ngComponentDef);
              { D(3, Comp.ngComponentDef.n(), Comp.ngComponentDef); }
              e();
              E(4, 'button');
              {
                L('click', ctx.onClick.bind(ctx));
                T(5, 'Click me');
              }
              e();
            }
            Comp.ngComponentDef.r(3, 2);
            v();
          }
        }
        cr();
      }

      class App {
        counter = 0;
        condition = true;
        onClick() { this.counter++; }
      }

      const ctx: {counter: number} = new App();
      renderToHtml(Template, ctx);

      const buttons = containerEl.querySelectorAll('button') !;
      buttons[0].click();
      expect(ctx.counter).toEqual(1);
      buttons[1].click();
      expect(ctx.counter).toEqual(2);

      renderToHtml(Template, {condition: false});

      buttons[0].click();
      buttons[1].click();
      expect(events).toEqual(['comp']);
      expect(ctx.counter).toEqual(2);
    });


  });

});
