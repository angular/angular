/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {C, ComponentTemplate, E, L, P, T, V, b, cR, cr, defineComponent, defineDirective, e, m, p, pD, r, v} from '../../src/render3/index';

import {containerEl, renderToHtml} from './render_util';

describe('lifecycles', () => {

  function getParentTemplate(type: any) {
    return (ctx: any, cm: boolean) => {
      if (cm) {
        E(0, type);
        e();
      }
      p(0, 'val', b(ctx.val));
      type.ngComponentDef.h(1, 0);
      r(1, 0);
    };
  }

  describe('onInit', () => {
    let events: string[];

    beforeEach(() => { events = []; });

    let Comp = createOnInitComponent('comp', (ctx: any, cm: boolean) => {
      if (cm) {
        pD(0);
        E(1, 'div');
        { P(2, 0); }
        e();
      }
    });
    let Parent = createOnInitComponent('parent', getParentTemplate(Comp));
    let ProjectedComp = createOnInitComponent('projected', (ctx: any, cm: boolean) => {
      if (cm) {
        T(0, 'content');
      }
    });

    function createOnInitComponent(name: string, template: ComponentTemplate<any>) {
      return class Component {
        val: string = '';
        ngOnInit() { events.push(`${name}${this.val}`); }

        static ngComponentDef = defineComponent({
          type: Component,
          tag: name,
          factory: () => new Component(),
          inputs: {val: 'val'}, template
        });
      };
    }

    it('should call onInit method after inputs are set in creation mode (and not in update mode)',
       () => {
         /** <comp [val]="val"></comp> */
         function Template(ctx: any, cm: boolean) {
           if (cm) {
             E(0, Comp);
             e();
           }
           p(0, 'val', b(ctx.val));
           Comp.ngComponentDef.h(1, 0);
           r(1, 0);
         }

         renderToHtml(Template, {val: '1'});
         expect(events).toEqual(['comp1']);

         renderToHtml(Template, {val: '2'});
         expect(events).toEqual(['comp1']);
       });

    it('should call parent onInit before child onInit', () => {
      /**
       * <parent></parent>
       * parent temp: <comp></comp>
       */

      function Template(ctx: any, cm: boolean) {
        if (cm) {
          E(0, Parent);
          e();
        }
        Parent.ngComponentDef.h(1, 0);
        r(1, 0);
      }

      renderToHtml(Template, {});
      expect(events).toEqual(['parent', 'comp']);
    });

    it('should call all parent onInits across view before calling children onInits', () => {
      /**
       * <parent [val]="1"></parent>
       * <parent [val]="2"></parent>
       *
       * parent temp: <comp [val]="val"></comp>
       */

      function Template(ctx: any, cm: boolean) {
        if (cm) {
          E(0, Parent);
          e();
          E(2, Parent);
          e();
        }
        p(0, 'val', 1);
        p(2, 'val', 2);
        Parent.ngComponentDef.h(1, 0);
        Parent.ngComponentDef.h(3, 2);
        r(1, 0);
        r(3, 2);
      }

      renderToHtml(Template, {});
      expect(events).toEqual(['parent1', 'parent2', 'comp1', 'comp2']);
    });


    it('should call onInit every time a new view is created (if block)', () => {
      /**
       * % if (condition) {
       *   <comp></comp>
       * % }
       */

      function Template(ctx: any, cm: boolean) {
        if (cm) {
          C(0);
        }
        cR(0);
        {
          if (ctx.condition) {
            if (V(0)) {
              E(0, Comp);
              e();
            }
            Comp.ngComponentDef.h(1, 0);
            r(1, 0);
            v();
          }
        }
        cr();
      }

      renderToHtml(Template, {condition: true});
      expect(events).toEqual(['comp']);

      renderToHtml(Template, {condition: false});
      expect(events).toEqual(['comp']);

      renderToHtml(Template, {condition: true});
      expect(events).toEqual(['comp', 'comp']);
    });

    it('should call onInit in hosts before their content children', () => {
      /**
       * <comp>
       *   <projected-comp></projected-comp>
       * </comp>
       */
      function Template(ctx: any, cm: boolean) {
        if (cm) {
          E(0, Comp);
          { E(2, ProjectedComp); }
          e();
        }
        Comp.ngComponentDef.h(1, 0);
        ProjectedComp.ngComponentDef.h(3, 2);
        r(1, 0);
        r(3, 2);
      }

      renderToHtml(Template, {});
      expect(events).toEqual(['comp', 'projected']);
    });

    it('should call onInit in host and its content children before next host', () => {
      /**
       * <comp [val]="1">
       *   <projected-comp [val]="1"></projected-comp>
       * </comp>
       * <comp [val]="2">
       *   <projected-comp [val]="1"></projected-comp>
       * </comp>
       */
      function Template(ctx: any, cm: boolean) {
        if (cm) {
          E(0, Comp);
          { E(2, ProjectedComp); }
          e();
          E(4, Comp);
          { E(6, ProjectedComp); }
          e();
        }
        p(0, 'val', 1);
        p(2, 'val', 1);
        p(4, 'val', 2);
        p(6, 'val', 2);
        Comp.ngComponentDef.h(1, 0);
        ProjectedComp.ngComponentDef.h(3, 2);
        Comp.ngComponentDef.h(5, 4);
        ProjectedComp.ngComponentDef.h(7, 6);
        r(1, 0);
        r(3, 2);
        r(5, 4);
        r(7, 6);
      }

      renderToHtml(Template, {});
      expect(events).toEqual(['comp1', 'projected1', 'comp2', 'projected2']);
    });

    it('should be called on directives after component', () => {
      class Directive {
        ngOnInit() { events.push('dir'); }

        static ngDirectiveDef = defineDirective({type: Directive, factory: () => new Directive()});
      }

      function Template(ctx: any, cm: boolean) {
        if (cm) {
          E(0, Comp, null, [Directive]);
          e();
        }
        Comp.ngComponentDef.h(1, 0);
        r(1, 0);
      }

      renderToHtml(Template, {});
      expect(events).toEqual(['comp', 'dir']);

      renderToHtml(Template, {});
      expect(events).toEqual(['comp', 'dir']);

    });

    it('should call onInit properly in for loop', () => {
      /**
       *  <comp [val]="1"></comp>
       * % for (let j = 2; j < 5; j++) {
       *   <comp [val]="j"></comp>
       * % }
       *  <comp [val]="5"></comp>
       */

      function Template(ctx: any, cm: boolean) {
        if (cm) {
          E(0, Comp);
          e();
          C(2);
          E(3, Comp);
          e();
        }
        p(0, 'val', 1);
        p(3, 'val', 5);
        Comp.ngComponentDef.h(1, 0);
        Comp.ngComponentDef.h(4, 3);
        cR(2);
        {
          for (let j = 2; j < 5; j++) {
            if (V(0)) {
              E(0, Comp);
              e();
            }
            p(0, 'val', j);
            Comp.ngComponentDef.h(1, 0);
            r(1, 0);
            v();
          }
        }
        cr();
        r(1, 0);
        r(4, 3);
      }

      renderToHtml(Template, {});

      // onInit is called top to bottom, so top level comps (1 and 5) are called
      // before the comps inside the for loop's embedded view (2, 3, and 4)
      expect(events).toEqual(['comp1', 'comp5', 'comp2', 'comp3', 'comp4']);
    });

    it('should call onInit properly in for loop with children', () => {
      /**
       *  <parent [val]="1"></parent>
       * % for (let j = 2; j < 5; j++) {
       *   <parent [val]="j"></parent>
       * % }
       *  <parent [val]="5"></parent>
       */

      function Template(ctx: any, cm: boolean) {
        if (cm) {
          E(0, Parent);
          e();
          C(2);
          E(3, Parent);
          e();
        }
        p(0, 'val', 1);
        p(3, 'val', 5);
        Parent.ngComponentDef.h(1, 0);
        Parent.ngComponentDef.h(4, 3);
        cR(2);
        {
          for (let j = 2; j < 5; j++) {
            if (V(0)) {
              E(0, Parent);
              e();
            }
            p(0, 'val', j);
            Parent.ngComponentDef.h(1, 0);
            r(1, 0);
            v();
          }
        }
        cr();
        r(1, 0);
        r(4, 3);
      }

      renderToHtml(Template, {});

      // onInit is called top to bottom, so top level comps (1 and 5) are called
      // before the comps inside the for loop's embedded view (2, 3, and 4)
      expect(events).toEqual([
        'parent1', 'parent5', 'parent2', 'comp2', 'parent3', 'comp3', 'parent4', 'comp4', 'comp1',
        'comp5'
      ]);
    });

  });


  describe('doCheck', () => {
    let events: string[];
    let allEvents: string[];

    beforeEach(() => {
      events = [];
      allEvents = [];
    });

    let Comp = createDoCheckComponent('comp', (ctx: any, cm: boolean) => {});
    let Parent = createDoCheckComponent('parent', getParentTemplate(Comp));

    function createDoCheckComponent(name: string, template: ComponentTemplate<any>) {
      return class Component {
        ngDoCheck() {
          events.push(name);
          allEvents.push('check ' + name);
        }

        ngOnInit() { allEvents.push('init ' + name); }

        static ngComponentDef =
            defineComponent({type: Component, tag: name, factory: () => new Component(), template});
      };
    }

    it('should call doCheck on every refresh', () => {
      /** <comp></comp> */
      function Template(ctx: any, cm: boolean) {
        if (cm) {
          E(0, Comp);
          e();
        }
        Comp.ngComponentDef.h(1, 0);
        r(1, 0);
      }

      renderToHtml(Template, {});
      expect(events).toEqual(['comp']);

      renderToHtml(Template, {});
      expect(events).toEqual(['comp', 'comp']);
    });

    it('should call parent doCheck before child doCheck', () => {
      /**
       * <parent></parent>
       * parent temp: <comp></comp>
       */

      function Template(ctx: any, cm: boolean) {
        if (cm) {
          E(0, Parent);
          e();
        }
        Parent.ngComponentDef.h(1, 0);
        r(1, 0);
      }

      renderToHtml(Template, {});
      expect(events).toEqual(['parent', 'comp']);
    });

    it('should call ngOnInit before ngDoCheck if creation mode', () => {
      /** <comp></comp> */
      function Template(ctx: any, cm: boolean) {
        if (cm) {
          E(0, Comp);
          e();
        }
        Comp.ngComponentDef.h(1, 0);
        r(1, 0);
      }

      renderToHtml(Template, {});
      expect(allEvents).toEqual(['init comp', 'check comp']);

      renderToHtml(Template, {});
      expect(allEvents).toEqual(['init comp', 'check comp', 'check comp']);
    });

  });

  describe('afterContentInit', () => {
    let events: string[];
    let allEvents: string[];

    beforeEach(() => {
      events = [];
      allEvents = [];
    });

    let Comp = createAfterContentInitComp('comp', function(ctx: any, cm: boolean) {
      if (cm) {
        pD(0);
        P(1, 0);
      }
    });

    let Parent = createAfterContentInitComp('parent', function(ctx: any, cm: boolean) {
      if (cm) {
        pD(0);
        E(1, Comp);
        { P(3, 0); }
        e();
      }
      p(1, 'val', b(ctx.val));
      Comp.ngComponentDef.h(2, 1);
      r(2, 1);
    });

    let ProjectedComp = createAfterContentInitComp('projected', (ctx: any, cm: boolean) => {
      if (cm) {
        pD(0);
        P(1, 0);
      }
    });

    function createAfterContentInitComp(name: string, template: ComponentTemplate<any>) {
      return class Component {
        val: string = '';
        ngAfterContentInit() {
          events.push(`${name}${this.val}`);
          allEvents.push(`${name}${this.val} init`);
        }
        ngAfterContentChecked() { allEvents.push(`${name}${this.val} check`); }

        static ngComponentDef = defineComponent({
          type: Component,
          tag: name,
          factory: () => new Component(),
          inputs: {val: 'val'},
          template: template,
        });
      };
    }

    it('should be called only in creation mode', () => {
      /** <comp>content</comp> */
      function Template(ctx: any, cm: boolean) {
        if (cm) {
          E(0, Comp);
          { T(2, 'content'); }
          e();
        }
        Comp.ngComponentDef.h(1, 0);
        r(1, 0);
      }

      renderToHtml(Template, {});
      expect(events).toEqual(['comp']);

      renderToHtml(Template, {});
      expect(events).toEqual(['comp']);
    });

    it('should be called on every init (if blocks)', () => {
      /**
       * % if (condition) {
       *   <comp>content</comp>
       * % }
       */
      function Template(ctx: any, cm: boolean) {
        if (cm) {
          C(0);
        }
        cR(0);
        {
          if (ctx.condition) {
            if (V(0)) {
              E(0, Comp);
              { T(2, 'content'); }
              e();
            }
            Comp.ngComponentDef.h(1, 0);
            r(1, 0);
            v();
          }
        }
        cr();
      }

      renderToHtml(Template, {condition: true});
      expect(events).toEqual(['comp']);

      renderToHtml(Template, {condition: false});
      expect(events).toEqual(['comp']);

      renderToHtml(Template, {condition: true});
      expect(events).toEqual(['comp', 'comp']);
    });

    it('should be called on directives after component', () => {
      class Directive {
        ngAfterContentInit() { events.push('dir'); }

        static ngDirectiveDef = defineDirective({type: Directive, factory: () => new Directive()});
      }

      function Template(ctx: any, cm: boolean) {
        if (cm) {
          E(0, Comp, null, [Directive]);
          e();
        }
        Comp.ngComponentDef.h(1, 0);
        r(1, 0);
      }

      renderToHtml(Template, {});
      expect(events).toEqual(['comp', 'dir']);

      renderToHtml(Template, {});
      expect(events).toEqual(['comp', 'dir']);

    });

    it('should be called in parents before children', () => {
      /**
       * <parent>content</parent>
       *
       * parent template: <comp><ng-content></ng-content></comp>
       */
      function Template(ctx: any, cm: boolean) {
        if (cm) {
          E(0, Parent);
          { T(2, 'content'); }
          e();
        }
        Parent.ngComponentDef.h(1, 0);
        r(1, 0);
      }

      renderToHtml(Template, {});
      expect(events).toEqual(['parent', 'comp']);
    });

    it('should be called breadth-first in entire parent subtree before any children', () => {
      /**
       * <parent [val]="1">content</parent>
       * <parent [val]="2">content</parent>
       *
       * parent template: <comp [val]="val"><ng-content></ng-content></comp>
       */
      function Template(ctx: any, cm: boolean) {
        if (cm) {
          E(0, Parent);
          { T(2, 'content'); }
          e();
          E(3, Parent);
          { T(5, 'content'); }
          e();
        }
        p(0, 'val', 1);
        p(3, 'val', 2);
        Parent.ngComponentDef.h(1, 0);
        Parent.ngComponentDef.h(4, 3);
        r(1, 0);
        r(4, 3);
      }

      renderToHtml(Template, {});
      expect(events).toEqual(['parent1', 'parent2', 'comp1', 'comp2']);
    });

    it('should be called in projected components before their hosts', () => {
      /**
       * <parent>
       *   <projected-comp>content</projected-comp>
       * </parent>
       *
       * parent template:
       * <comp><ng-content></ng-content></comp>
       *
       * projected comp: <ng-content></ng-content>
       */
      function Template(ctx: any, cm: boolean) {
        if (cm) {
          E(0, Parent);
          {
            E(2, ProjectedComp);
            { T(4, 'content'); }
            e();
          }
          e();
        }
        Parent.ngComponentDef.h(1, 0);
        ProjectedComp.ngComponentDef.h(3, 2);
        r(1, 0);
        r(3, 2);
      }

      renderToHtml(Template, {});
      expect(events).toEqual(['projected', 'parent', 'comp']);
    });

    it('should be called in projected components and hosts before children', () => {
      /**
       * <parent [val]="1">
       *   <projected-comp [val]="1">content</projected-comp>
       * </parent>
       * * <parent [val]="2">
       *   <projected-comp [val]="2">content</projected-comp>
       * </parent>
       *
       * parent template:
       * <comp [val]="val"><ng-content></ng-content></comp>
       *
       * projected comp: <ng-content></ng-content>
       */
      function Template(ctx: any, cm: boolean) {
        if (cm) {
          E(0, Parent);
          {
            E(2, ProjectedComp);
            { T(4, 'content'); }
            e();
          }
          e();
          E(5, Parent);
          {
            E(7, ProjectedComp);
            { T(9, 'content'); }
            e();
          }
          e();
        }
        p(0, 'val', 1);
        p(2, 'val', 1);
        p(5, 'val', 2);
        p(7, 'val', 2);
        Parent.ngComponentDef.h(1, 0);
        ProjectedComp.ngComponentDef.h(3, 2);
        Parent.ngComponentDef.h(6, 5);
        ProjectedComp.ngComponentDef.h(8, 7);
        r(1, 0);
        r(3, 2);
        r(6, 5);
        r(8, 7);
      }

      renderToHtml(Template, {});
      expect(events).toEqual(['projected1', 'parent1', 'projected2', 'parent2', 'comp1', 'comp2']);
    });

    it('should be called in correct order in a for loop', () => {
      /**
       * <comp [val]="1">content</comp>
       * % for(let i = 2; i < 4; i++) {
       *   <comp [val]="i">content</comp>
       * % }
       * <comp [val]="4">content</comp>
       */
      function Template(ctx: any, cm: boolean) {
        if (cm) {
          E(0, Comp);
          { T(2, 'content'); }
          e();
          C(3);
          E(4, Comp);
          { T(6, 'content'); }
          e();
        }
        p(0, 'val', 1);
        p(4, 'val', 4);
        Comp.ngComponentDef.h(1, 0);
        Comp.ngComponentDef.h(5, 4);
        cR(3);
        {
          for (let i = 2; i < 4; i++) {
            if (V(0)) {
              E(0, Comp);
              { T(2, 'content'); }
              e();
            }
            p(0, 'val', i);
            Comp.ngComponentDef.h(1, 0);
            r(1, 0);
            v();
          }
        }
        cr();
        r(1, 0);
        r(5, 4);
      }

      renderToHtml(Template, {});
      expect(events).toEqual(['comp2', 'comp3', 'comp1', 'comp4']);
    });

    function ForLoopWithChildrenTemplate(ctx: any, cm: boolean) {
      if (cm) {
        E(0, Parent);
        { T(2, 'content'); }
        e();
        C(3);
        E(4, Parent);
        { T(6, 'content'); }
        e();
      }
      p(0, 'val', 1);
      p(4, 'val', 4);
      Parent.ngComponentDef.h(1, 0);
      Parent.ngComponentDef.h(5, 4);
      cR(3);
      {
        for (let i = 2; i < 4; i++) {
          if (V(0)) {
            E(0, Parent);
            { T(2, 'content'); }
            e();
          }
          p(0, 'val', i);
          Parent.ngComponentDef.h(1, 0);
          r(1, 0);
          v();
        }
      }
      cr();
      r(1, 0);
      r(5, 4);
    }

    it('should be called in correct order in a for loop with children', () => {
      /**
       * <parent [val]="1">content</parent>
       * % for(let i = 2; i < 4; i++) {
       *   <parent [val]="i">content</parent>
       * % }
       * <parent [val]="4">content</parent>
       */

      renderToHtml(ForLoopWithChildrenTemplate, {});
      expect(events).toEqual(
          ['parent2', 'comp2', 'parent3', 'comp3', 'parent1', 'parent4', 'comp1', 'comp4']);
    });

    describe('ngAfterContentChecked', () => {

      it('should be called every change detection run after afterContentInit', () => {
        /** <comp>content</comp> */
        function Template(ctx: any, cm: boolean) {
          if (cm) {
            E(0, Comp);
            { T(2, 'content'); }
            e();
          }
          Comp.ngComponentDef.h(1, 0);
          r(1, 0);
        }

        renderToHtml(Template, {});
        expect(allEvents).toEqual(['comp init', 'comp check']);

        renderToHtml(Template, {});
        expect(allEvents).toEqual(['comp init', 'comp check', 'comp check']);

      });

    });
  });

  describe('afterViewInit', () => {
    let events: string[];
    let allEvents: string[];

    beforeEach(() => {
      events = [];
      allEvents = [];
    });

    let Comp = createAfterViewInitComponent('comp', (ctx: any, cm: boolean) => {
      if (cm) {
        pD(0);
        E(1, 'div');
        { P(2, 0); }
        e();
      }
    });
    let Parent = createAfterViewInitComponent('parent', getParentTemplate(Comp));

    let ProjectedComp = createAfterViewInitComponent('projected', (ctx: any, cm: boolean) => {
      if (cm) {
        T(0, 'content');
      }
    });

    function createAfterViewInitComponent(name: string, template: ComponentTemplate<any>) {
      return class Component {
        val: string = '';
        ngAfterViewInit() {
          events.push(`${name}${this.val}`);
          allEvents.push(`${name}${this.val} init`);
        }
        ngAfterViewChecked() { allEvents.push(`${name}${this.val} check`); }

        static ngComponentDef = defineComponent({
          type: Component,
          tag: name,
          factory: () => new Component(),
          inputs: {val: 'val'},
          template: template
        });
      };
    }

    it('should be called on init and not in update mode', () => {
      /** <comp></comp> */
      function Template(ctx: any, cm: boolean) {
        if (cm) {
          E(0, Comp);
          e();
        }
        Comp.ngComponentDef.h(1, 0);
        r(1, 0);
      }

      renderToHtml(Template, {});
      expect(events).toEqual(['comp']);

      renderToHtml(Template, {});
      expect(events).toEqual(['comp']);
    });

    it('should be called every time a view is initialized (if block)', () => {
      /*
      * % if (condition) {
      *   <comp></comp>
      * % }
      */
      function Template(ctx: any, cm: boolean) {
        if (cm) {
          C(0);
        }
        cR(0);
        {
          if (ctx.condition) {
            if (V(0)) {
              E(0, Comp);
              e();
            }
            Comp.ngComponentDef.h(1, 0);
            r(1, 0);
            v();
          }
        }
        cr();
      }

      renderToHtml(Template, {condition: true});
      expect(events).toEqual(['comp']);

      renderToHtml(Template, {condition: false});
      expect(events).toEqual(['comp']);

      renderToHtml(Template, {condition: true});
      expect(events).toEqual(['comp', 'comp']);

    });

    it('should be called in children before parents', () => {
      /**
       * <parent></parent>
       *
       * parent temp: <comp></comp>
       */
      function Template(ctx: any, cm: boolean) {
        if (cm) {
          E(0, Parent);
          e();
        }
        Parent.ngComponentDef.h(1, 0);
        r(1, 0);
      }

      renderToHtml(Template, {});
      expect(events).toEqual(['comp', 'parent']);

    });

    it('should be called for entire subtree before being called in any parent view comps', () => {
      /**
       * <parent [val]="1"></parent>
       * <parent [val]="2"></parent>
       *
       *  parent temp: <comp [val]="val"></comp>
       */
      function Template(ctx: any, cm: boolean) {
        if (cm) {
          E(0, Parent);
          e();
          E(2, Parent);
          e();
        }
        p(0, 'val', 1);
        p(2, 'val', 2);
        Parent.ngComponentDef.h(1, 0);
        Parent.ngComponentDef.h(3, 2);
        r(1, 0);
        r(3, 2);
      }
      renderToHtml(Template, {});
      expect(events).toEqual(['comp1', 'comp2', 'parent1', 'parent2']);

    });

    it('should be called in projected components before their hosts', () => {
      /**
       * <comp>
       *   <projected-comp></projected-comp>
       * </comp>
       */
      function Template(ctx: any, cm: boolean) {
        if (cm) {
          E(0, Comp);
          {
            E(2, ProjectedComp);
            e();
          }
          e();
        }
        Comp.ngComponentDef.h(1, 0);
        ProjectedComp.ngComponentDef.h(3, 2);
        r(1, 0);
        r(3, 2);
      }

      renderToHtml(Template, {});
      expect(events).toEqual(['projected', 'comp']);
    });

    it('should call afterViewInit in content children and host before next host', () => {
      /**
       * <comp [val]="1">
       *   <projected-comp [val]="1"></projected-comp>
       * </comp>
       * <comp [val]="2">
       *   <projected-comp [val]="2"></projected-comp>
       * </comp>
       */
      function Template(ctx: any, cm: boolean) {
        if (cm) {
          E(0, Comp);
          {
            E(2, ProjectedComp);
            e();
          }
          e();
          E(4, Comp);
          {
            E(6, ProjectedComp);
            e();
          }
          e();
        }
        p(0, 'val', 1);
        p(2, 'val', 1);
        p(4, 'val', 2);
        p(6, 'val', 2);
        Comp.ngComponentDef.h(1, 0);
        ProjectedComp.ngComponentDef.h(3, 2);
        Comp.ngComponentDef.h(5, 4);
        ProjectedComp.ngComponentDef.h(7, 6);
        r(1, 0);
        r(3, 2);
        r(5, 4);
        r(7, 6);
      }

      renderToHtml(Template, {});
      expect(events).toEqual(['projected1', 'comp1', 'projected2', 'comp2']);
    });

    it('should call afterViewInit in content children and hosts before parents', () => {
      /*
       * <comp [val]="val">
       *   <projected-comp [val]="val"></projected-comp>
       * </comp>
       */
      const ParentComp = createAfterViewInitComponent('parent', (ctx: any, cm: boolean) => {
        if (cm) {
          E(0, Comp);
          {
            E(2, ProjectedComp);
            e();
          }
          e();
        }
        p(0, 'val', b(ctx.val));
        p(2, 'val', b(ctx.val));
        Comp.ngComponentDef.h(1, 0);
        ProjectedComp.ngComponentDef.h(3, 2);
        r(1, 0);
        r(3, 2);
      });

      /**
       * <parent [val]="1"></parent>
       * <parent [val]="2"></parent>
       */
      function Template(ctx: any, cm: boolean) {
        if (cm) {
          E(0, ParentComp);
          e();
          E(2, ParentComp);
          e();
        }
        p(0, 'val', 1);
        p(2, 'val', 2);
        ParentComp.ngComponentDef.h(1, 0);
        ParentComp.ngComponentDef.h(3, 2);
        r(1, 0);
        r(3, 2);
      }

      renderToHtml(Template, {});
      expect(events).toEqual(['projected1', 'comp1', 'projected2', 'comp2', 'parent1', 'parent2']);
    });

    it('should be called in correct order with for loops', () => {
      /**
       * <comp [val]="1"></comp>
       * % for (let i = 0; i < 4; i++) {
       *  <comp [val]="i"></comp>
       * % }
       * <comp [val]="4"></comp>
       */
      function Template(ctx: any, cm: boolean) {
        if (cm) {
          E(0, Comp);
          e();
          C(2);
          E(3, Comp);
          e();
        }
        p(0, 'val', 1);
        p(3, 'val', 4);
        Comp.ngComponentDef.h(1, 0);
        Comp.ngComponentDef.h(4, 3);
        cR(2);
        {
          for (let i = 2; i < 4; i++) {
            if (V(0)) {
              E(0, Comp);
              e();
            }
            p(0, 'val', i);
            Comp.ngComponentDef.h(1, 0);
            r(1, 0);
            v();
          }
        }
        cr();
        r(1, 0);
        r(4, 3);
      }

      renderToHtml(Template, {});
      expect(events).toEqual(['comp2', 'comp3', 'comp1', 'comp4']);

    });

    it('should be called in correct order with for loops with children', () => {
      /**
       * <parent [val]="1"></parent>
       * % for(let i = 0; i < 4; i++) {
       *  <parent [val]="i"></parent>
       * % }
       * <parent [val]="4"></parent>
       */
      function Template(ctx: any, cm: boolean) {
        if (cm) {
          E(0, Parent);
          e();
          C(2);
          E(3, Parent);
          e();
        }
        p(0, 'val', 1);
        p(3, 'val', 4);
        Parent.ngComponentDef.h(1, 0);
        Parent.ngComponentDef.h(4, 3);
        cR(2);
        {
          for (let i = 2; i < 4; i++) {
            if (V(0)) {
              E(0, Parent);
              e();
            }
            p(0, 'val', i);
            Parent.ngComponentDef.h(1, 0);
            r(1, 0);
            v();
          }
        }
        cr();
        r(1, 0);
        r(4, 3);
      }

      renderToHtml(Template, {});
      expect(events).toEqual(
          ['comp2', 'parent2', 'comp3', 'parent3', 'comp1', 'comp4', 'parent1', 'parent4']);

    });


    describe('ngAfterViewChecked', () => {

      it('should call ngAfterViewChecked every update', () => {
        /** <comp></comp> */
        function Template(ctx: any, cm: boolean) {
          if (cm) {
            E(0, Comp);
            e();
          }
          Comp.ngComponentDef.h(1, 0);
          r(1, 0);
        }

        renderToHtml(Template, {});
        expect(allEvents).toEqual(['comp init', 'comp check']);

        renderToHtml(Template, {});
        expect(allEvents).toEqual(['comp init', 'comp check', 'comp check']);
      });

      it('should call ngAfterViewChecked with bindings', () => {
        /** <comp [val]="myVal"></comp> */
        function Template(ctx: any, cm: boolean) {
          if (cm) {
            E(0, Comp);
            e();
          }
          p(0, 'val', b(ctx.myVal));
          Comp.ngComponentDef.h(1, 0);
          r(1, 0);
        }

        renderToHtml(Template, {myVal: 5});
        expect(allEvents).toEqual(['comp5 init', 'comp5 check']);

        renderToHtml(Template, {myVal: 6});
        expect(allEvents).toEqual(['comp5 init', 'comp5 check', 'comp6 check']);
      });

      it('should be called in correct order with for loops with children', () => {
        /**
         * <parent [val]="1"></parent>
         * % for(let i = 0; i < 4; i++) {
       *  <parent [val]="i"></parent>
       * % }
         * <parent [val]="4"></parent>
         */
        function Template(ctx: any, cm: boolean) {
          if (cm) {
            E(0, Parent);
            e();
            C(2);
            E(3, Parent);
            e();
          }
          p(0, 'val', 1);
          p(3, 'val', 4);
          Parent.ngComponentDef.h(1, 0);
          Parent.ngComponentDef.h(4, 3);
          cR(2);
          {
            for (let i = 2; i < 4; i++) {
              if (V(0)) {
                E(0, Parent);
                e();
              }
              p(0, 'val', i);
              Parent.ngComponentDef.h(1, 0);
              r(1, 0);
              v();
            }
          }
          cr();
          r(1, 0);
          r(4, 3);
        }

        renderToHtml(Template, {});
        expect(allEvents).toEqual([
          'comp2 init', 'comp2 check', 'parent2 init', 'parent2 check', 'comp3 init', 'comp3 check',
          'parent3 init', 'parent3 check', 'comp1 init', 'comp1 check', 'comp4 init', 'comp4 check',
          'parent1 init', 'parent1 check', 'parent4 init', 'parent4 check'
        ]);

      });

    });

  });

  describe('onDestroy', () => {
    let events: string[];

    beforeEach(() => { events = []; });

    let Comp = createOnDestroyComponent('comp', (ctx: any, cm: boolean) => {
      if (cm) {
        pD(0);
        P(1, 0);
      }
    });
    let Parent = createOnDestroyComponent('parent', getParentTemplate(Comp));

    function createOnDestroyComponent(name: string, template: ComponentTemplate<any>) {
      return class Component {
        val: string = '';
        ngOnDestroy() { events.push(`${name}${this.val}`); }

        static ngComponentDef = defineComponent({
          type: Component,
          tag: name,
          factory: () => new Component(),
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
        }
        cR(0);
        {
          if (ctx.condition) {
            if (V(0)) {
              E(0, Comp);
              e();
            }
            Comp.ngComponentDef.h(1, 0);
            r(1, 0);
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
        }
        cR(0);
        {
          if (ctx.condition) {
            if (V(0)) {
              E(0, Comp);
              e();
              E(2, Comp);
              e();
            }
            p(0, 'val', b('1'));
            p(2, 'val', b('2'));
            Comp.ngComponentDef.h(1, 0);
            Comp.ngComponentDef.h(3, 2);
            r(1, 0);
            r(3, 2);
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
        }
        cR(0);
        {
          if (ctx.condition) {
            if (V(0)) {
              E(0, Parent);
              e();
            }
            Parent.ngComponentDef.h(1, 0);
            r(1, 0);
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
          E(0, Parent);
          e();
        }
        Parent.ngComponentDef.h(1, 0);
        r(1, 0);
      });

      function Template(ctx: any, cm: boolean) {
        if (cm) {
          C(0);
        }
        cR(0);
        {
          if (ctx.condition) {
            if (V(0)) {
              E(0, Grandparent);
              e();
            }
            Grandparent.ngComponentDef.h(1, 0);
            r(1, 0);
            v();
          }
        }
        cr();
      }

      renderToHtml(Template, {condition: true});
      renderToHtml(Template, {condition: false});
      expect(events).toEqual(['comp', 'parent', 'grandparent']);
    });

    it('should be called in projected components before their hosts', () => {
      const ProjectedComp = createOnDestroyComponent('projected', (ctx: any, cm: boolean) => {});

      /**
       * % if (showing) {
       *   <comp [val]="1">
       *     <projected-comp [val]="1"></projected-comp>
       *   </comp>
       *   <comp [val]="2">
       *     <projected-comp [val]="2"></projected-comp>
       *   </comp>
       * }
       */
      function Template(ctx: any, cm: boolean) {
        if (cm) {
          C(0);
        }
        cR(0);
        {
          if (ctx.showing) {
            if (V(0)) {
              E(0, Comp);
              {
                E(2, ProjectedComp);
                e();
              }
              e();
              E(4, Comp);
              {
                E(6, ProjectedComp);
                e();
              }
              e();
            }
            p(0, 'val', 1);
            p(2, 'val', 1);
            p(4, 'val', 2);
            p(6, 'val', 2);
            Comp.ngComponentDef.h(1, 0);
            ProjectedComp.ngComponentDef.h(3, 2);
            Comp.ngComponentDef.h(5, 4);
            ProjectedComp.ngComponentDef.h(7, 6);
            r(1, 0);
            r(3, 2);
            r(5, 4);
            r(7, 6);
            v();
          }
        }
        cr();
      }

      renderToHtml(Template, {showing: true});
      renderToHtml(Template, {showing: false});

      expect(events).toEqual(['projected1', 'comp1', 'projected2', 'comp2']);
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
        }
        cR(0);
        {
          if (ctx.condition) {
            if (V(0)) {
              E(0, Comp);
              e();
              C(2);
              E(3, Comp);
              e();
            }
            p(0, 'val', b('1'));
            p(3, 'val', b('3'));
            Comp.ngComponentDef.h(1, 0);
            Comp.ngComponentDef.h(4, 3);
            cR(2);
            {
              if (ctx.condition2) {
                if (V(0)) {
                  E(0, Comp);
                  e();
                }
                p(0, 'val', b('2'));
                Comp.ngComponentDef.h(1, 0);
                r(1, 0);
                v();
              }
            }
            cr();
            r(1, 0);
            r(4, 3);
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
        }
        cR(0);
        {
          if (ctx.condition) {
            if (V(0)) {
              E(0, Comp);
              e();
              C(2);
              E(3, Comp);
              e();
            }
            p(0, 'val', b('1'));
            p(3, 'val', b('5'));
            Comp.ngComponentDef.h(1, 0);
            Comp.ngComponentDef.h(4, 3);
            cR(2);
            {
              for (let j = 2; j < ctx.len; j++) {
                if (V(0)) {
                  E(0, Comp);
                  e();
                }
                p(0, 'val', b(j));
                Comp.ngComponentDef.h(1, 0);
                r(1, 0);
                v();
              }
            }
            cr();
            r(1, 0);
            r(4, 3);
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
              E(2, Comp);
              e();
              E(4, 'button');
              {
                L('click', ctx.onClick.bind(ctx));
                T(5, 'Click me');
              }
              e();
            }
            Comp.ngComponentDef.h(3, 2);
            r(3, 2);
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

  describe('hook order', () => {
    let events: string[];

    beforeEach(() => { events = []; });

    function createAllHooksComponent(name: string, template: ComponentTemplate<any>) {
      return class Component {
        val: string = '';

        ngOnInit() { events.push(`init ${name}${this.val}`); }
        ngDoCheck() { events.push(`check ${name}${this.val}`); }

        ngAfterContentInit() { events.push(`contentInit ${name}${this.val}`); }
        ngAfterContentChecked() { events.push(`contentCheck ${name}${this.val}`); }

        ngAfterViewInit() { events.push(`viewInit ${name}${this.val}`); }
        ngAfterViewChecked() { events.push(`viewCheck ${name}${this.val}`); }

        static ngComponentDef = defineComponent({
          type: Component,
          tag: name,
          factory: () => new Component(),
          inputs: {val: 'val'}, template
        });
      };
    }

    it('should call all hooks in correct order', () => {
      const Comp = createAllHooksComponent('comp', (ctx: any, cm: boolean) => {});


      /**
       * <comp [val]="1"></comp>
       * <comp [val]="2"></comp>
       */
      function Template(ctx: any, cm: boolean) {
        if (cm) {
          E(0, Comp);
          e();
          E(2, Comp);
          e();
        }
        p(0, 'val', 1);
        p(2, 'val', 2);
        Comp.ngComponentDef.h(1, 0);
        Comp.ngComponentDef.h(3, 2);
        r(1, 0);
        r(3, 2);
      }

      renderToHtml(Template, {});
      expect(events).toEqual([
        'init comp1', 'check comp1', 'init comp2', 'check comp2', 'contentInit comp1',
        'contentCheck comp1', 'contentInit comp2', 'contentCheck comp2', 'viewInit comp1',
        'viewCheck comp1', 'viewInit comp2', 'viewCheck comp2'
      ]);

      events = [];
      renderToHtml(Template, {});
      expect(events).toEqual([
        'check comp1', 'check comp2', 'contentCheck comp1', 'contentCheck comp2', 'viewCheck comp1',
        'viewCheck comp2'
      ]);
    });

    it('should call all hooks in correct order with children', () => {
      const Comp = createAllHooksComponent('comp', (ctx: any, cm: boolean) => {});

      /** <comp [val]="val"></comp> */
      const Parent = createAllHooksComponent('parent', (ctx: any, cm: boolean) => {
        if (cm) {
          E(0, Comp);
          e();
        }
        p(0, 'val', b(ctx.val));
        Comp.ngComponentDef.h(1, 0);
        r(1, 0);
      });

      /**
       * <parent [val]="1"></parent>
       * <parent [val]="2"></parent>
       */
      function Template(ctx: any, cm: boolean) {
        if (cm) {
          E(0, Parent);
          e();
          E(2, Parent);
          e();
        }
        p(0, 'val', 1);
        p(2, 'val', 2);
        Parent.ngComponentDef.h(1, 0);
        Parent.ngComponentDef.h(3, 2);
        r(1, 0);
        r(3, 2);
      }

      renderToHtml(Template, {});
      expect(events).toEqual([
        'init parent1',        'check parent1',        'init parent2',
        'check parent2',       'contentInit parent1',  'contentCheck parent1',
        'contentInit parent2', 'contentCheck parent2', 'init comp1',
        'check comp1',         'contentInit comp1',    'contentCheck comp1',
        'viewInit comp1',      'viewCheck comp1',      'init comp2',
        'check comp2',         'contentInit comp2',    'contentCheck comp2',
        'viewInit comp2',      'viewCheck comp2',      'viewInit parent1',
        'viewCheck parent1',   'viewInit parent2',     'viewCheck parent2'
      ]);

      events = [];
      renderToHtml(Template, {});
      expect(events).toEqual([
        'check parent1', 'check parent2', 'contentCheck parent1', 'contentCheck parent2',
        'check comp1', 'contentCheck comp1', 'viewCheck comp1', 'check comp2', 'contentCheck comp2',
        'viewCheck comp2', 'viewCheck parent1', 'viewCheck parent2'
      ]);

    });

  });

});
