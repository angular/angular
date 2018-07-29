/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {OnDestroy, SimpleChanges} from '../../src/core';
import {AttributeMarker, ComponentTemplate, LifecycleHooksFeature, NgOnChangesFeature, defineComponent, defineDirective} from '../../src/render3/index';
import {bind, container, containerRefreshEnd, containerRefreshStart, element, elementEnd, elementProperty, elementStart, embeddedViewEnd, embeddedViewStart, listener, markDirty, projection, projectionDef, store, text} from '../../src/render3/instructions';
import {RenderFlags} from '../../src/render3/interfaces/definition';

import {NgIf} from './common_with_def';
import {ComponentFixture, containerEl, createComponent, renderComponent, renderToHtml, requestAnimationFrame} from './render_util';

describe('lifecycles', () => {

  function getParentTemplate(name: string) {
    return (rf: RenderFlags, ctx: any) => {
      if (rf & RenderFlags.Create) {
        element(0, name);
      }
      if (rf & RenderFlags.Update) {
        elementProperty(0, 'val', bind(ctx.val));
      }
    };
  }

  describe('onInit', () => {
    let events: string[];

    beforeEach(() => { events = []; });

    let Comp = createOnInitComponent('comp', (rf: RenderFlags, ctx: any) => {
      if (rf & RenderFlags.Create) {
        projectionDef();
        elementStart(0, 'div');
        { projection(1); }
        elementEnd();
      }
    });
    let Parent = createOnInitComponent('parent', getParentTemplate('comp'), [Comp]);
    let ProjectedComp = createOnInitComponent('projected', (rf: RenderFlags, ctx: any) => {
      if (rf & RenderFlags.Create) {
        text(0, 'content');
      }
    });

    function createOnInitComponent(
        name: string, template: ComponentTemplate<any>, directives: any[] = []) {
      return class Component {
        val: string = '';
        ngOnInit() { events.push(`${name}${this.val}`); }

        static ngComponentDef = defineComponent({
          type: Component,
          selectors: [[name]],
          factory: () => new Component(),
          inputs: {val: 'val'}, template,
          directives: directives
        });
      };
    }

    class Directive {
      ngOnInit() { events.push('dir'); }

      static ngDirectiveDef = defineDirective(
          {type: Directive, selectors: [['', 'dir', '']], factory: () => new Directive()});
    }

    const directives = [Comp, Parent, ProjectedComp, Directive];

    it('should call onInit method after inputs are set in creation mode (and not in update mode)',
       () => {
         /** <comp [val]="val"></comp> */
         function Template(rf: RenderFlags, ctx: any) {
           if (rf & RenderFlags.Create) {
             element(0, 'comp');
           }
           if (rf & RenderFlags.Update) {
             elementProperty(0, 'val', bind(ctx.val));
           }
         }

         renderToHtml(Template, {val: '1'}, directives);
         expect(events).toEqual(['comp1']);

         renderToHtml(Template, {val: '2'}, directives);
         expect(events).toEqual(['comp1']);
       });

    it('should be called on root component in creation mode', () => {
      const comp = renderComponent(Comp, {hostFeatures: [LifecycleHooksFeature]});
      expect(events).toEqual(['comp']);

      markDirty(comp);
      requestAnimationFrame.flush();
      expect(events).toEqual(['comp']);
    });

    it('should call parent onInit before child onInit', () => {
      /**
       * <parent></parent>
       * parent temp: <comp></comp>
       */

      function Template(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          element(0, 'parent');
        }
      }

      renderToHtml(Template, {}, directives);
      expect(events).toEqual(['parent', 'comp']);
    });

    it('should call all parent onInits across view before calling children onInits', () => {
      /**
       * <parent [val]="1"></parent>
       * <parent [val]="2"></parent>
       *
       * parent temp: <comp [val]="val"></comp>
       */

      function Template(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          element(0, 'parent');
          element(1, 'parent');
        }
        if (rf & RenderFlags.Update) {
          elementProperty(0, 'val', 1);
          elementProperty(1, 'val', 2);
        }
      }

      renderToHtml(Template, {}, directives);
      expect(events).toEqual(['parent1', 'parent2', 'comp1', 'comp2']);
    });


    it('should call onInit every time a new view is created (if block)', () => {
      /**
       * % if (condition) {
       *   <comp></comp>
       * % }
       */

      function Template(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          container(0);
        }
        if (rf & RenderFlags.Update) {
          containerRefreshStart(0);
          {
            if (ctx.condition) {
              let rf1 = embeddedViewStart(0);
              if (rf1 & RenderFlags.Create) {
                element(0, 'comp');
              }
              embeddedViewEnd();
            }
          }
          containerRefreshEnd();
        }
      }

      renderToHtml(Template, {condition: true}, directives);
      expect(events).toEqual(['comp']);

      renderToHtml(Template, {condition: false}, directives);
      expect(events).toEqual(['comp']);

      renderToHtml(Template, {condition: true}, directives);
      expect(events).toEqual(['comp', 'comp']);
    });

    it('should call onInit in hosts before their content children', () => {
      /**
       * <comp>
       *   <projected></projected>
       * </comp>
       */
      function Template(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          elementStart(0, 'comp');
          { elementStart(1, 'projected'); }
          elementEnd();
        }
      }

      renderToHtml(Template, {}, directives);
      expect(events).toEqual(['comp', 'projected']);
    });

    it('should call onInit in host and its content children before next host', () => {
      /**
       * <comp [val]="1">
       *   <projected [val]="1"></projected>
       * </comp>
       * <comp [val]="2">
       *   <projected [val]="1"></projected>
       * </comp>
       */
      function Template(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          elementStart(0, 'comp');
          { elementStart(1, 'projected'); }
          elementEnd();
          elementStart(2, 'comp');
          { elementStart(3, 'projected'); }
          elementEnd();
        }
        if (rf & RenderFlags.Update) {
          elementProperty(0, 'val', 1);
          elementProperty(1, 'val', 1);
          elementProperty(2, 'val', 2);
          elementProperty(3, 'val', 2);
        }
      }

      renderToHtml(Template, {}, directives);
      expect(events).toEqual(['comp1', 'projected1', 'comp2', 'projected2']);
    });

    it('should be called on directives after component', () => {
      /** <comp directive></comp> */
      function Template(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          element(0, 'comp', ['dir', '']);
        }
      }

      renderToHtml(Template, {}, directives);
      expect(events).toEqual(['comp', 'dir']);

      renderToHtml(Template, {}, directives);
      expect(events).toEqual(['comp', 'dir']);

    });

    it('should be called on directives on an element', () => {
      /** <div directive></div> */
      function Template(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          element(0, 'div', ['dir', '']);
        }
      }

      renderToHtml(Template, {}, directives);
      expect(events).toEqual(['dir']);

      renderToHtml(Template, {}, directives);
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

      function Template(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          element(0, 'comp');
          container(1);
          element(2, 'comp');
        }
        if (rf & RenderFlags.Update) {
          elementProperty(0, 'val', 1);
          elementProperty(2, 'val', 5);
          containerRefreshStart(1);
          {
            for (let j = 2; j < 5; j++) {
              let rf1 = embeddedViewStart(0);
              if (rf1 & RenderFlags.Create) {
                element(0, 'comp');
              }
              if (rf1 & RenderFlags.Update) {
                elementProperty(0, 'val', j);
              }
              embeddedViewEnd();
            }
          }
          containerRefreshEnd();
        }
      }

      renderToHtml(Template, {}, directives);

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

      function Template(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          element(0, 'parent');
          container(1);
          element(2, 'parent');
        }
        if (rf & RenderFlags.Update) {
          elementProperty(0, 'val', 1);
          elementProperty(2, 'val', 5);
          containerRefreshStart(1);
          {
            for (let j = 2; j < 5; j++) {
              let rf1 = embeddedViewStart(0);
              if (rf1 & RenderFlags.Create) {
                element(0, 'parent');
              }
              if (rf1 & RenderFlags.Update) {
                elementProperty(0, 'val', j);
              }
              embeddedViewEnd();
            }
          }
          containerRefreshEnd();
        }
      }

      renderToHtml(Template, {}, directives);

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

    let Comp = createDoCheckComponent('comp', (rf: RenderFlags, ctx: any) => {});
    let Parent = createDoCheckComponent('parent', getParentTemplate('comp'), [Comp]);

    function createDoCheckComponent(
        name: string, template: ComponentTemplate<any>, directives: any[] = []) {
      return class Component {
        ngDoCheck() {
          events.push(name);
          allEvents.push('check ' + name);
        }

        ngOnInit() { allEvents.push('init ' + name); }

        static ngComponentDef = defineComponent({
          type: Component,
          selectors: [[name]],
          factory: () => new Component(), template,
          directives: directives
        });
      };
    }

    class Directive {
      ngDoCheck() { events.push('dir'); }

      static ngDirectiveDef = defineDirective(
          {type: Directive, selectors: [['', 'dir', '']], factory: () => new Directive()});
    }

    const directives = [Comp, Parent, Directive];

    it('should call doCheck on every refresh', () => {
      /** <comp></comp> */
      function Template(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          element(0, 'comp');
        }
      }

      renderToHtml(Template, {}, directives);
      expect(events).toEqual(['comp']);

      renderToHtml(Template, {}, directives);
      expect(events).toEqual(['comp', 'comp']);
    });

    it('should be called on root component', () => {
      const comp = renderComponent(Comp, {hostFeatures: [LifecycleHooksFeature]});
      expect(events).toEqual(['comp']);

      markDirty(comp);
      requestAnimationFrame.flush();
      expect(events).toEqual(['comp', 'comp']);
    });

    it('should call parent doCheck before child doCheck', () => {
      /**
       * <parent></parent>
       * parent temp: <comp></comp>
       */

      function Template(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          element(0, 'parent');
        }
      }

      renderToHtml(Template, {}, directives);
      expect(events).toEqual(['parent', 'comp']);
    });

    it('should call ngOnInit before ngDoCheck if creation mode', () => {
      /** <comp></comp> */
      function Template(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          element(0, 'comp');
        }
      }

      renderToHtml(Template, {}, directives);
      expect(allEvents).toEqual(['init comp', 'check comp']);

      renderToHtml(Template, {}, directives);
      expect(allEvents).toEqual(['init comp', 'check comp', 'check comp']);
    });

    it('should be called on directives after component', () => {
      /** <comp directive></comp> */
      function Template(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          element(0, 'comp', ['dir', '']);
        }
      }

      renderToHtml(Template, {}, directives);
      expect(events).toEqual(['comp', 'dir']);

      renderToHtml(Template, {}, directives);
      expect(events).toEqual(['comp', 'dir', 'comp', 'dir']);

    });

    it('should be called on directives on an element', () => {
      /** <div directive></div> */
      function Template(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          element(0, 'div', ['dir', '']);
        }
      }

      renderToHtml(Template, {}, directives);
      expect(events).toEqual(['dir']);

      renderToHtml(Template, {}, directives);
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

    let Comp = createAfterContentInitComp('comp', function(rf: RenderFlags, ctx: any) {
      if (rf & RenderFlags.Create) {
        projectionDef();
        projection(0);
      }
    });

    let Parent = createAfterContentInitComp('parent', function(rf: RenderFlags, ctx: any) {
      if (rf & RenderFlags.Create) {
        projectionDef();
        elementStart(0, 'comp');
        { projection(1); }
        elementEnd();
      }
      if (rf & RenderFlags.Update) {
        elementProperty(0, 'val', bind(ctx.val));
      }
    }, [Comp]);

    let ProjectedComp = createAfterContentInitComp('projected', (rf: RenderFlags, ctx: any) => {
      if (rf & RenderFlags.Create) {
        projectionDef();
        projection(0);
      }
    });

    function createAfterContentInitComp(
        name: string, template: ComponentTemplate<any>, directives: any[] = []) {
      return class Component {
        val: string = '';
        ngAfterContentInit() {
          events.push(`${name}${this.val}`);
          allEvents.push(`${name}${this.val} init`);
        }
        ngAfterContentChecked() { allEvents.push(`${name}${this.val} check`); }

        static ngComponentDef = defineComponent({
          type: Component,
          selectors: [[name]],
          factory: () => new Component(),
          inputs: {val: 'val'},
          template: template,
          directives: directives
        });
      };
    }

    class Directive {
      ngAfterContentInit() { events.push('init'); }
      ngAfterContentChecked() { events.push('check'); }

      static ngDirectiveDef = defineDirective(
          {type: Directive, selectors: [['', 'dir', '']], factory: () => new Directive()});
    }

    function ForLoopWithChildrenTemplate(rf: RenderFlags, ctx: any) {
      if (rf & RenderFlags.Create) {
        elementStart(0, 'parent');
        { text(1, 'content'); }
        elementEnd();
        container(2);
        elementStart(3, 'parent');
        { text(4, 'content'); }
        elementEnd();
      }
      if (rf & RenderFlags.Update) {
        elementProperty(0, 'val', 1);
        elementProperty(3, 'val', 4);
        containerRefreshStart(2);
        {
          for (let i = 2; i < 4; i++) {
            let rf1 = embeddedViewStart(0);
            if (rf1 & RenderFlags.Create) {
              elementStart(0, 'parent');
              { text(1, 'content'); }
              elementEnd();
            }
            if (rf1 & RenderFlags.Update) {
              elementProperty(0, 'val', i);
            }
            embeddedViewEnd();
          }
        }
        containerRefreshEnd();
      }
    }

    const directives = [Comp, Parent, ProjectedComp, Directive];

    it('should be called only in creation mode', () => {
      /** <comp>content</comp> */
      function Template(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          elementStart(0, 'comp');
          { text(1, 'content'); }
          elementEnd();
        }
      }

      renderToHtml(Template, {}, directives);
      expect(events).toEqual(['comp']);

      renderToHtml(Template, {}, directives);
      expect(events).toEqual(['comp']);
    });

    it('should be called on root component in creation mode', () => {
      const comp = renderComponent(Comp, {hostFeatures: [LifecycleHooksFeature]});
      expect(events).toEqual(['comp']);

      markDirty(comp);
      requestAnimationFrame.flush();
      expect(events).toEqual(['comp']);
    });

    it('should be called on every init (if blocks)', () => {
      /**
       * % if (condition) {
       *   <comp>content</comp>
       * % }
       */
      function Template(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          container(0);
        }
        if (rf & RenderFlags.Update) {
          containerRefreshStart(0);
          {
            if (ctx.condition) {
              let rf1 = embeddedViewStart(0);
              if (rf1 & RenderFlags.Create) {
                elementStart(0, 'comp');
                { text(1, 'content'); }
                elementEnd();
              }
              embeddedViewEnd();
            }
          }
          containerRefreshEnd();
        }
      }

      renderToHtml(Template, {condition: true}, directives);
      expect(events).toEqual(['comp']);

      renderToHtml(Template, {condition: false}, directives);
      expect(events).toEqual(['comp']);

      renderToHtml(Template, {condition: true}, directives);
      expect(events).toEqual(['comp', 'comp']);
    });

    it('should be called in parents before children', () => {
      /**
       * <parent>content</parent>
       *
       * parent template: <comp><ng-content></ng-content></comp>
       */
      function Template(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          elementStart(0, 'parent');
          { text(1, 'content'); }
          elementEnd();
        }
      }

      renderToHtml(Template, {}, directives);
      expect(events).toEqual(['parent', 'comp']);
    });

    it('should be called breadth-first in entire parent subtree before any children', () => {
      /**
       * <parent [val]="1">content</parent>
       * <parent [val]="2">content</parent>
       *
       * parent template: <comp [val]="val"><ng-content></ng-content></comp>
       */
      function Template(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          elementStart(0, 'parent');
          { text(1, 'content'); }
          elementEnd();
          elementStart(2, 'parent');
          { text(3, 'content'); }
          elementEnd();
        }
        if (rf & RenderFlags.Update) {
          elementProperty(0, 'val', 1);
          elementProperty(2, 'val', 2);
        }
      }

      renderToHtml(Template, {}, directives);
      expect(events).toEqual(['parent1', 'parent2', 'comp1', 'comp2']);
    });

    it('should be called in projected components before their hosts', () => {
      /**
       * <parent>
       *   <projected>content</projected>
       * </parent>
       *
       * parent template:
       * <comp><ng-content></ng-content></comp>
       *
       * projected comp: <ng-content></ng-content>
       */
      function Template(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          elementStart(0, 'parent');
          {
            elementStart(1, 'projected');
            { text(2, 'content'); }
            elementEnd();
          }
          elementEnd();
        }
      }

      renderToHtml(Template, {}, directives);
      expect(events).toEqual(['projected', 'parent', 'comp']);
    });

    it('should be called in projected components and hosts before children', () => {
      /**
       * <parent [val]="1">
       *   <projected [val]="1">content</projected>
       * </parent>
       * * <parent [val]="2">
       *   <projected [val]="2">content</projected>
       * </parent>
       *
       * parent template:
       * <comp [val]="val"><ng-content></ng-content></comp>
       *
       * projected comp: <ng-content></ng-content>
       */
      function Template(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          elementStart(0, 'parent');
          {
            elementStart(1, 'projected');
            { text(2, 'content'); }
            elementEnd();
          }
          elementEnd();
          elementStart(3, 'parent');
          {
            elementStart(4, 'projected');
            { text(5, 'content'); }
            elementEnd();
          }
          elementEnd();
        }
        if (rf & RenderFlags.Update) {
          elementProperty(0, 'val', 1);
          elementProperty(1, 'val', 1);
          elementProperty(3, 'val', 2);
          elementProperty(4, 'val', 2);
        }
      }

      renderToHtml(Template, {}, directives);
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
      function Template(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          elementStart(0, 'comp');
          { text(1, 'content'); }
          elementEnd();
          container(2);
          elementStart(3, 'comp');
          { text(4, 'content'); }
          elementEnd();
        }
        if (rf & RenderFlags.Update) {
          elementProperty(0, 'val', 1);
          elementProperty(3, 'val', 4);
          containerRefreshStart(2);
          {
            for (let i = 2; i < 4; i++) {
              let rf1 = embeddedViewStart(0);
              if (rf1 & RenderFlags.Create) {
                elementStart(0, 'comp');
                { text(1, 'content'); }
                elementEnd();
              }
              if (rf1 & RenderFlags.Update) {
                elementProperty(0, 'val', i);
              }
              embeddedViewEnd();
            }
          }
          containerRefreshEnd();
        }
      }

      renderToHtml(Template, {}, directives);
      expect(events).toEqual(['comp2', 'comp3', 'comp1', 'comp4']);
    });

    it('should be called in correct order in a for loop with children', () => {
      /**
       * <parent [val]="1">content</parent>
       * % for(let i = 2; i < 4; i++) {
       *   <parent [val]="i">content</parent>
       * % }
       * <parent [val]="4">content</parent>
       */

      renderToHtml(ForLoopWithChildrenTemplate, {}, directives);
      expect(events).toEqual(
          ['parent2', 'comp2', 'parent3', 'comp3', 'parent1', 'parent4', 'comp1', 'comp4']);
    });

    describe('ngAfterContentChecked', () => {

      it('should be called every change detection run after afterContentInit', () => {
        /** <comp>content</comp> */
        function Template(rf: RenderFlags, ctx: any) {
          if (rf & RenderFlags.Create) {
            elementStart(0, 'comp');
            { text(1, 'content'); }
            elementEnd();
          }
        }

        renderToHtml(Template, {}, directives);
        expect(allEvents).toEqual(['comp init', 'comp check']);

        renderToHtml(Template, {}, directives);
        expect(allEvents).toEqual(['comp init', 'comp check', 'comp check']);

      });

      it('should be called on root component', () => {
        const comp = renderComponent(Comp, {hostFeatures: [LifecycleHooksFeature]});
        expect(allEvents).toEqual(['comp init', 'comp check']);

        markDirty(comp);
        requestAnimationFrame.flush();
        expect(allEvents).toEqual(['comp init', 'comp check', 'comp check']);
      });

    });

    describe('directives', () => {
      it('should be called on directives after component', () => {
        /** <comp directive></comp> */
        function Template(rf: RenderFlags, ctx: any) {
          if (rf & RenderFlags.Create) {
            element(0, 'comp', ['dir', '']);
          }
        }

        renderToHtml(Template, {}, directives);
        expect(events).toEqual(['comp', 'init', 'check']);
      });

      it('should be called on directives on an element', () => {
        /** <div directive></div> */
        function Template(rf: RenderFlags, ctx: any) {
          if (rf & RenderFlags.Create) {
            element(0, 'div', ['dir', '']);
          }
        }

        renderToHtml(Template, {}, directives);
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

    let Comp = createAfterViewInitComponent('comp', (rf: RenderFlags, ctx: any) => {
      if (rf & RenderFlags.Create) {
        projectionDef();
        elementStart(0, 'div');
        { projection(1); }
        elementEnd();
      }
    });
    let Parent = createAfterViewInitComponent('parent', getParentTemplate('comp'), [Comp]);

    let ProjectedComp = createAfterViewInitComponent('projected', (rf: RenderFlags, ctx: any) => {
      if (rf & RenderFlags.Create) {
        text(0, 'content');
      }
    });

    function createAfterViewInitComponent(
        name: string, template: ComponentTemplate<any>, directives: any[] = []) {
      return class Component {
        val: string = '';
        ngAfterViewInit() {
          events.push(`${name}${this.val}`);
          allEvents.push(`${name}${this.val} init`);
        }
        ngAfterViewChecked() { allEvents.push(`${name}${this.val} check`); }

        static ngComponentDef = defineComponent({
          type: Component,
          selectors: [[name]],
          factory: () => new Component(),
          inputs: {val: 'val'},
          template: template,
          directives: directives
        });
      };
    }

    class Directive {
      ngAfterViewInit() { events.push('init'); }
      ngAfterViewChecked() { events.push('check'); }

      static ngDirectiveDef = defineDirective(
          {type: Directive, selectors: [['', 'dir', '']], factory: () => new Directive()});
    }

    const defs = [Comp, Parent, ProjectedComp, Directive];

    it('should be called on init and not in update mode', () => {
      /** <comp></comp> */
      function Template(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          element(0, 'comp');
        }
      }

      renderToHtml(Template, {}, defs);
      expect(events).toEqual(['comp']);

      renderToHtml(Template, {}, defs);
      expect(events).toEqual(['comp']);
    });

    it('should be called on root component in creation mode', () => {
      const comp = renderComponent(Comp, {hostFeatures: [LifecycleHooksFeature]});
      expect(events).toEqual(['comp']);

      markDirty(comp);
      requestAnimationFrame.flush();
      expect(events).toEqual(['comp']);
    });

    it('should be called every time a view is initialized (if block)', () => {
      /*
      * % if (condition) {
      *   <comp></comp>
      * % }
      */
      function Template(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          container(0);
        }
        if (rf & RenderFlags.Update) {
          containerRefreshStart(0);
          {
            if (ctx.condition) {
              let rf1 = embeddedViewStart(0);
              if (rf1 & RenderFlags.Create) {
                element(0, 'comp');
              }
              embeddedViewEnd();
            }
          }
          containerRefreshEnd();
        }
      }

      renderToHtml(Template, {condition: true}, defs);
      expect(events).toEqual(['comp']);

      renderToHtml(Template, {condition: false}, defs);
      expect(events).toEqual(['comp']);

      renderToHtml(Template, {condition: true}, defs);
      expect(events).toEqual(['comp', 'comp']);

    });

    it('should be called in children before parents', () => {
      /**
       * <parent></parent>
       *
       * parent temp: <comp></comp>
       */
      function Template(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          element(0, 'parent');
        }
      }

      renderToHtml(Template, {}, defs);
      expect(events).toEqual(['comp', 'parent']);

    });

    it('should be called for entire subtree before being called in any parent view comps', () => {
      /**
       * <parent [val]="1"></parent>
       * <parent [val]="2"></parent>
       *
       *  parent temp: <comp [val]="val"></comp>
       */
      function Template(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          element(0, 'parent');
          element(1, 'parent');
        }
        if (rf & RenderFlags.Update) {
          elementProperty(0, 'val', 1);
          elementProperty(1, 'val', 2);
        }
      }
      renderToHtml(Template, {}, defs);
      expect(events).toEqual(['comp1', 'comp2', 'parent1', 'parent2']);

    });

    it('should be called in projected components before their hosts', () => {
      /**
       * <comp>
       *   <projected></projected>
       * </comp>
       */
      function Template(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          elementStart(0, 'comp');
          { element(1, 'projected'); }
          elementEnd();
        }
      }

      renderToHtml(Template, {}, defs);
      expect(events).toEqual(['projected', 'comp']);
    });

    it('should call afterViewInit in content children and host before next host', () => {
      /**
       * <comp [val]="1">
       *   <projected [val]="1"></projected>
       * </comp>
       * <comp [val]="2">
       *   <projected [val]="2"></projected>
       * </comp>
       */
      function Template(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          elementStart(0, 'comp');
          { element(1, 'projected'); }
          elementEnd();
          elementStart(2, 'comp');
          { element(3, 'projected'); }
          elementEnd();
        }
        if (rf & RenderFlags.Update) {
          elementProperty(0, 'val', 1);
          elementProperty(1, 'val', 1);
          elementProperty(2, 'val', 2);
          elementProperty(3, 'val', 2);
        }
      }

      renderToHtml(Template, {}, defs);
      expect(events).toEqual(['projected1', 'comp1', 'projected2', 'comp2']);
    });

    it('should call afterViewInit in content children and hosts before parents', () => {
      /*
       * <comp [val]="val">
       *   <projected [val]="val"></projected>
       * </comp>
       */
      const ParentComp = createAfterViewInitComponent('parent', (rf: RenderFlags, ctx: any) => {
        if (rf & RenderFlags.Create) {
          elementStart(0, 'comp');
          { element(1, 'projected'); }
          elementEnd();
        }
        if (rf & RenderFlags.Update) {
          elementProperty(0, 'val', bind(ctx.val));
          elementProperty(1, 'val', bind(ctx.val));
        }
      }, [Comp, ProjectedComp]);

      /**
       * <parent [val]="1"></parent>
       * <parent [val]="2"></parent>
       */
      function Template(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          element(0, 'parent');
          element(1, 'parent');
        }
        if (rf & RenderFlags.Update) {
          elementProperty(0, 'val', 1);
          elementProperty(1, 'val', 2);
        }
      }

      renderToHtml(Template, {}, [ParentComp]);
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
      function Template(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          element(0, 'comp');
          container(1);
          element(2, 'comp');
        }
        if (rf & RenderFlags.Update) {
          elementProperty(0, 'val', 1);
          elementProperty(2, 'val', 4);
          containerRefreshStart(1);
          {
            for (let i = 2; i < 4; i++) {
              let rf1 = embeddedViewStart(0);
              if (rf1 & RenderFlags.Create) {
                element(0, 'comp');
              }
              if (rf1 & RenderFlags.Update) {
                elementProperty(0, 'val', i);
              }
              embeddedViewEnd();
            }
          }
          containerRefreshEnd();
        }
      }

      renderToHtml(Template, {}, defs);
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
      function Template(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          element(0, 'parent');
          container(1);
          element(2, 'parent');
        }
        if (rf & RenderFlags.Update) {
          elementProperty(0, 'val', 1);
          elementProperty(2, 'val', 4);
          containerRefreshStart(1);
          {
            for (let i = 2; i < 4; i++) {
              let rf1 = embeddedViewStart(0);
              if (rf1 & RenderFlags.Create) {
                element(0, 'parent');
              }
              if (rf1 & RenderFlags.Update) {
                elementProperty(0, 'val', i);
              }
              embeddedViewEnd();
            }
          }
          containerRefreshEnd();
        }
      }

      renderToHtml(Template, {}, defs);
      expect(events).toEqual(
          ['comp2', 'parent2', 'comp3', 'parent3', 'comp1', 'comp4', 'parent1', 'parent4']);

    });

    describe('ngAfterViewChecked', () => {

      it('should call ngAfterViewChecked every update', () => {
        /** <comp></comp> */
        function Template(rf: RenderFlags, ctx: any) {
          if (rf & RenderFlags.Create) {
            element(0, 'comp');
          }
        }

        renderToHtml(Template, {}, defs);
        expect(allEvents).toEqual(['comp init', 'comp check']);

        renderToHtml(Template, {}, defs);
        expect(allEvents).toEqual(['comp init', 'comp check', 'comp check']);
      });

      it('should be called on root component', () => {
        const comp = renderComponent(Comp, {hostFeatures: [LifecycleHooksFeature]});
        expect(allEvents).toEqual(['comp init', 'comp check']);

        markDirty(comp);
        requestAnimationFrame.flush();
        expect(allEvents).toEqual(['comp init', 'comp check', 'comp check']);
      });

      it('should call ngAfterViewChecked with bindings', () => {
        /** <comp [val]="myVal"></comp> */
        function Template(rf: RenderFlags, ctx: any) {
          if (rf & RenderFlags.Create) {
            element(0, 'comp');
          }
          if (rf & RenderFlags.Update) {
            elementProperty(0, 'val', bind(ctx.myVal));
          }
        }

        renderToHtml(Template, {myVal: 5}, defs);
        expect(allEvents).toEqual(['comp5 init', 'comp5 check']);

        renderToHtml(Template, {myVal: 6}, defs);
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
        function Template(rf: RenderFlags, ctx: any) {
          if (rf & RenderFlags.Create) {
            element(0, 'parent');
            container(1);
            element(2, 'parent');
          }
          if (rf & RenderFlags.Update) {
            elementProperty(0, 'val', 1);
            elementProperty(2, 'val', 4);
            containerRefreshStart(1);
            {
              for (let i = 2; i < 4; i++) {
                let rf1 = embeddedViewStart(0);
                if (rf1 & RenderFlags.Create) {
                  element(0, 'parent');
                }
                if (rf1 & RenderFlags.Update) {
                  elementProperty(0, 'val', i);
                }
                embeddedViewEnd();
              }
            }
            containerRefreshEnd();
          }
        }

        renderToHtml(Template, {}, defs);
        expect(allEvents).toEqual([
          'comp2 init', 'comp2 check', 'parent2 init', 'parent2 check', 'comp3 init', 'comp3 check',
          'parent3 init', 'parent3 check', 'comp1 init', 'comp1 check', 'comp4 init', 'comp4 check',
          'parent1 init', 'parent1 check', 'parent4 init', 'parent4 check'
        ]);

      });

    });

    describe('directives', () => {
      it('should be called on directives after component', () => {
        /** <comp directive></comp> */
        function Template(rf: RenderFlags, ctx: any) {
          if (rf & RenderFlags.Create) {
            element(0, 'comp', ['dir', '']);
          }
        }

        renderToHtml(Template, {}, defs);
        expect(events).toEqual(['comp', 'init', 'check']);
      });

      it('should be called on directives on an element', () => {
        /** <div directive></div> */
        function Template(rf: RenderFlags, ctx: any) {
          if (rf & RenderFlags.Create) {
            element(0, 'div', ['dir', '']);
          }
        }

        renderToHtml(Template, {}, defs);
        expect(events).toEqual(['init', 'check']);
      });
    });
  });

  describe('onDestroy', () => {
    let events: string[];

    beforeEach(() => { events = []; });

    let Comp = createOnDestroyComponent('comp', (rf: RenderFlags, ctx: any) => {
      if (rf & RenderFlags.Create) {
        projectionDef();
        projection(0);
      }
    });
    let Parent = createOnDestroyComponent('parent', getParentTemplate('comp'), [Comp]);

    function createOnDestroyComponent(
        name: string, template: ComponentTemplate<any>, directives: any[] = []) {
      return class Component {
        val: string = '';
        ngOnDestroy() { events.push(`${name}${this.val}`); }

        static ngComponentDef = defineComponent({
          type: Component,
          selectors: [[name]],
          factory: () => new Component(),
          inputs: {val: 'val'},
          template: template,
          directives: directives
        });
      };
    }

    let Grandparent = createOnDestroyComponent('grandparent', function(rf: RenderFlags, ctx: any) {
      if (rf & RenderFlags.Create) {
        element(0, 'parent');
      }
    }, [Parent]);

    const ProjectedComp = createOnDestroyComponent('projected', (rf: RenderFlags, ctx: any) => {});

    class Directive {
      ngOnDestroy() { events.push('dir'); }

      static ngDirectiveDef = defineDirective(
          {type: Directive, selectors: [['', 'dir', '']], factory: () => new Directive()});
    }

    const defs = [Comp, Parent, Grandparent, ProjectedComp, Directive];

    it('should call destroy when view is removed', () => {
      /**
       * % if (condition) {
       *   <comp></comp>
       * % }
       */

      function Template(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          container(0);
        }
        if (rf & RenderFlags.Update) {
          containerRefreshStart(0);
          {
            if (ctx.condition) {
              let rf1 = embeddedViewStart(0);
              if (rf1 & RenderFlags.Create) {
                element(0, 'comp');
              }
              embeddedViewEnd();
            }
          }
          containerRefreshEnd();
        }
      }

      renderToHtml(Template, {condition: true}, defs);
      renderToHtml(Template, {condition: false}, defs);
      expect(events).toEqual(['comp']);
    });

    it('should call destroy when multiple views are removed', () => {
      /**
       * % if (condition) {
       *   <comp [val]="1"></comp>
       *   <comp [val]="2"></comp>
       * % }
       */

      function Template(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          container(0);
        }
        if (rf & RenderFlags.Update) {
          containerRefreshStart(0);
          {
            if (ctx.condition) {
              let rf1 = embeddedViewStart(0);
              if (rf1 & RenderFlags.Create) {
                element(0, 'comp');
                element(1, 'comp');
              }
              if (rf1 & RenderFlags.Update) {
                elementProperty(0, 'val', bind('1'));
                elementProperty(1, 'val', bind('2'));
              }
              embeddedViewEnd();
            }
          }
          containerRefreshEnd();
        }
      }

      renderToHtml(Template, {condition: true}, defs);
      renderToHtml(Template, {condition: false}, defs);
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

      function Template(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          container(0);
        }
        if (rf & RenderFlags.Update) {
          containerRefreshStart(0);
          {
            if (ctx.condition) {
              let rf1 = embeddedViewStart(0);
              if (rf1 & RenderFlags.Create) {
                element(0, 'parent');
              }
              embeddedViewEnd();
            }
          }
          containerRefreshEnd();
        }
      }

      renderToHtml(Template, {condition: true}, defs);
      renderToHtml(Template, {condition: false}, defs);
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

      function Template(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          container(0);
        }
        if (rf & RenderFlags.Update) {
          containerRefreshStart(0);
          {
            if (ctx.condition) {
              let rf1 = embeddedViewStart(0);
              if (rf1 & RenderFlags.Create) {
                element(0, 'grandparent');
              }
              embeddedViewEnd();
            }
          }
          containerRefreshEnd();
        }
      }

      renderToHtml(Template, {condition: true}, defs);
      renderToHtml(Template, {condition: false}, defs);
      expect(events).toEqual(['comp', 'parent', 'grandparent']);
    });

    it('should be called in projected components before their hosts', () => {
      /**
       * % if (showing) {
       *   <comp [val]="1">
       *     <projected [val]="1"></projected>
       *   </comp>
       *   <comp [val]="2">
       *     <projected [val]="2"></projected>
       *   </comp>
       * }
       */
      function Template(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          container(0);
        }
        if (rf & RenderFlags.Update) {
          containerRefreshStart(0);
          {
            if (ctx.showing) {
              let rf1 = embeddedViewStart(0);
              if (rf1 & RenderFlags.Create) {
                elementStart(0, 'comp');
                { element(1, 'projected'); }
                elementEnd();
                elementStart(2, 'comp');
                { element(3, 'projected'); }
                elementEnd();
              }
              if (rf1 & RenderFlags.Update) {
                elementProperty(0, 'val', 1);
                elementProperty(1, 'val', 1);
                elementProperty(2, 'val', 2);
                elementProperty(3, 'val', 2);
              }
              embeddedViewEnd();
            }
          }
          containerRefreshEnd();
        }
      }

      renderToHtml(Template, {showing: true}, defs);
      renderToHtml(Template, {showing: false}, defs);

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

      function Template(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          container(0);
        }
        if (rf & RenderFlags.Update) {
          containerRefreshStart(0);
          {
            if (ctx.condition) {
              let rf1 = embeddedViewStart(0);
              if (rf1 & RenderFlags.Create) {
                element(0, 'comp');
                container(1);
                element(2, 'comp');
              }
              if (rf1 & RenderFlags.Update) {
                elementProperty(0, 'val', bind('1'));
                elementProperty(2, 'val', bind('3'));
                containerRefreshStart(1);
                {
                  if (ctx.condition2) {
                    let rf2 = embeddedViewStart(0);
                    if (rf2 & RenderFlags.Create) {
                      element(0, 'comp');
                    }
                    if (rf2 & RenderFlags.Update) {
                      elementProperty(0, 'val', bind('2'));
                    }
                    embeddedViewEnd();
                  }
                }
                containerRefreshEnd();
              }
              embeddedViewEnd();
            }
          }
          containerRefreshEnd();
        }
      }

      renderToHtml(Template, {condition: true, condition2: true}, defs);
      renderToHtml(Template, {condition: false}, defs);

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
      renderToHtml(Template, {condition: true, condition2: false}, defs);
      renderToHtml(Template, {condition: false}, defs);
      expect(events).toEqual(['comp1', 'comp3']);

      events = [];
      renderToHtml(Template, {condition: true, condition2: true}, defs);
      renderToHtml(Template, {condition: false}, defs);
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
      function Template(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          container(0);
        }
        if (rf & RenderFlags.Update) {
          containerRefreshStart(0);
          {
            if (ctx.condition) {
              let rf1 = embeddedViewStart(0);
              if (rf1 & RenderFlags.Create) {
                element(0, 'comp');
                container(1);
                element(2, 'comp');
              }
              if (rf1 & RenderFlags.Update) {
                elementProperty(0, 'val', bind('1'));
                elementProperty(2, 'val', bind('5'));
                containerRefreshStart(1);
                {
                  for (let j = 2; j < ctx.len; j++) {
                    let rf2 = embeddedViewStart(0);
                    if (rf2 & RenderFlags.Create) {
                      element(0, 'comp');
                    }
                    if (rf2 & RenderFlags.Update) {
                      elementProperty(0, 'val', bind(j));
                    }
                    embeddedViewEnd();
                  }
                }
                containerRefreshEnd();
              }
              embeddedViewEnd();
            }
          }
          containerRefreshEnd();
        }
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
      renderToHtml(Template, {condition: true, len: 5}, defs);
      renderToHtml(Template, {condition: false}, defs);
      expect(events).toEqual(['comp2', 'comp3', 'comp4', 'comp1', 'comp5']);

      events = [];
      renderToHtml(Template, {condition: true, len: 4}, defs);
      renderToHtml(Template, {condition: false}, defs);
      expect(events).toEqual(['comp2', 'comp3', 'comp1', 'comp5']);

      events = [];
      renderToHtml(Template, {condition: true, len: 5}, defs);
      renderToHtml(Template, {condition: false}, defs);
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

      function Template(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          container(0);
        }
        if (rf & RenderFlags.Update) {
          containerRefreshStart(0);
          {
            if (ctx.condition) {
              let rf1 = embeddedViewStart(0);
              if (rf1 & RenderFlags.Create) {
                elementStart(0, 'button');
                {
                  listener('click', ctx.onClick.bind(ctx));
                  text(1, 'Click me');
                }
                elementEnd();
                element(2, 'comp');
                elementStart(3, 'button');
                {
                  listener('click', ctx.onClick.bind(ctx));
                  text(4, 'Click me');
                }
                elementEnd();
              }
              embeddedViewEnd();
            }
          }
          containerRefreshEnd();
        }
      }

      class App {
        counter = 0;
        condition = true;
        onClick() { this.counter++; }
      }

      const ctx: {counter: number} = new App();
      renderToHtml(Template, ctx, defs);

      const buttons = containerEl.querySelectorAll('button') !;
      buttons[0].click();
      expect(ctx.counter).toEqual(1);
      buttons[1].click();
      expect(ctx.counter).toEqual(2);

      renderToHtml(Template, {condition: false}, defs);

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

      function Template(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          container(0);
        }
        if (rf & RenderFlags.Update) {
          containerRefreshStart(0);
          {
            if (ctx.condition) {
              let rf1 = embeddedViewStart(0);
              if (rf1 & RenderFlags.Create) {
                element(0, 'comp', ['dir', '']);
              }
              embeddedViewEnd();
            }
          }
          containerRefreshEnd();
        }
      }

      renderToHtml(Template, {condition: true}, defs);
      expect(events).toEqual([]);

      renderToHtml(Template, {condition: false}, defs);
      expect(events).toEqual(['comp', 'dir']);

    });

    it('should be called on directives on an element', () => {
      /**
       * % if (condition) {
       *   <div directive></div>
       * % }
       */

      function Template(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          container(0);
        }
        if (rf & RenderFlags.Update) {
          containerRefreshStart(0);
          {
            if (ctx.condition) {
              let rf1 = embeddedViewStart(0);
              if (rf1 & RenderFlags.Create) {
                element(0, 'div', ['dir', '']);
              }
              embeddedViewEnd();
            }
          }
          containerRefreshEnd();
        }
      }

      renderToHtml(Template, {condition: true}, defs);
      expect(events).toEqual([]);

      renderToHtml(Template, {condition: false}, defs);
      expect(events).toEqual(['dir']);
    });

  });

  describe('onChanges', () => {
    let events: string[];

    beforeEach(() => { events = []; });

    const Comp = createOnChangesComponent('comp', (rf: RenderFlags, ctx: any) => {
      if (rf & RenderFlags.Create) {
        projectionDef();
        elementStart(0, 'div');
        { projection(1); }
        elementEnd();
      }
    });
    const Parent = createOnChangesComponent('parent', (rf: RenderFlags, ctx: any) => {
      if (rf & RenderFlags.Create) {
        element(0, 'comp');
      }
      if (rf & RenderFlags.Update) {
        elementProperty(0, 'val1', bind(ctx.a));
        elementProperty(0, 'publicName', bind(ctx.b));
      }
    }, [Comp]);
    const ProjectedComp = createOnChangesComponent('projected', (rf: RenderFlags, ctx: any) => {
      if (rf & RenderFlags.Create) {
        text(0, 'content');
      }
    });


    function createOnChangesComponent(
        name: string, template: ComponentTemplate<any>, directives: any[] = []) {
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
          selectors: [[name]],
          factory: () => new Component(),
          features: [NgOnChangesFeature],
          inputs: {a: 'val1', b: ['publicName', 'val2']}, template,
          directives: directives
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
        selectors: [['', 'dir', '']],
        factory: () => new Directive(),
        features: [NgOnChangesFeature],
        inputs: {a: 'val1', b: ['publicName', 'val2']}
      });
    }

    const defs = [Comp, Parent, Directive, ProjectedComp];

    it('should call onChanges method after inputs are set in creation and update mode', () => {
      /** <comp [val1]="val1" [publicName]="val2"></comp> */
      function Template(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          element(0, 'comp');
        }
        if (rf & RenderFlags.Update) {
          elementProperty(0, 'val1', bind(ctx.val1));
          elementProperty(0, 'publicName', bind(ctx.val2));
        }
      }

      renderToHtml(Template, {val1: '1', val2: 'a'}, defs);
      expect(events).toEqual(['comp=comp val1=1 val2=a - changed=[val1,val2]']);

      events.length = 0;

      renderToHtml(Template, {val1: '2', val2: 'b'}, defs);
      expect(events).toEqual(['comp=comp val1=2 val2=b - changed=[val1,val2]']);
    });

    it('should call parent onChanges before child onChanges', () => {
      /**
       * <parent></parent>
       * parent temp: <comp></comp>
       */

      function Template(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          element(0, 'parent');
        }
        if (rf & RenderFlags.Update) {
          elementProperty(0, 'val1', bind(ctx.val1));
          elementProperty(0, 'publicName', bind(ctx.val2));
        }
      }

      renderToHtml(Template, {val1: '1', val2: 'a'}, defs);
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

      function Template(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          element(0, 'parent');
          element(1, 'parent');
        }
        if (rf & RenderFlags.Update) {
          elementProperty(0, 'val1', bind(1));
          elementProperty(0, 'publicName', bind(1));
          elementProperty(1, 'val1', bind(2));
          elementProperty(1, 'publicName', bind(2));
        }
      }

      renderToHtml(Template, {}, defs);
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

      function Template(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          container(0);
        }
        if (rf & RenderFlags.Update) {
          containerRefreshStart(0);
          {
            if (ctx.condition) {
              let rf1 = embeddedViewStart(0);
              if (rf1 & RenderFlags.Create) {
                element(0, 'comp');
              }
              if (rf1 & RenderFlags.Update) {
                elementProperty(0, 'val1', bind(1));
                elementProperty(0, 'publicName', bind(1));
              }
              embeddedViewEnd();
            }
          }
          containerRefreshEnd();
        }
      }

      renderToHtml(Template, {condition: true}, defs);
      expect(events).toEqual(['comp=comp val1=1 val2=1 - changed=[val1,val2]']);

      renderToHtml(Template, {condition: false}, defs);
      expect(events).toEqual(['comp=comp val1=1 val2=1 - changed=[val1,val2]']);

      renderToHtml(Template, {condition: true}, defs);
      expect(events).toEqual([
        'comp=comp val1=1 val2=1 - changed=[val1,val2]',
        'comp=comp val1=1 val2=1 - changed=[val1,val2]'
      ]);
    });

    it('should call onChanges in hosts before their content children', () => {
      /**
       * <comp>
       *   <projected></projected>
       * </comp>
       */
      function Template(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          elementStart(0, 'comp');
          { elementStart(1, 'projected'); }
          elementEnd();
        }
        if (rf & RenderFlags.Update) {
          elementProperty(0, 'val1', bind(1));
          elementProperty(0, 'publicName', bind(1));
          elementProperty(1, 'val1', bind(2));
          elementProperty(1, 'publicName', bind(2));
        }
      }

      renderToHtml(Template, {}, defs);
      expect(events).toEqual([
        'comp=comp val1=1 val2=1 - changed=[val1,val2]',
        'comp=projected val1=2 val2=2 - changed=[val1,val2]'
      ]);
    });

    it('should call onChanges in host and its content children before next host', () => {
      /**
       * <comp [val]="1">
       *   <projected [val]="1"></projected>
       * </comp>
       * <comp [val]="2">
       *   <projected [val]="1"></projected>
       * </comp>
       */
      function Template(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          elementStart(0, 'comp');
          { elementStart(1, 'projected'); }
          elementEnd();
          elementStart(2, 'comp');
          { elementStart(3, 'projected'); }
          elementEnd();
        }
        if (rf & RenderFlags.Update) {
          elementProperty(0, 'val1', bind(1));
          elementProperty(0, 'publicName', bind(1));
          elementProperty(1, 'val1', bind(2));
          elementProperty(1, 'publicName', bind(2));
          elementProperty(2, 'val1', bind(3));
          elementProperty(2, 'publicName', bind(3));
          elementProperty(3, 'val1', bind(4));
          elementProperty(3, 'publicName', bind(4));
        }
      }

      renderToHtml(Template, {}, defs);
      expect(events).toEqual([
        'comp=comp val1=1 val2=1 - changed=[val1,val2]',
        'comp=projected val1=2 val2=2 - changed=[val1,val2]',
        'comp=comp val1=3 val2=3 - changed=[val1,val2]',
        'comp=projected val1=4 val2=4 - changed=[val1,val2]'
      ]);
    });

    it('should be called on directives after component', () => {
      /** <comp directive></comp> */
      function Template(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          element(0, 'comp', ['dir', '']);
        }
        if (rf & RenderFlags.Update) {
          elementProperty(0, 'val1', bind(1));
          elementProperty(0, 'publicName', bind(1));
        }
      }

      renderToHtml(Template, {}, defs);
      expect(events).toEqual([
        'comp=comp val1=1 val2=1 - changed=[val1,val2]', 'dir - val1=1 val2=1 - changed=[val1,val2]'
      ]);

      renderToHtml(Template, {}, defs);
      expect(events).toEqual([
        'comp=comp val1=1 val2=1 - changed=[val1,val2]', 'dir - val1=1 val2=1 - changed=[val1,val2]'
      ]);

    });

    it('should be called on directives on an element', () => {
      /** <div directive></div> */
      function Template(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          element(0, 'div', ['dir', '']);
        }
        if (rf & RenderFlags.Update) {
          elementProperty(0, 'val1', bind(1));
          elementProperty(0, 'publicName', bind(1));
        }
      }

      renderToHtml(Template, {}, defs);
      expect(events).toEqual(['dir - val1=1 val2=1 - changed=[val1,val2]']);

      renderToHtml(Template, {}, defs);
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

      function Template(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          element(0, 'comp');
          container(1);
          element(2, 'comp');
        }
        if (rf & RenderFlags.Update) {
          elementProperty(0, 'val1', bind(1));
          elementProperty(0, 'publicName', bind(1));
          elementProperty(2, 'val1', bind(5));
          elementProperty(2, 'publicName', bind(5));
          containerRefreshStart(1);
          {
            for (let j = 2; j < 5; j++) {
              let rf1 = embeddedViewStart(0);
              if (rf1 & RenderFlags.Create) {
                element(0, 'comp');
              }
              if (rf1 & RenderFlags.Update) {
                elementProperty(0, 'val1', bind(j));
                elementProperty(0, 'publicName', bind(j));
              }
              embeddedViewEnd();
            }
          }
          containerRefreshEnd();
        }
      }

      renderToHtml(Template, {}, defs);

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

      function Template(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          element(0, 'parent');
          container(1);
          element(2, 'parent');
        }
        if (rf & RenderFlags.Update) {
          elementProperty(0, 'val1', bind(1));
          elementProperty(0, 'publicName', bind(1));
          elementProperty(2, 'val1', bind(5));
          elementProperty(2, 'publicName', bind(5));
          containerRefreshStart(1);
          {
            for (let j = 2; j < 5; j++) {
              let rf1 = embeddedViewStart(0);
              if (rf1 & RenderFlags.Create) {
                element(0, 'parent');
              }
              if (rf1 & RenderFlags.Update) {
                elementProperty(0, 'val1', bind(j));
                elementProperty(0, 'publicName', bind(j));
              }
              embeddedViewEnd();
            }
          }
          containerRefreshEnd();
        }
      }

      renderToHtml(Template, {}, defs);

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

    function createAllHooksComponent(
        name: string, template: ComponentTemplate<any>, directives: any[] = []) {
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
          selectors: [[name]],
          factory: () => new Component(),
          inputs: {val: 'val'}, template,
          features: [NgOnChangesFeature],
          directives: directives
        });
      };
    }

    it('should call all hooks in correct order', () => {
      const Comp = createAllHooksComponent('comp', (rf: RenderFlags, ctx: any) => {});


      /**
       * <comp [val]="1"></comp>
       * <comp [val]="2"></comp>
       */
      function Template(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          element(0, 'comp');
          element(1, 'comp');
        }
        if (rf & RenderFlags.Update) {
          elementProperty(0, 'val', 1);
          elementProperty(1, 'val', 2);
        }
      }

      const defs = [Comp];
      renderToHtml(Template, {}, defs);
      expect(events).toEqual([
        'changes comp1', 'init comp1', 'check comp1', 'changes comp2', 'init comp2', 'check comp2',
        'contentInit comp1', 'contentCheck comp1', 'contentInit comp2', 'contentCheck comp2',
        'viewInit comp1', 'viewCheck comp1', 'viewInit comp2', 'viewCheck comp2'
      ]);

      events = [];
      renderToHtml(Template, {}, defs);
      expect(events).toEqual([
        'changes comp1', 'check comp1', 'changes comp2', 'check comp2', 'contentCheck comp1',
        'contentCheck comp2', 'viewCheck comp1', 'viewCheck comp2'
      ]);
    });

    it('should call all hooks in correct order with children', () => {
      const Comp = createAllHooksComponent('comp', (rf: RenderFlags, ctx: any) => {});

      /** <comp [val]="val"></comp> */
      const Parent = createAllHooksComponent('parent', (rf: RenderFlags, ctx: any) => {
        if (rf & RenderFlags.Create) {
          element(0, 'comp');
        }
        if (rf & RenderFlags.Update) {
          elementProperty(0, 'val', bind(ctx.val));
        }
      }, [Comp]);

      /**
       * <parent [val]="1"></parent>
       * <parent [val]="2"></parent>
       */
      function Template(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          element(0, 'parent');
          element(1, 'parent');
        }
        if (rf & RenderFlags.Update) {
          elementProperty(0, 'val', 1);
          elementProperty(1, 'val', 2);
        }
      }

      const defs = [Parent];
      renderToHtml(Template, {}, defs);
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
      renderToHtml(Template, {}, defs);
      expect(events).toEqual([
        'changes parent1', 'check parent1', 'changes parent2', 'check parent2',
        'contentCheck parent1', 'contentCheck parent2', 'check comp1', 'contentCheck comp1',
        'viewCheck comp1', 'check comp2', 'contentCheck comp2', 'viewCheck comp2',
        'viewCheck parent1', 'viewCheck parent2'
      ]);

    });

    // Angular 5 reference: https://stackblitz.com/edit/lifecycle-hooks-ng
    it('should call all hooks in correct order with view and content', () => {
      const Content = createAllHooksComponent('content', (rf: RenderFlags, ctx: any) => {});

      const View = createAllHooksComponent('view', (rf: RenderFlags, ctx: any) => {});

      /** <ng-content></ng-content><view [val]="val"></view> */
      const Parent = createAllHooksComponent('parent', (rf: RenderFlags, ctx: any) => {
        if (rf & RenderFlags.Create) {
          projectionDef();
          projection(0);
          element(1, 'view');
        }
        if (rf & RenderFlags.Update) {
          elementProperty(1, 'val', bind(ctx.val));
        }
      }, [View]);

      /**
       * <parent [val]="1">
       *   <content [val]="1"></content>
       * </parent>
       * <parent [val]="2">
       *   <content [val]="2"></content>
       * </parent>
       */
      function Template(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          elementStart(0, 'parent');
          { element(1, 'content'); }
          elementEnd();
          elementStart(2, 'parent');
          { element(3, 'content'); }
          elementEnd();
        }
        if (rf & RenderFlags.Update) {
          elementProperty(0, 'val', bind(1));
          elementProperty(1, 'val', bind(1));
          elementProperty(2, 'val', bind(2));
          elementProperty(3, 'val', bind(2));
        }
      }

      const defs = [Parent, Content];
      renderToHtml(Template, {}, defs);
      expect(events).toEqual([
        'changes parent1',      'init parent1',
        'check parent1',        'changes content1',
        'init content1',        'check content1',
        'changes parent2',      'init parent2',
        'check parent2',        'changes content2',
        'init content2',        'check content2',
        'contentInit content1', 'contentCheck content1',
        'contentInit parent1',  'contentCheck parent1',
        'contentInit content2', 'contentCheck content2',
        'contentInit parent2',  'contentCheck parent2',
        'changes view1',        'init view1',
        'check view1',          'contentInit view1',
        'contentCheck view1',   'viewInit view1',
        'viewCheck view1',      'changes view2',
        'init view2',           'check view2',
        'contentInit view2',    'contentCheck view2',
        'viewInit view2',       'viewCheck view2',
        'viewInit content1',    'viewCheck content1',
        'viewInit parent1',     'viewCheck parent1',
        'viewInit content2',    'viewCheck content2',
        'viewInit parent2',     'viewCheck parent2'
      ]);

      events = [];
      renderToHtml(Template, {}, defs);
      expect(events).toEqual([
        'check parent1', 'check content1', 'check parent2', 'check content2',
        'contentCheck content1', 'contentCheck parent1', 'contentCheck content2',
        'contentCheck parent2', 'check view1', 'contentCheck view1', 'viewCheck view1',
        'check view2', 'contentCheck view2', 'viewCheck view2', 'viewCheck content1',
        'viewCheck parent1', 'viewCheck content2', 'viewCheck parent2'
      ]);

    });

  });

  describe('non-regression', () => {

    it('should call lifecycle hooks for directives active on <ng-template>', () => {
      let destroyed = false;

      class OnDestroyDirective implements OnDestroy {
        ngOnDestroy() { destroyed = true; }

        static ngDirectiveDef = defineDirective({
          type: OnDestroyDirective,
          selectors: [['', 'onDestroyDirective', '']],
          factory: () => new OnDestroyDirective()
        });
      }


      function conditionTpl(rf: RenderFlags, ctx: Cmpt) {
        if (rf & RenderFlags.Create) {
          container(0, cmptTpl, null, [AttributeMarker.SelectOnly, 'onDestroyDirective']);
        }
      }

      /**
       * <ng-template [ngIf]="condition">
       *  <ng-template onDestroyDirective></ng-template>
       * </ng-template>
       */
      function cmptTpl(rf: RenderFlags, cmpt: Cmpt) {
        if (rf & RenderFlags.Create) {
          container(0, conditionTpl, null, [AttributeMarker.SelectOnly, 'ngIf']);
        }
        if (rf & RenderFlags.Update) {
          elementProperty(0, 'ngIf', bind(cmpt.showing));
        }
      }

      class Cmpt {
        showing = true;
        static ngComponentDef = defineComponent({
          type: Cmpt,
          factory: () => new Cmpt(),
          selectors: [['cmpt']],
          template: cmptTpl,
          directives: [NgIf, OnDestroyDirective]
        });
      }

      const fixture = new ComponentFixture(Cmpt);
      expect(destroyed).toBeFalsy();

      fixture.component.showing = false;
      fixture.update();
      expect(destroyed).toBeTruthy();
    });
  });

});
