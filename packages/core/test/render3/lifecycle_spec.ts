/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {SimpleChanges} from '../../src/core';
import {ComponentTemplate, NgOnChangesFeature, defineComponent, defineDirective} from '../../src/render3/index';
import {bind, container, containerRefreshEnd, containerRefreshStart, directiveRefresh, elementEnd, elementProperty, elementStart, embeddedViewEnd, embeddedViewStart, listener, projection, projectionDef, store, text} from '../../src/render3/instructions';

import {containerEl, renderToHtml} from './render_util';

describe('lifecycles', () => {

  function getParentTemplate(type: any) {
    return (ctx: any, cm: boolean) => {
      if (cm) {
        elementStart(0, type);
        elementEnd();
      }
      elementProperty(0, 'val', bind(ctx.val));
      type.ngComponentDef.h(1, 0);
      directiveRefresh(1, 0);
    };
  }

  describe('onInit', () => {
    let events: string[];

    beforeEach(() => { events = []; });

    let Comp = createOnInitComponent('comp', (ctx: any, cm: boolean) => {
      if (cm) {
        projectionDef(0);
        elementStart(1, 'div');
        { projection(2, 0); }
        elementEnd();
      }
    });
    let Parent = createOnInitComponent('parent', getParentTemplate(Comp));
    let ProjectedComp = createOnInitComponent('projected', (ctx: any, cm: boolean) => {
      if (cm) {
        text(0, 'content');
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

    class Directive {
      ngOnInit() { events.push('dir'); }

      static ngDirectiveDef = defineDirective({type: Directive, factory: () => new Directive()});
    }

    it('should call onInit method after inputs are set in creation mode (and not in update mode)',
       () => {
         /** <comp [val]="val"></comp> */
         function Template(ctx: any, cm: boolean) {
           if (cm) {
             elementStart(0, Comp);
             elementEnd();
           }
           elementProperty(0, 'val', bind(ctx.val));
           Comp.ngComponentDef.h(1, 0);
           directiveRefresh(1, 0);
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
          elementStart(0, Parent);
          elementEnd();
        }
        Parent.ngComponentDef.h(1, 0);
        directiveRefresh(1, 0);
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
          elementStart(0, Parent);
          elementEnd();
          elementStart(2, Parent);
          elementEnd();
        }
        elementProperty(0, 'val', 1);
        elementProperty(2, 'val', 2);
        Parent.ngComponentDef.h(1, 0);
        Parent.ngComponentDef.h(3, 2);
        directiveRefresh(1, 0);
        directiveRefresh(3, 2);
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
          container(0);
        }
        containerRefreshStart(0);
        {
          if (ctx.condition) {
            if (embeddedViewStart(0)) {
              elementStart(0, Comp);
              elementEnd();
            }
            Comp.ngComponentDef.h(1, 0);
            directiveRefresh(1, 0);
            embeddedViewEnd();
          }
        }
        containerRefreshEnd();
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
          elementStart(0, Comp);
          { elementStart(2, ProjectedComp); }
          elementEnd();
        }
        Comp.ngComponentDef.h(1, 0);
        ProjectedComp.ngComponentDef.h(3, 2);
        directiveRefresh(1, 0);
        directiveRefresh(3, 2);
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
          elementStart(0, Comp);
          { elementStart(2, ProjectedComp); }
          elementEnd();
          elementStart(4, Comp);
          { elementStart(6, ProjectedComp); }
          elementEnd();
        }
        elementProperty(0, 'val', 1);
        elementProperty(2, 'val', 1);
        elementProperty(4, 'val', 2);
        elementProperty(6, 'val', 2);
        Comp.ngComponentDef.h(1, 0);
        ProjectedComp.ngComponentDef.h(3, 2);
        Comp.ngComponentDef.h(5, 4);
        ProjectedComp.ngComponentDef.h(7, 6);
        directiveRefresh(1, 0);
        directiveRefresh(3, 2);
        directiveRefresh(5, 4);
        directiveRefresh(7, 6);
      }

      renderToHtml(Template, {});
      expect(events).toEqual(['comp1', 'projected1', 'comp2', 'projected2']);
    });

    it('should be called on directives after component', () => {
      /** <comp directive></comp> */
      function Template(ctx: any, cm: boolean) {
        if (cm) {
          elementStart(0, Comp, null, [Directive]);
          elementEnd();
        }
        Comp.ngComponentDef.h(1, 0);
        Directive.ngDirectiveDef.h(2, 0);
        directiveRefresh(1, 0);
        directiveRefresh(2, 0);
      }

      renderToHtml(Template, {});
      expect(events).toEqual(['comp', 'dir']);

      renderToHtml(Template, {});
      expect(events).toEqual(['comp', 'dir']);

    });

    it('should be called on directives on an element', () => {
      /** <div directive></div> */
      function Template(ctx: any, cm: boolean) {
        if (cm) {
          elementStart(0, 'div', null, [Directive]);
          elementEnd();
        }
        Directive.ngDirectiveDef.h(1, 0);
        directiveRefresh(1, 0);
      }

      renderToHtml(Template, {});
      expect(events).toEqual(['dir']);

      renderToHtml(Template, {});
      expect(events).toEqual(['dir']);
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
          elementStart(0, Comp);
          elementEnd();
          container(2);
          elementStart(3, Comp);
          elementEnd();
        }
        elementProperty(0, 'val', 1);
        elementProperty(3, 'val', 5);
        Comp.ngComponentDef.h(1, 0);
        Comp.ngComponentDef.h(4, 3);
        containerRefreshStart(2);
        {
          for (let j = 2; j < 5; j++) {
            if (embeddedViewStart(0)) {
              elementStart(0, Comp);
              elementEnd();
            }
            elementProperty(0, 'val', j);
            Comp.ngComponentDef.h(1, 0);
            directiveRefresh(1, 0);
            embeddedViewEnd();
          }
        }
        containerRefreshEnd();
        directiveRefresh(1, 0);
        directiveRefresh(4, 3);
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
          elementStart(0, Parent);
          elementEnd();
          container(2);
          elementStart(3, Parent);
          elementEnd();
        }
        elementProperty(0, 'val', 1);
        elementProperty(3, 'val', 5);
        Parent.ngComponentDef.h(1, 0);
        Parent.ngComponentDef.h(4, 3);
        containerRefreshStart(2);
        {
          for (let j = 2; j < 5; j++) {
            if (embeddedViewStart(0)) {
              elementStart(0, Parent);
              elementEnd();
            }
            elementProperty(0, 'val', j);
            Parent.ngComponentDef.h(1, 0);
            directiveRefresh(1, 0);
            embeddedViewEnd();
          }
        }
        containerRefreshEnd();
        directiveRefresh(1, 0);
        directiveRefresh(4, 3);
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

    class Directive {
      ngDoCheck() { events.push('dir'); }

      static ngDirectiveDef = defineDirective({type: Directive, factory: () => new Directive()});
    }

    it('should call doCheck on every refresh', () => {
      /** <comp></comp> */
      function Template(ctx: any, cm: boolean) {
        if (cm) {
          elementStart(0, Comp);
          elementEnd();
        }
        Comp.ngComponentDef.h(1, 0);
        directiveRefresh(1, 0);
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
          elementStart(0, Parent);
          elementEnd();
        }
        Parent.ngComponentDef.h(1, 0);
        directiveRefresh(1, 0);
      }

      renderToHtml(Template, {});
      expect(events).toEqual(['parent', 'comp']);
    });

    it('should call ngOnInit before ngDoCheck if creation mode', () => {
      /** <comp></comp> */
      function Template(ctx: any, cm: boolean) {
        if (cm) {
          elementStart(0, Comp);
          elementEnd();
        }
        Comp.ngComponentDef.h(1, 0);
        directiveRefresh(1, 0);
      }

      renderToHtml(Template, {});
      expect(allEvents).toEqual(['init comp', 'check comp']);

      renderToHtml(Template, {});
      expect(allEvents).toEqual(['init comp', 'check comp', 'check comp']);
    });

    it('should be called on directives after component', () => {
      /** <comp directive></comp> */
      function Template(ctx: any, cm: boolean) {
        if (cm) {
          elementStart(0, Comp, null, [Directive]);
          elementEnd();
        }
        Comp.ngComponentDef.h(1, 0);
        Directive.ngDirectiveDef.h(2, 0);
        directiveRefresh(1, 0);
        directiveRefresh(2, 0);
      }

      renderToHtml(Template, {});
      expect(events).toEqual(['comp', 'dir']);

      renderToHtml(Template, {});
      expect(events).toEqual(['comp', 'dir', 'comp', 'dir']);

    });

    it('should be called on directives on an element', () => {
      /** <div directive></div> */
      function Template(ctx: any, cm: boolean) {
        if (cm) {
          elementStart(0, 'div', null, [Directive]);
          elementEnd();
        }
        Directive.ngDirectiveDef.h(1, 0);
        directiveRefresh(1, 0);
      }

      renderToHtml(Template, {});
      expect(events).toEqual(['dir']);

      renderToHtml(Template, {});
      expect(events).toEqual(['dir', 'dir']);
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
        projectionDef(0);
        projection(1, 0);
      }
    });

    let Parent = createAfterContentInitComp('parent', function(ctx: any, cm: boolean) {
      if (cm) {
        projectionDef(0);
        elementStart(1, Comp);
        { projection(3, 0); }
        elementEnd();
      }
      elementProperty(1, 'val', bind(ctx.val));
      Comp.ngComponentDef.h(2, 1);
      directiveRefresh(2, 1);
    });

    let ProjectedComp = createAfterContentInitComp('projected', (ctx: any, cm: boolean) => {
      if (cm) {
        projectionDef(0);
        projection(1, 0);
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
          elementStart(0, Comp);
          { text(2, 'content'); }
          elementEnd();
        }
        Comp.ngComponentDef.h(1, 0);
        directiveRefresh(1, 0);
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
          container(0);
        }
        containerRefreshStart(0);
        {
          if (ctx.condition) {
            if (embeddedViewStart(0)) {
              elementStart(0, Comp);
              { text(2, 'content'); }
              elementEnd();
            }
            Comp.ngComponentDef.h(1, 0);
            directiveRefresh(1, 0);
            embeddedViewEnd();
          }
        }
        containerRefreshEnd();
      }

      renderToHtml(Template, {condition: true});
      expect(events).toEqual(['comp']);

      renderToHtml(Template, {condition: false});
      expect(events).toEqual(['comp']);

      renderToHtml(Template, {condition: true});
      expect(events).toEqual(['comp', 'comp']);
    });

    it('should be called in parents before children', () => {
      /**
       * <parent>content</parent>
       *
       * parent template: <comp><ng-content></ng-content></comp>
       */
      function Template(ctx: any, cm: boolean) {
        if (cm) {
          elementStart(0, Parent);
          { text(2, 'content'); }
          elementEnd();
        }
        Parent.ngComponentDef.h(1, 0);
        directiveRefresh(1, 0);
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
          elementStart(0, Parent);
          { text(2, 'content'); }
          elementEnd();
          elementStart(3, Parent);
          { text(5, 'content'); }
          elementEnd();
        }
        elementProperty(0, 'val', 1);
        elementProperty(3, 'val', 2);
        Parent.ngComponentDef.h(1, 0);
        Parent.ngComponentDef.h(4, 3);
        directiveRefresh(1, 0);
        directiveRefresh(4, 3);
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
          elementStart(0, Parent);
          {
            elementStart(2, ProjectedComp);
            { text(4, 'content'); }
            elementEnd();
          }
          elementEnd();
        }
        Parent.ngComponentDef.h(1, 0);
        ProjectedComp.ngComponentDef.h(3, 2);
        directiveRefresh(1, 0);
        directiveRefresh(3, 2);
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
          elementStart(0, Parent);
          {
            elementStart(2, ProjectedComp);
            { text(4, 'content'); }
            elementEnd();
          }
          elementEnd();
          elementStart(5, Parent);
          {
            elementStart(7, ProjectedComp);
            { text(9, 'content'); }
            elementEnd();
          }
          elementEnd();
        }
        elementProperty(0, 'val', 1);
        elementProperty(2, 'val', 1);
        elementProperty(5, 'val', 2);
        elementProperty(7, 'val', 2);
        Parent.ngComponentDef.h(1, 0);
        ProjectedComp.ngComponentDef.h(3, 2);
        Parent.ngComponentDef.h(6, 5);
        ProjectedComp.ngComponentDef.h(8, 7);
        directiveRefresh(1, 0);
        directiveRefresh(3, 2);
        directiveRefresh(6, 5);
        directiveRefresh(8, 7);
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
          elementStart(0, Comp);
          { text(2, 'content'); }
          elementEnd();
          container(3);
          elementStart(4, Comp);
          { text(6, 'content'); }
          elementEnd();
        }
        elementProperty(0, 'val', 1);
        elementProperty(4, 'val', 4);
        Comp.ngComponentDef.h(1, 0);
        Comp.ngComponentDef.h(5, 4);
        containerRefreshStart(3);
        {
          for (let i = 2; i < 4; i++) {
            if (embeddedViewStart(0)) {
              elementStart(0, Comp);
              { text(2, 'content'); }
              elementEnd();
            }
            elementProperty(0, 'val', i);
            Comp.ngComponentDef.h(1, 0);
            directiveRefresh(1, 0);
            embeddedViewEnd();
          }
        }
        containerRefreshEnd();
        directiveRefresh(1, 0);
        directiveRefresh(5, 4);
      }

      renderToHtml(Template, {});
      expect(events).toEqual(['comp2', 'comp3', 'comp1', 'comp4']);
    });

    function ForLoopWithChildrenTemplate(ctx: any, cm: boolean) {
      if (cm) {
        elementStart(0, Parent);
        { text(2, 'content'); }
        elementEnd();
        container(3);
        elementStart(4, Parent);
        { text(6, 'content'); }
        elementEnd();
      }
      elementProperty(0, 'val', 1);
      elementProperty(4, 'val', 4);
      Parent.ngComponentDef.h(1, 0);
      Parent.ngComponentDef.h(5, 4);
      containerRefreshStart(3);
      {
        for (let i = 2; i < 4; i++) {
          if (embeddedViewStart(0)) {
            elementStart(0, Parent);
            { text(2, 'content'); }
            elementEnd();
          }
          elementProperty(0, 'val', i);
          Parent.ngComponentDef.h(1, 0);
          directiveRefresh(1, 0);
          embeddedViewEnd();
        }
      }
      containerRefreshEnd();
      directiveRefresh(1, 0);
      directiveRefresh(5, 4);
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
            elementStart(0, Comp);
            { text(2, 'content'); }
            elementEnd();
          }
          Comp.ngComponentDef.h(1, 0);
          directiveRefresh(1, 0);
        }

        renderToHtml(Template, {});
        expect(allEvents).toEqual(['comp init', 'comp check']);

        renderToHtml(Template, {});
        expect(allEvents).toEqual(['comp init', 'comp check', 'comp check']);

      });

    });

    describe('directives', () => {
      class Directive {
        ngAfterContentInit() { events.push('init'); }
        ngAfterContentChecked() { events.push('check'); }

        static ngDirectiveDef = defineDirective({type: Directive, factory: () => new Directive()});
      }

      it('should be called on directives after component', () => {
        /** <comp directive></comp> */
        function Template(ctx: any, cm: boolean) {
          if (cm) {
            elementStart(0, Comp, null, [Directive]);
            elementEnd();
          }
          Comp.ngComponentDef.h(1, 0);
          Directive.ngDirectiveDef.h(2, 0);
          directiveRefresh(1, 0);
          directiveRefresh(2, 0);
        }

        renderToHtml(Template, {});
        expect(events).toEqual(['comp', 'init', 'check']);
      });

      it('should be called on directives on an element', () => {
        /** <div directive></div> */
        function Template(ctx: any, cm: boolean) {
          if (cm) {
            elementStart(0, 'div', null, [Directive]);
            elementEnd();
          }
          Directive.ngDirectiveDef.h(1, 0);
          directiveRefresh(1, 0);
        }

        renderToHtml(Template, {});
        expect(events).toEqual(['init', 'check']);
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
        projectionDef(0);
        elementStart(1, 'div');
        { projection(2, 0); }
        elementEnd();
      }
    });
    let Parent = createAfterViewInitComponent('parent', getParentTemplate(Comp));

    let ProjectedComp = createAfterViewInitComponent('projected', (ctx: any, cm: boolean) => {
      if (cm) {
        text(0, 'content');
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
          elementStart(0, Comp);
          elementEnd();
        }
        Comp.ngComponentDef.h(1, 0);
        directiveRefresh(1, 0);
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
          container(0);
        }
        containerRefreshStart(0);
        {
          if (ctx.condition) {
            if (embeddedViewStart(0)) {
              elementStart(0, Comp);
              elementEnd();
            }
            Comp.ngComponentDef.h(1, 0);
            directiveRefresh(1, 0);
            embeddedViewEnd();
          }
        }
        containerRefreshEnd();
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
          elementStart(0, Parent);
          elementEnd();
        }
        Parent.ngComponentDef.h(1, 0);
        directiveRefresh(1, 0);
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
          elementStart(0, Parent);
          elementEnd();
          elementStart(2, Parent);
          elementEnd();
        }
        elementProperty(0, 'val', 1);
        elementProperty(2, 'val', 2);
        Parent.ngComponentDef.h(1, 0);
        Parent.ngComponentDef.h(3, 2);
        directiveRefresh(1, 0);
        directiveRefresh(3, 2);
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
          elementStart(0, Comp);
          {
            elementStart(2, ProjectedComp);
            elementEnd();
          }
          elementEnd();
        }
        Comp.ngComponentDef.h(1, 0);
        ProjectedComp.ngComponentDef.h(3, 2);
        directiveRefresh(1, 0);
        directiveRefresh(3, 2);
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
          elementStart(0, Comp);
          {
            elementStart(2, ProjectedComp);
            elementEnd();
          }
          elementEnd();
          elementStart(4, Comp);
          {
            elementStart(6, ProjectedComp);
            elementEnd();
          }
          elementEnd();
        }
        elementProperty(0, 'val', 1);
        elementProperty(2, 'val', 1);
        elementProperty(4, 'val', 2);
        elementProperty(6, 'val', 2);
        Comp.ngComponentDef.h(1, 0);
        ProjectedComp.ngComponentDef.h(3, 2);
        Comp.ngComponentDef.h(5, 4);
        ProjectedComp.ngComponentDef.h(7, 6);
        directiveRefresh(1, 0);
        directiveRefresh(3, 2);
        directiveRefresh(5, 4);
        directiveRefresh(7, 6);
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
          elementStart(0, Comp);
          {
            elementStart(2, ProjectedComp);
            elementEnd();
          }
          elementEnd();
        }
        elementProperty(0, 'val', bind(ctx.val));
        elementProperty(2, 'val', bind(ctx.val));
        Comp.ngComponentDef.h(1, 0);
        ProjectedComp.ngComponentDef.h(3, 2);
        directiveRefresh(1, 0);
        directiveRefresh(3, 2);
      });

      /**
       * <parent [val]="1"></parent>
       * <parent [val]="2"></parent>
       */
      function Template(ctx: any, cm: boolean) {
        if (cm) {
          elementStart(0, ParentComp);
          elementEnd();
          elementStart(2, ParentComp);
          elementEnd();
        }
        elementProperty(0, 'val', 1);
        elementProperty(2, 'val', 2);
        ParentComp.ngComponentDef.h(1, 0);
        ParentComp.ngComponentDef.h(3, 2);
        directiveRefresh(1, 0);
        directiveRefresh(3, 2);
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
          elementStart(0, Comp);
          elementEnd();
          container(2);
          elementStart(3, Comp);
          elementEnd();
        }
        elementProperty(0, 'val', 1);
        elementProperty(3, 'val', 4);
        Comp.ngComponentDef.h(1, 0);
        Comp.ngComponentDef.h(4, 3);
        containerRefreshStart(2);
        {
          for (let i = 2; i < 4; i++) {
            if (embeddedViewStart(0)) {
              elementStart(0, Comp);
              elementEnd();
            }
            elementProperty(0, 'val', i);
            Comp.ngComponentDef.h(1, 0);
            directiveRefresh(1, 0);
            embeddedViewEnd();
          }
        }
        containerRefreshEnd();
        directiveRefresh(1, 0);
        directiveRefresh(4, 3);
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
          elementStart(0, Parent);
          elementEnd();
          container(2);
          elementStart(3, Parent);
          elementEnd();
        }
        elementProperty(0, 'val', 1);
        elementProperty(3, 'val', 4);
        Parent.ngComponentDef.h(1, 0);
        Parent.ngComponentDef.h(4, 3);
        containerRefreshStart(2);
        {
          for (let i = 2; i < 4; i++) {
            if (embeddedViewStart(0)) {
              elementStart(0, Parent);
              elementEnd();
            }
            elementProperty(0, 'val', i);
            Parent.ngComponentDef.h(1, 0);
            directiveRefresh(1, 0);
            embeddedViewEnd();
          }
        }
        containerRefreshEnd();
        directiveRefresh(1, 0);
        directiveRefresh(4, 3);
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
            elementStart(0, Comp);
            elementEnd();
          }
          Comp.ngComponentDef.h(1, 0);
          directiveRefresh(1, 0);
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
            elementStart(0, Comp);
            elementEnd();
          }
          elementProperty(0, 'val', bind(ctx.myVal));
          Comp.ngComponentDef.h(1, 0);
          directiveRefresh(1, 0);
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
            elementStart(0, Parent);
            elementEnd();
            container(2);
            elementStart(3, Parent);
            elementEnd();
          }
          elementProperty(0, 'val', 1);
          elementProperty(3, 'val', 4);
          Parent.ngComponentDef.h(1, 0);
          Parent.ngComponentDef.h(4, 3);
          containerRefreshStart(2);
          {
            for (let i = 2; i < 4; i++) {
              if (embeddedViewStart(0)) {
                elementStart(0, Parent);
                elementEnd();
              }
              elementProperty(0, 'val', i);
              Parent.ngComponentDef.h(1, 0);
              directiveRefresh(1, 0);
              embeddedViewEnd();
            }
          }
          containerRefreshEnd();
          directiveRefresh(1, 0);
          directiveRefresh(4, 3);
        }

        renderToHtml(Template, {});
        expect(allEvents).toEqual([
          'comp2 init', 'comp2 check', 'parent2 init', 'parent2 check', 'comp3 init', 'comp3 check',
          'parent3 init', 'parent3 check', 'comp1 init', 'comp1 check', 'comp4 init', 'comp4 check',
          'parent1 init', 'parent1 check', 'parent4 init', 'parent4 check'
        ]);

      });

    });

    describe('directives', () => {
      class Directive {
        ngAfterViewInit() { events.push('init'); }
        ngAfterViewChecked() { events.push('check'); }

        static ngDirectiveDef = defineDirective({type: Directive, factory: () => new Directive()});
      }

      it('should be called on directives after component', () => {
        /** <comp directive></comp> */
        function Template(ctx: any, cm: boolean) {
          if (cm) {
            elementStart(0, Comp, null, [Directive]);
            elementEnd();
          }
          Comp.ngComponentDef.h(1, 0);
          Directive.ngDirectiveDef.h(2, 0);
          directiveRefresh(1, 0);
          directiveRefresh(2, 0);
        }

        renderToHtml(Template, {});
        expect(events).toEqual(['comp', 'init', 'check']);
      });

      it('should be called on directives on an element', () => {
        /** <div directive></div> */
        function Template(ctx: any, cm: boolean) {
          if (cm) {
            elementStart(0, 'div', null, [Directive]);
            elementEnd();
          }
          Directive.ngDirectiveDef.h(1, 0);
          directiveRefresh(1, 0);
        }

        renderToHtml(Template, {});
        expect(events).toEqual(['init', 'check']);
      });
    });
  });

  describe('onDestroy', () => {
    let events: string[];

    beforeEach(() => { events = []; });

    let Comp = createOnDestroyComponent('comp', (ctx: any, cm: boolean) => {
      if (cm) {
        projectionDef(0);
        projection(1, 0);
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

    class Directive {
      ngOnDestroy() { events.push('dir'); }

      static ngDirectiveDef = defineDirective({type: Directive, factory: () => new Directive()});
    }

    it('should call destroy when view is removed', () => {
      /**
       * % if (condition) {
       *   <comp></comp>
       * % }
       */

      function Template(ctx: any, cm: boolean) {
        if (cm) {
          container(0);
        }
        containerRefreshStart(0);
        {
          if (ctx.condition) {
            if (embeddedViewStart(0)) {
              elementStart(0, Comp);
              elementEnd();
            }
            Comp.ngComponentDef.h(1, 0);
            directiveRefresh(1, 0);
            embeddedViewEnd();
          }
        }
        containerRefreshEnd();
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
          container(0);
        }
        containerRefreshStart(0);
        {
          if (ctx.condition) {
            if (embeddedViewStart(0)) {
              elementStart(0, Comp);
              elementEnd();
              elementStart(2, Comp);
              elementEnd();
            }
            elementProperty(0, 'val', bind('1'));
            elementProperty(2, 'val', bind('2'));
            Comp.ngComponentDef.h(1, 0);
            Comp.ngComponentDef.h(3, 2);
            directiveRefresh(1, 0);
            directiveRefresh(3, 2);
            embeddedViewEnd();
          }
        }
        containerRefreshEnd();
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
          container(0);
        }
        containerRefreshStart(0);
        {
          if (ctx.condition) {
            if (embeddedViewStart(0)) {
              elementStart(0, Parent);
              elementEnd();
            }
            Parent.ngComponentDef.h(1, 0);
            directiveRefresh(1, 0);
            embeddedViewEnd();
          }
        }
        containerRefreshEnd();
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
          elementStart(0, Parent);
          elementEnd();
        }
        Parent.ngComponentDef.h(1, 0);
        directiveRefresh(1, 0);
      });

      function Template(ctx: any, cm: boolean) {
        if (cm) {
          container(0);
        }
        containerRefreshStart(0);
        {
          if (ctx.condition) {
            if (embeddedViewStart(0)) {
              elementStart(0, Grandparent);
              elementEnd();
            }
            Grandparent.ngComponentDef.h(1, 0);
            directiveRefresh(1, 0);
            embeddedViewEnd();
          }
        }
        containerRefreshEnd();
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
          container(0);
        }
        containerRefreshStart(0);
        {
          if (ctx.showing) {
            if (embeddedViewStart(0)) {
              elementStart(0, Comp);
              {
                elementStart(2, ProjectedComp);
                elementEnd();
              }
              elementEnd();
              elementStart(4, Comp);
              {
                elementStart(6, ProjectedComp);
                elementEnd();
              }
              elementEnd();
            }
            elementProperty(0, 'val', 1);
            elementProperty(2, 'val', 1);
            elementProperty(4, 'val', 2);
            elementProperty(6, 'val', 2);
            Comp.ngComponentDef.h(1, 0);
            ProjectedComp.ngComponentDef.h(3, 2);
            Comp.ngComponentDef.h(5, 4);
            ProjectedComp.ngComponentDef.h(7, 6);
            directiveRefresh(1, 0);
            directiveRefresh(3, 2);
            directiveRefresh(5, 4);
            directiveRefresh(7, 6);
            embeddedViewEnd();
          }
        }
        containerRefreshEnd();
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
          container(0);
        }
        containerRefreshStart(0);
        {
          if (ctx.condition) {
            if (embeddedViewStart(0)) {
              elementStart(0, Comp);
              elementEnd();
              container(2);
              elementStart(3, Comp);
              elementEnd();
            }
            elementProperty(0, 'val', bind('1'));
            elementProperty(3, 'val', bind('3'));
            Comp.ngComponentDef.h(1, 0);
            Comp.ngComponentDef.h(4, 3);
            containerRefreshStart(2);
            {
              if (ctx.condition2) {
                if (embeddedViewStart(0)) {
                  elementStart(0, Comp);
                  elementEnd();
                }
                elementProperty(0, 'val', bind('2'));
                Comp.ngComponentDef.h(1, 0);
                directiveRefresh(1, 0);
                embeddedViewEnd();
              }
            }
            containerRefreshEnd();
            directiveRefresh(1, 0);
            directiveRefresh(4, 3);
            embeddedViewEnd();
          }
        }
        containerRefreshEnd();
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
          container(0);
        }
        containerRefreshStart(0);
        {
          if (ctx.condition) {
            if (embeddedViewStart(0)) {
              elementStart(0, Comp);
              elementEnd();
              container(2);
              elementStart(3, Comp);
              elementEnd();
            }
            elementProperty(0, 'val', bind('1'));
            elementProperty(3, 'val', bind('5'));
            Comp.ngComponentDef.h(1, 0);
            Comp.ngComponentDef.h(4, 3);
            containerRefreshStart(2);
            {
              for (let j = 2; j < ctx.len; j++) {
                if (embeddedViewStart(0)) {
                  elementStart(0, Comp);
                  elementEnd();
                }
                elementProperty(0, 'val', bind(j));
                Comp.ngComponentDef.h(1, 0);
                directiveRefresh(1, 0);
                embeddedViewEnd();
              }
            }
            containerRefreshEnd();
            directiveRefresh(1, 0);
            directiveRefresh(4, 3);
            embeddedViewEnd();
          }
        }
        containerRefreshEnd();
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
          container(0);
        }
        containerRefreshStart(0);
        {
          if (ctx.condition) {
            if (embeddedViewStart(0)) {
              elementStart(0, 'button');
              {
                listener('click', ctx.onClick.bind(ctx));
                text(1, 'Click me');
              }
              elementEnd();
              elementStart(2, Comp);
              elementEnd();
              elementStart(4, 'button');
              {
                listener('click', ctx.onClick.bind(ctx));
                text(5, 'Click me');
              }
              elementEnd();
            }
            Comp.ngComponentDef.h(3, 2);
            directiveRefresh(3, 2);
            embeddedViewEnd();
          }
        }
        containerRefreshEnd();
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

    it('should be called on directives after component', () => {
      /**
       * % if (condition) {
       *   <comp></comp>
       * % }
       */

      function Template(ctx: any, cm: boolean) {
        if (cm) {
          container(0);
        }
        containerRefreshStart(0);
        {
          if (ctx.condition) {
            if (embeddedViewStart(0)) {
              elementStart(0, Comp, null, [Directive]);
              elementEnd();
            }
            Comp.ngComponentDef.h(1, 0);
            Directive.ngDirectiveDef.h(2, 0);
            directiveRefresh(1, 0);
            directiveRefresh(2, 0);
            embeddedViewEnd();
          }
        }
        containerRefreshEnd();
      }

      renderToHtml(Template, {condition: true});
      expect(events).toEqual([]);

      renderToHtml(Template, {condition: false});
      expect(events).toEqual(['comp', 'dir']);

    });

    it('should be called on directives on an element', () => {
      /**
       * % if (condition) {
       *   <div directive></div>
       * % }
       */

      function Template(ctx: any, cm: boolean) {
        if (cm) {
          container(0);
        }
        containerRefreshStart(0);
        {
          if (ctx.condition) {
            if (embeddedViewStart(0)) {
              elementStart(0, 'div', null, [Directive]);
              elementEnd();
            }
            Directive.ngDirectiveDef.h(1, 0);
            directiveRefresh(1, 0);
            embeddedViewEnd();
          }
        }
        containerRefreshEnd();
      }

      renderToHtml(Template, {condition: true});
      expect(events).toEqual([]);

      renderToHtml(Template, {condition: false});
      expect(events).toEqual(['dir']);
    });

  });

  describe('onChanges', () => {
    let events: string[];

    beforeEach(() => { events = []; });

    const Comp = createOnChangesComponent('comp', (ctx: any, cm: boolean) => {
      if (cm) {
        projectionDef(0);
        elementStart(1, 'div');
        { projection(2, 0); }
        elementEnd();
      }
    });
    const Parent = createOnChangesComponent('parent', (ctx: any, cm: boolean) => {
      if (cm) {
        elementStart(0, Comp);
        elementEnd();
      }
      elementProperty(0, 'val1', bind(ctx.a));
      elementProperty(0, 'publicName', bind(ctx.b));
      Comp.ngComponentDef.h(1, 0);
      directiveRefresh(1, 0);
    });
    const ProjectedComp = createOnChangesComponent('projected', (ctx: any, cm: boolean) => {
      if (cm) {
        text(0, 'content');
      }
    });


    function createOnChangesComponent(name: string, template: ComponentTemplate<any>) {
      return class Component {
        // @Input() val1: string;
        // @Input('publicName') val2: string;
        a: string = 'wasVal1BeforeMinification';
        b: string = 'wasVal2BeforeMinification';
        ngOnChanges(simpleChanges: SimpleChanges) {
          events.push(
              `comp=${name} val1=${this.a} val2=${this.b} - changed=[${Object.getOwnPropertyNames(simpleChanges).join(',')}]`);
        }

        static ngComponentDef = defineComponent({
          type: Component,
          tag: name,
          factory: () => new Component(),
          features: [NgOnChangesFeature],
          inputs: {a: 'val1', b: 'publicName'},
          inputsPropertyName: {b: 'val2'}, template
        });
      };
    }

    class Directive {
      // @Input() val1: string;
      // @Input('publicName') val2: string;
      a: string = 'wasVal1BeforeMinification';
      b: string = 'wasVal2BeforeMinification';
      ngOnChanges(simpleChanges: SimpleChanges) {
        events.push(
            `dir - val1=${this.a} val2=${this.b} - changed=[${Object.getOwnPropertyNames(simpleChanges).join(',')}]`);
      }

      static ngDirectiveDef = defineDirective({
        type: Directive,
        factory: () => new Directive(),
        features: [NgOnChangesFeature],
        inputs: {a: 'val1', b: 'publicName'},
        inputsPropertyName: {b: 'val2'}
      });
    }

    it('should call onChanges method after inputs are set in creation and update mode', () => {
      /** <comp [val1]="val1" [publicName]="val2"></comp> */
      function Template(ctx: any, cm: boolean) {
        if (cm) {
          elementStart(0, Comp);
          elementEnd();
        }
        elementProperty(0, 'val1', bind(ctx.val1));
        elementProperty(0, 'publicName', bind(ctx.val2));
        Comp.ngComponentDef.h(1, 0);
        directiveRefresh(1, 0);
      }

      renderToHtml(Template, {val1: '1', val2: 'a'});
      expect(events).toEqual(['comp=comp val1=1 val2=a - changed=[val1,val2]']);

      renderToHtml(Template, {val1: '2', val2: 'b'});
      expect(events).toEqual([
        'comp=comp val1=1 val2=a - changed=[val1,val2]',
        'comp=comp val1=2 val2=b - changed=[val1,val2]'
      ]);
    });

    it('should call parent onChanges before child onChanges', () => {
      /**
       * <parent></parent>
       * parent temp: <comp></comp>
       */

      function Template(ctx: any, cm: boolean) {
        if (cm) {
          elementStart(0, Parent);
          elementEnd();
        }
        elementProperty(0, 'val1', bind(ctx.val1));
        elementProperty(0, 'publicName', bind(ctx.val2));
        Parent.ngComponentDef.h(1, 0);
        directiveRefresh(1, 0);
      }

      renderToHtml(Template, {val1: '1', val2: 'a'});
      expect(events).toEqual([
        'comp=parent val1=1 val2=a - changed=[val1,val2]',
        'comp=comp val1=1 val2=a - changed=[val1,val2]'
      ]);
    });

    it('should call all parent onChanges across view before calling children onChanges', () => {
      /**
       * <parent [val]="1"></parent>
       * <parent [val]="2"></parent>
       *
       * parent temp: <comp [val]="val"></comp>
       */

      function Template(ctx: any, cm: boolean) {
        if (cm) {
          elementStart(0, Parent);
          elementEnd();
          elementStart(2, Parent);
          elementEnd();
        }
        elementProperty(0, 'val1', bind(1));
        elementProperty(0, 'publicName', bind(1));
        elementProperty(2, 'val1', bind(2));
        elementProperty(2, 'publicName', bind(2));
        Parent.ngComponentDef.h(1, 0);
        Parent.ngComponentDef.h(3, 2);
        directiveRefresh(1, 0);
        directiveRefresh(3, 2);
      }

      renderToHtml(Template, {});
      expect(events).toEqual([
        'comp=parent val1=1 val2=1 - changed=[val1,val2]',
        'comp=parent val1=2 val2=2 - changed=[val1,val2]',
        'comp=comp val1=1 val2=1 - changed=[val1,val2]',
        'comp=comp val1=2 val2=2 - changed=[val1,val2]'
      ]);
    });


    it('should call onChanges every time a new view is created (if block)', () => {
      /**
       * % if (condition) {
       *   <comp></comp>
       * % }
       */

      function Template(ctx: any, cm: boolean) {
        if (cm) {
          container(0);
        }
        containerRefreshStart(0);
        {
          if (ctx.condition) {
            if (embeddedViewStart(0)) {
              elementStart(0, Comp);
              elementEnd();
            }
            elementProperty(0, 'val1', bind(1));
            elementProperty(0, 'publicName', bind(1));
            Comp.ngComponentDef.h(1, 0);
            directiveRefresh(1, 0);
            embeddedViewEnd();
          }
        }
        containerRefreshEnd();
      }

      renderToHtml(Template, {condition: true});
      expect(events).toEqual(['comp=comp val1=1 val2=1 - changed=[val1,val2]']);

      renderToHtml(Template, {condition: false});
      expect(events).toEqual(['comp=comp val1=1 val2=1 - changed=[val1,val2]']);

      renderToHtml(Template, {condition: true});
      expect(events).toEqual([
        'comp=comp val1=1 val2=1 - changed=[val1,val2]',
        'comp=comp val1=1 val2=1 - changed=[val1,val2]'
      ]);
    });

    it('should call onChanges in hosts before their content children', () => {
      /**
       * <comp>
       *   <projected-comp></projected-comp>
       * </comp>
       */
      function Template(ctx: any, cm: boolean) {
        if (cm) {
          elementStart(0, Comp);
          { elementStart(2, ProjectedComp); }
          elementEnd();
        }
        elementProperty(0, 'val1', bind(1));
        elementProperty(0, 'publicName', bind(1));
        elementProperty(2, 'val1', bind(2));
        elementProperty(2, 'publicName', bind(2));
        Comp.ngComponentDef.h(1, 0);
        ProjectedComp.ngComponentDef.h(3, 2);
        directiveRefresh(1, 0);
        directiveRefresh(3, 2);
      }

      renderToHtml(Template, {});
      expect(events).toEqual([
        'comp=comp val1=1 val2=1 - changed=[val1,val2]',
        'comp=projected val1=2 val2=2 - changed=[val1,val2]'
      ]);
    });

    it('should call onChanges in host and its content children before next host', () => {
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
          elementStart(0, Comp);
          { elementStart(2, ProjectedComp); }
          elementEnd();
          elementStart(4, Comp);
          { elementStart(6, ProjectedComp); }
          elementEnd();
        }
        elementProperty(0, 'val1', bind(1));
        elementProperty(0, 'publicName', bind(1));
        elementProperty(2, 'val1', bind(2));
        elementProperty(2, 'publicName', bind(2));
        elementProperty(4, 'val1', bind(3));
        elementProperty(4, 'publicName', bind(3));
        elementProperty(6, 'val1', bind(4));
        elementProperty(6, 'publicName', bind(4));
        Comp.ngComponentDef.h(1, 0);
        ProjectedComp.ngComponentDef.h(3, 2);
        Comp.ngComponentDef.h(5, 4);
        ProjectedComp.ngComponentDef.h(7, 6);
        directiveRefresh(1, 0);
        directiveRefresh(3, 2);
        directiveRefresh(5, 4);
        directiveRefresh(7, 6);
      }

      renderToHtml(Template, {});
      expect(events).toEqual([
        'comp=comp val1=1 val2=1 - changed=[val1,val2]',
        'comp=projected val1=2 val2=2 - changed=[val1,val2]',
        'comp=comp val1=3 val2=3 - changed=[val1,val2]',
        'comp=projected val1=4 val2=4 - changed=[val1,val2]'
      ]);
    });

    it('should be called on directives after component', () => {
      /** <comp directive></comp> */
      function Template(ctx: any, cm: boolean) {
        if (cm) {
          elementStart(0, Comp, null, [Directive]);
          elementEnd();
        }
        elementProperty(0, 'val1', bind(1));
        elementProperty(0, 'publicName', bind(1));
        Comp.ngComponentDef.h(1, 0);
        directiveRefresh(1, 0);
      }

      renderToHtml(Template, {});
      expect(events).toEqual([
        'comp=comp val1=1 val2=1 - changed=[val1,val2]', 'dir - val1=1 val2=1 - changed=[val1,val2]'
      ]);

      renderToHtml(Template, {});
      expect(events).toEqual([
        'comp=comp val1=1 val2=1 - changed=[val1,val2]', 'dir - val1=1 val2=1 - changed=[val1,val2]'
      ]);

    });

    it('should be called on directives on an element', () => {
      /** <div directive></div> */
      function Template(ctx: any, cm: boolean) {
        if (cm) {
          elementStart(0, 'div', null, [Directive]);
          elementEnd();
        }
        elementProperty(0, 'val1', bind(1));
        elementProperty(0, 'publicName', bind(1));
        Directive.ngDirectiveDef.h(1, 0);
        directiveRefresh(1, 0);
      }

      renderToHtml(Template, {});
      expect(events).toEqual(['dir - val1=1 val2=1 - changed=[val1,val2]']);

      renderToHtml(Template, {});
      expect(events).toEqual(['dir - val1=1 val2=1 - changed=[val1,val2]']);
    });

    it('should call onChanges properly in for loop', () => {
      /**
       *  <comp [val]="1"></comp>
       * % for (let j = 2; j < 5; j++) {
       *   <comp [val]="j"></comp>
       * % }
       *  <comp [val]="5"></comp>
       */

      function Template(ctx: any, cm: boolean) {
        if (cm) {
          elementStart(0, Comp);
          elementEnd();
          container(2);
          elementStart(3, Comp);
          elementEnd();
        }
        elementProperty(0, 'val1', bind(1));
        elementProperty(0, 'publicName', bind(1));
        elementProperty(3, 'val1', bind(5));
        elementProperty(3, 'publicName', bind(5));
        Comp.ngComponentDef.h(1, 0);
        Comp.ngComponentDef.h(4, 3);
        containerRefreshStart(2);
        {
          for (let j = 2; j < 5; j++) {
            if (embeddedViewStart(0)) {
              elementStart(0, Comp);
              elementEnd();
            }
            elementProperty(0, 'val1', bind(j));
            elementProperty(0, 'publicName', bind(j));
            Comp.ngComponentDef.h(1, 0);
            directiveRefresh(1, 0);
            embeddedViewEnd();
          }
        }
        containerRefreshEnd();
        directiveRefresh(1, 0);
        directiveRefresh(4, 3);
      }

      renderToHtml(Template, {});

      // onChanges is called top to bottom, so top level comps (1 and 5) are called
      // before the comps inside the for loop's embedded view (2, 3, and 4)
      expect(events).toEqual([
        'comp=comp val1=1 val2=1 - changed=[val1,val2]',
        'comp=comp val1=5 val2=5 - changed=[val1,val2]',
        'comp=comp val1=2 val2=2 - changed=[val1,val2]',
        'comp=comp val1=3 val2=3 - changed=[val1,val2]',
        'comp=comp val1=4 val2=4 - changed=[val1,val2]'
      ]);
    });

    it('should call onChanges properly in for loop with children', () => {
      /**
       *  <parent [val]="1"></parent>
       * % for (let j = 2; j < 5; j++) {
       *   <parent [val]="j"></parent>
       * % }
       *  <parent [val]="5"></parent>
       */

      function Template(ctx: any, cm: boolean) {
        if (cm) {
          elementStart(0, Parent);
          elementEnd();
          container(2);
          elementStart(3, Parent);
          elementEnd();
        }
        elementProperty(0, 'val1', bind(1));
        elementProperty(0, 'publicName', bind(1));
        elementProperty(3, 'val1', bind(5));
        elementProperty(3, 'publicName', bind(5));
        Parent.ngComponentDef.h(1, 0);
        Parent.ngComponentDef.h(4, 3);
        containerRefreshStart(2);
        {
          for (let j = 2; j < 5; j++) {
            if (embeddedViewStart(0)) {
              elementStart(0, Parent);
              elementEnd();
            }
            elementProperty(0, 'val1', bind(j));
            elementProperty(0, 'publicName', bind(j));
            Parent.ngComponentDef.h(1, 0);
            directiveRefresh(1, 0);
            embeddedViewEnd();
          }
        }
        containerRefreshEnd();
        directiveRefresh(1, 0);
        directiveRefresh(4, 3);
      }

      renderToHtml(Template, {});

      // onChanges is called top to bottom, so top level comps (1 and 5) are called
      // before the comps inside the for loop's embedded view (2, 3, and 4)
      expect(events).toEqual([
        'comp=parent val1=1 val2=1 - changed=[val1,val2]',
        'comp=parent val1=5 val2=5 - changed=[val1,val2]',
        'comp=parent val1=2 val2=2 - changed=[val1,val2]',
        'comp=comp val1=2 val2=2 - changed=[val1,val2]',
        'comp=parent val1=3 val2=3 - changed=[val1,val2]',
        'comp=comp val1=3 val2=3 - changed=[val1,val2]',
        'comp=parent val1=4 val2=4 - changed=[val1,val2]',
        'comp=comp val1=4 val2=4 - changed=[val1,val2]',
        'comp=comp val1=1 val2=1 - changed=[val1,val2]',
        'comp=comp val1=5 val2=5 - changed=[val1,val2]'
      ]);
    });

  });

  describe('hook order', () => {
    let events: string[];

    beforeEach(() => { events = []; });

    function createAllHooksComponent(name: string, template: ComponentTemplate<any>) {
      return class Component {
        val: string = '';

        ngOnChanges() { events.push(`changes ${name}${this.val}`); }

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
          inputs: {val: 'val'}, template,
          features: [NgOnChangesFeature]
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
          elementStart(0, Comp);
          elementEnd();
          elementStart(2, Comp);
          elementEnd();
        }
        elementProperty(0, 'val', 1);
        elementProperty(2, 'val', 2);
        Comp.ngComponentDef.h(1, 0);
        Comp.ngComponentDef.h(3, 2);
        directiveRefresh(1, 0);
        directiveRefresh(3, 2);
      }

      renderToHtml(Template, {});
      expect(events).toEqual([
        'changes comp1', 'init comp1', 'check comp1', 'changes comp2', 'init comp2', 'check comp2',
        'contentInit comp1', 'contentCheck comp1', 'contentInit comp2', 'contentCheck comp2',
        'viewInit comp1', 'viewCheck comp1', 'viewInit comp2', 'viewCheck comp2'
      ]);

      events = [];
      renderToHtml(Template, {});
      expect(events).toEqual([
        'changes comp1', 'check comp1', 'changes comp2', 'check comp2', 'contentCheck comp1',
        'contentCheck comp2', 'viewCheck comp1', 'viewCheck comp2'
      ]);
    });

    it('should call all hooks in correct order with children', () => {
      const Comp = createAllHooksComponent('comp', (ctx: any, cm: boolean) => {});

      /** <comp [val]="val"></comp> */
      const Parent = createAllHooksComponent('parent', (ctx: any, cm: boolean) => {
        if (cm) {
          elementStart(0, Comp);
          elementEnd();
        }
        elementProperty(0, 'val', bind(ctx.val));
        Comp.ngComponentDef.h(1, 0);
        directiveRefresh(1, 0);
      });

      /**
       * <parent [val]="1"></parent>
       * <parent [val]="2"></parent>
       */
      function Template(ctx: any, cm: boolean) {
        if (cm) {
          elementStart(0, Parent);
          elementEnd();
          elementStart(2, Parent);
          elementEnd();
        }
        elementProperty(0, 'val', 1);
        elementProperty(2, 'val', 2);
        Parent.ngComponentDef.h(1, 0);
        Parent.ngComponentDef.h(3, 2);
        directiveRefresh(1, 0);
        directiveRefresh(3, 2);
      }

      renderToHtml(Template, {});
      expect(events).toEqual([
        'changes parent1',      'init parent1',         'check parent1',
        'changes parent2',      'init parent2',         'check parent2',
        'contentInit parent1',  'contentCheck parent1', 'contentInit parent2',
        'contentCheck parent2', 'changes comp1',        'init comp1',
        'check comp1',          'contentInit comp1',    'contentCheck comp1',
        'viewInit comp1',       'viewCheck comp1',      'changes comp2',
        'init comp2',           'check comp2',          'contentInit comp2',
        'contentCheck comp2',   'viewInit comp2',       'viewCheck comp2',
        'viewInit parent1',     'viewCheck parent1',    'viewInit parent2',
        'viewCheck parent2'
      ]);

      events = [];
      renderToHtml(Template, {});
      expect(events).toEqual([
        'changes parent1', 'check parent1', 'changes parent2', 'check parent2',
        'contentCheck parent1', 'contentCheck parent2', 'check comp1', 'contentCheck comp1',
        'viewCheck comp1', 'check comp2', 'contentCheck comp2', 'viewCheck comp2',
        'viewCheck parent1', 'viewCheck parent2'
      ]);

    });

  });

});
