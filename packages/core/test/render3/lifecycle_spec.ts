/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ComponentFactoryResolver, OnDestroy, SimpleChange, SimpleChanges, ViewContainerRef} from '../../src/core';
import {AttributeMarker, ComponentTemplate, LifecycleHooksFeature, injectComponentFactoryResolver, ΔNgOnChangesFeature, ΔdefineComponent, ΔdefineDirective} from '../../src/render3/index';
import {markDirty, Δbind, Δcontainer, ΔcontainerRefreshEnd, ΔcontainerRefreshStart, ΔdirectiveInject, Δelement, ΔelementEnd, ΔelementProperty, ΔelementStart, ΔembeddedViewEnd, ΔembeddedViewStart, Δlistener, Δprojection, ΔprojectionDef, Δselect, Δtemplate, Δtext} from '../../src/render3/instructions/all';
import {RenderFlags} from '../../src/render3/interfaces/definition';

import {NgIf} from './common_with_def';
import {ComponentFixture, containerEl, createComponent, renderComponent, renderToHtml, requestAnimationFrame} from './render_util';

describe('lifecycles', () => {

  function getParentTemplate(name: string) {
    return (rf: RenderFlags, ctx: any) => {
      if (rf & RenderFlags.Create) {
        Δelement(0, name);
      }
      if (rf & RenderFlags.Update) {
        ΔelementProperty(0, 'val', Δbind(ctx.val));
      }
    };
  }

  describe('onInit', () => {
    let events: string[];

    beforeEach(() => { events = []; });

    let Comp = createOnInitComponent('comp', (rf: RenderFlags, ctx: any) => {
      if (rf & RenderFlags.Create) {
        ΔprojectionDef();
        ΔelementStart(0, 'div');
        { Δprojection(1); }
        ΔelementEnd();
      }
    }, 2);
    let Parent = createOnInitComponent('parent', getParentTemplate('comp'), 1, 1, [Comp]);
    let ProjectedComp = createOnInitComponent('projected', (rf: RenderFlags, ctx: any) => {
      if (rf & RenderFlags.Create) {
        Δtext(0, 'content');
      }
    }, 1);

    function createOnInitComponent(
        name: string, template: ComponentTemplate<any>, consts: number, vars: number = 0,
        directives: any[] = []) {
      return class Component {
        val: string = '';
        ngOnInit() {
          if (!this.val) this.val = '';
          events.push(`${name}${this.val}`);
        }

        static ngComponentDef = ΔdefineComponent({
          type: Component,
          selectors: [[name]],
          consts: consts,
          vars: vars,
          factory: () => new Component(),
          inputs: {val: 'val'}, template,
          directives: directives
        });
      };
    }

    class Directive {
      ngOnInit() { events.push('dir'); }

      static ngDirectiveDef = ΔdefineDirective(
          {type: Directive, selectors: [['', 'dir', '']], factory: () => new Directive()});
    }

    const directives = [Comp, Parent, ProjectedComp, Directive, NgIf];

    it('should call onInit every time a new view is created (if block)', () => {
      /**
       * % if (!skip) {
       *   <comp></comp>
       * % }
       */
      const App = createComponent('app', function(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          Δcontainer(0);
        }
        if (rf & RenderFlags.Update) {
          ΔcontainerRefreshStart(0);
          {
            if (!ctx.skip) {
              let rf1 = ΔembeddedViewStart(0, 1, 0);
              if (rf1 & RenderFlags.Create) {
                Δelement(0, 'comp');
              }
              ΔembeddedViewEnd();
            }
          }
          ΔcontainerRefreshEnd();
        }
      }, 1, 0, directives);

      const fixture = new ComponentFixture(App);
      expect(events).toEqual(['comp']);

      fixture.component.skip = true;
      fixture.update();
      expect(events).toEqual(['comp']);

      fixture.component.skip = false;
      fixture.update();
      expect(events).toEqual(['comp', 'comp']);
    });
  });

  describe('onChanges', () => {
    let events: ({type: string, name: string, [key: string]: any})[];

    beforeEach(() => { events = []; });

    /**
     * <div>
     *  <ng-content/>
     * </div>
     */
    const Comp = createOnChangesComponent('comp', (rf: RenderFlags, ctx: any) => {
      if (rf & RenderFlags.Create) {
        ΔprojectionDef();
        ΔelementStart(0, 'div');
        { Δprojection(1); }
        ΔelementEnd();
      }
    }, 2);

    /**
     * <comp [val1]="a" [publicVal2]="b"/>
     */
    const Parent = createOnChangesComponent('parent', (rf: RenderFlags, ctx: any) => {
      if (rf & RenderFlags.Create) {
        Δelement(0, 'comp');
      }
      if (rf & RenderFlags.Update) {
        ΔelementProperty(0, 'val1', Δbind(ctx.a));
        ΔelementProperty(0, 'publicVal2', Δbind(ctx.b));
      }
    }, 1, 2, [Comp]);

    const ProjectedComp = createOnChangesComponent('projected', (rf: RenderFlags, ctx: any) => {
      if (rf & RenderFlags.Create) {
        Δtext(0, 'content');
      }
    }, 1);


    function createOnChangesComponent(
        name: string, template: ComponentTemplate<any>, consts: number = 0, vars: number = 0,
        directives: any[] = []) {
      return class Component {
        // @Input() val1: string;
        // @Input('publicVal2') val2: string;
        a: string = 'wasVal1BeforeMinification';
        b: string = 'wasVal2BeforeMinification';
        ngOnChanges(changes: SimpleChanges) {
          if (changes.a && this.a !== changes.a.currentValue) {
            throw Error(
                `SimpleChanges invalid expected this.a ${this.a} to equal currentValue ${changes.a.currentValue}`);
          }
          if (changes.b && this.b !== changes.b.currentValue) {
            throw Error(
                `SimpleChanges invalid expected this.b ${this.b} to equal currentValue ${changes.b.currentValue}`);
          }
          events.push({type: 'onChanges', name: 'comp - ' + name, changes});
        }

        static ngComponentDef = ΔdefineComponent({
          type: Component,
          selectors: [[name]],
          factory: () => new Component(),
          consts: consts,
          vars: vars,
          inputs: {a: 'val1', b: ['publicVal2', 'val2']}, template,
          directives: directives,
          features: [ΔNgOnChangesFeature()],
        });
      };
    }

    class Directive {
      // @Input() val1: string;
      // @Input('publicVal2') val2: string;
      a: string = 'wasVal1BeforeMinification';
      b: string = 'wasVal2BeforeMinification';
      ngOnChanges(changes: SimpleChanges) {
        events.push({type: 'onChanges', name: 'dir - dir', changes});
      }

      static ngDirectiveDef = ΔdefineDirective({
        type: Directive,
        selectors: [['', 'dir', '']],
        factory: () => new Directive(),
        inputs: {a: 'val1', b: ['publicVal2', 'val2']},
        features: [ΔNgOnChangesFeature()],
      });
    }

    const defs = [Comp, Parent, Directive, ProjectedComp];

    it('should call onChanges method after inputs are set in creation and update mode', () => {
      /** <comp [val1]="val1" [publicVal2]="val2"></comp> */
      const App = createComponent('app', function(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          Δelement(0, 'comp');
        }
        if (rf & RenderFlags.Update) {
          ΔelementProperty(0, 'val1', Δbind(ctx.val1));
          ΔelementProperty(0, 'publicVal2', Δbind(ctx.val2));
        }
      }, 1, 2, defs);

      // First changes happen here.
      const fixture = new ComponentFixture(App);

      events = [];
      fixture.component.val1 = '1';
      fixture.component.val2 = 'a';
      fixture.update();
      expect(events).toEqual([{
        type: 'onChanges',
        name: 'comp - comp',
        changes: {
          'val1': new SimpleChange(
              undefined, '1', false),  // we cleared `events` above, this is the second change
          'val2': new SimpleChange(undefined, 'a', false),
        }
      }]);

      events = [];
      fixture.component.val1 = '2';
      fixture.component.val2 = 'b';
      fixture.update();
      expect(events).toEqual([{
        type: 'onChanges',
        name: 'comp - comp',
        changes: {
          'val1': new SimpleChange('1', '2', false),
          'val2': new SimpleChange('a', 'b', false),
        }
      }]);
    });

    it('should call parent onChanges before child onChanges', () => {
      /**
       * <parent></parent>
       * parent temp: <comp></comp>
       */
      const App = createComponent('app', function(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          Δelement(0, 'parent');
        }
        if (rf & RenderFlags.Update) {
          ΔelementProperty(0, 'val1', Δbind(ctx.val1));
          ΔelementProperty(0, 'publicVal2', Δbind(ctx.val2));
        }
      }, 1, 2, defs);

      const fixture = new ComponentFixture(App);

      // We're clearing events after the first change here
      events = [];
      fixture.component.val1 = '1';
      fixture.component.val2 = 'a';
      fixture.update();

      expect(events).toEqual([
        {
          type: 'onChanges',
          name: 'comp - parent',
          changes: {
            'val1': new SimpleChange(undefined, '1', false),
            'val2': new SimpleChange(undefined, 'a', false),
          }
        },
        {
          type: 'onChanges',
          name: 'comp - comp',
          changes: {
            'val1': new SimpleChange(undefined, '1', false),
            'val2': new SimpleChange(undefined, 'a', false),
          }
        },
      ]);
    });

    it('should call all parent onChanges across view before calling children onChanges', () => {
      /**
       * <parent [val1]="1"></parent>
       * <parent [val1]="2"></parent>
       */

      const App = createComponent('app', function(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          Δelement(0, 'parent');
          Δelement(1, 'parent');
        }
        if (rf & RenderFlags.Update) {
          ΔelementProperty(0, 'val1', Δbind(1));
          ΔelementProperty(0, 'publicVal2', Δbind(1));
          Δselect(1);
          ΔelementProperty(1, 'val1', Δbind(2));
          ΔelementProperty(1, 'publicVal2', Δbind(2));
        }
      }, 2, 4, defs);

      const fixture = new ComponentFixture(App);
      expect(events).toEqual([
        {
          type: 'onChanges',
          name: 'comp - parent',
          changes: {
            'val1': new SimpleChange(undefined, 1, true),
            'val2': new SimpleChange(undefined, 1, true),
          }
        },
        {
          type: 'onChanges',
          name: 'comp - parent',
          changes: {
            'val1': new SimpleChange(undefined, 2, true),
            'val2': new SimpleChange(undefined, 2, true),
          }
        },
        {
          type: 'onChanges',
          name: 'comp - comp',
          changes: {
            'val1': new SimpleChange(undefined, 1, true),
            'val2': new SimpleChange(undefined, 1, true),
          }
        },
        {
          type: 'onChanges',
          name: 'comp - comp',
          changes: {
            'val1': new SimpleChange(undefined, 2, true),
            'val2': new SimpleChange(undefined, 2, true),
          }
        },
      ]);
    });


    it('should call onChanges every time a new view is created (if block)', () => {
      /**
       * % if (condition) {
       *   <comp></comp>
       * % }
       */

      const App = createComponent('app', function(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          Δcontainer(0);
        }
        if (rf & RenderFlags.Update) {
          ΔcontainerRefreshStart(0);
          {
            if (ctx.condition) {
              let rf1 = ΔembeddedViewStart(0, 1, 2);
              if (rf1 & RenderFlags.Create) {
                Δelement(0, 'comp');
              }
              if (rf1 & RenderFlags.Update) {
                ΔelementProperty(0, 'val1', Δbind(1));
                ΔelementProperty(0, 'publicVal2', Δbind(1));
              }
              ΔembeddedViewEnd();
            }
          }
          ΔcontainerRefreshEnd();
        }
      }, 1, 0, defs);

      const fixture = new ComponentFixture(App);

      // Show the `comp` component, causing it to initialize. (first change is true)
      fixture.component.condition = true;
      fixture.update();
      expect(events).toEqual([{
        type: 'onChanges',
        name: 'comp - comp',
        changes: {
          'val1': new SimpleChange(undefined, 1, true),
          'val2': new SimpleChange(undefined, 1, true),
        }
      }]);

      // Hide the `comp` component, no onChanges should fire
      fixture.component.condition = false;
      fixture.update();
      expect(events).toEqual([{
        type: 'onChanges',
        name: 'comp - comp',
        changes: {
          'val1': new SimpleChange(undefined, 1, true),
          'val2': new SimpleChange(undefined, 1, true),
        }
      }]);

      // Show the `comp` component, it initializes again. (first change is true)
      fixture.component.condition = true;
      fixture.update();
      expect(events).toEqual([
        {
          type: 'onChanges',
          name: 'comp - comp',
          changes: {
            'val1': new SimpleChange(undefined, 1, true),
            'val2': new SimpleChange(undefined, 1, true),
          }
        },
        {
          type: 'onChanges',
          name: 'comp - comp',
          changes: {
            'val1': new SimpleChange(undefined, 1, true),
            'val2': new SimpleChange(undefined, 1, true),
          }
        }
      ]);
    });

    it('should call onChanges in hosts before their content children', () => {
      /**
       * <comp>
       *   <projected></projected>
       * </comp>
       */
      const App = createComponent('app', function(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          ΔelementStart(0, 'comp');
          { ΔelementStart(1, 'projected'); }
          ΔelementEnd();
        }
        if (rf & RenderFlags.Update) {
          ΔelementProperty(0, 'val1', Δbind(1));
          ΔelementProperty(0, 'publicVal2', Δbind(1));
          Δselect(1);
          ΔelementProperty(1, 'val1', Δbind(2));
          ΔelementProperty(1, 'publicVal2', Δbind(2));
        }
      }, 2, 4, defs);

      const fixture = new ComponentFixture(App);
      expect(events).toEqual([
        {
          type: 'onChanges',
          name: 'comp - comp',
          changes: {
            'val1': new SimpleChange(undefined, 1, true),
            'val2': new SimpleChange(undefined, 1, true),
          }
        },
        {
          type: 'onChanges',
          name: 'comp - projected',
          changes: {
            'val1': new SimpleChange(undefined, 2, true),
            'val2': new SimpleChange(undefined, 2, true),
          }
        },
      ]);
    });

    it('should call onChanges in host and its content children before next host', () => {
      /**
       * <comp [val1]="1" [publicVal2]="1">
       *   <projected [val1]="2" [publicVal2]="2"></projected>
       * </comp>
       * <comp [val1]="3" [publicVal2]="3">
       *   <projected [val1]="4" [publicVal2]="4"></projected>
       * </comp>
       */
      const App = createComponent('app', function(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          ΔelementStart(0, 'comp');
          { ΔelementStart(1, 'projected'); }
          ΔelementEnd();
          ΔelementStart(2, 'comp');
          { ΔelementStart(3, 'projected'); }
          ΔelementEnd();
        }
        if (rf & RenderFlags.Update) {
          ΔelementProperty(0, 'val1', Δbind(1));
          ΔelementProperty(0, 'publicVal2', Δbind(1));
          Δselect(1);
          ΔelementProperty(1, 'val1', Δbind(2));
          ΔelementProperty(1, 'publicVal2', Δbind(2));
          Δselect(2);
          ΔelementProperty(2, 'val1', Δbind(3));
          ΔelementProperty(2, 'publicVal2', Δbind(3));
          Δselect(3);
          ΔelementProperty(3, 'val1', Δbind(4));
          ΔelementProperty(3, 'publicVal2', Δbind(4));
        }
      }, 4, 8, defs);

      const fixture = new ComponentFixture(App);
      expect(events).toEqual([
        {
          type: 'onChanges',
          name: 'comp - comp',
          changes: {
            'val1': new SimpleChange(undefined, 1, true),
            'val2': new SimpleChange(undefined, 1, true),
          }
        },
        {
          type: 'onChanges',
          name: 'comp - projected',
          changes: {
            'val1': new SimpleChange(undefined, 2, true),
            'val2': new SimpleChange(undefined, 2, true),
          }
        },
        {
          type: 'onChanges',
          name: 'comp - comp',
          changes: {
            'val1': new SimpleChange(undefined, 3, true),
            'val2': new SimpleChange(undefined, 3, true),
          }
        },
        {
          type: 'onChanges',
          name: 'comp - projected',
          changes: {
            'val1': new SimpleChange(undefined, 4, true),
            'val2': new SimpleChange(undefined, 4, true),
          }
        },
      ]);
    });

    it('should be called on directives after component', () => {
      /**
       * <comp dir [val1]="1" [publicVal2]="1"></comp>
       */
      const App = createComponent('app', function(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          Δelement(0, 'comp', ['dir', '']);
        }
        if (rf & RenderFlags.Update) {
          ΔelementProperty(0, 'val1', Δbind(1));
          ΔelementProperty(0, 'publicVal2', Δbind(1));
        }
      }, 1, 2, defs);

      const fixture = new ComponentFixture(App);
      expect(events).toEqual([
        {
          type: 'onChanges',
          name: 'comp - comp',
          changes: {
            'val1': new SimpleChange(undefined, 1, true),
            'val2': new SimpleChange(undefined, 1, true),
          }
        },
        {
          type: 'onChanges',
          name: 'dir - dir',
          changes: {
            'val1': new SimpleChange(undefined, 1, true),
            'val2': new SimpleChange(undefined, 1, true),
          }
        },
      ]);

      // Update causes no changes to be fired, since the bindings didn't change.
      events = [];
      fixture.update();
      expect(events).toEqual([]);

    });

    it('should be called on directives on an element', () => {
      /**
       * <div dir [val]="1" [publicVal2]="1"></div>
       */
      const App = createComponent('app', function(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          Δelement(0, 'div', ['dir', '']);
        }
        if (rf & RenderFlags.Update) {
          ΔelementProperty(0, 'val1', Δbind(1));
          ΔelementProperty(0, 'publicVal2', Δbind(1));
        }
      }, 1, 2, defs);

      const fixture = new ComponentFixture(App);
      expect(events).toEqual([{
        type: 'onChanges',
        name: 'dir - dir',
        changes: {
          'val1': new SimpleChange(undefined, 1, true),
          'val2': new SimpleChange(undefined, 1, true),
        }
      }]);

      events = [];
      fixture.update();
      expect(events).toEqual([]);
    });

    it('should call onChanges properly in for loop', () => {
      /**
       *  <comp [val1]="1" [publicVal2]="1"></comp>
       * % for (let j = 2; j < 5; j++) {
       *   <comp [val1]="j" [publicVal2]="j"></comp>
       * % }
       *  <comp [val1]="5" [publicVal2]="5"></comp>
       */

      const App = createComponent('app', function(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          Δelement(0, 'comp');
          Δcontainer(1);
          Δelement(2, 'comp');
        }
        if (rf & RenderFlags.Update) {
          ΔelementProperty(0, 'val1', Δbind(1));
          ΔelementProperty(0, 'publicVal2', Δbind(1));
          Δselect(2);
          ΔelementProperty(2, 'val1', Δbind(5));
          ΔelementProperty(2, 'publicVal2', Δbind(5));
          ΔcontainerRefreshStart(1);
          {
            for (let j = 2; j < 5; j++) {
              let rf1 = ΔembeddedViewStart(0, 1, 2);
              if (rf1 & RenderFlags.Create) {
                Δelement(0, 'comp');
              }
              if (rf1 & RenderFlags.Update) {
                ΔelementProperty(0, 'val1', Δbind(j));
                ΔelementProperty(0, 'publicVal2', Δbind(j));
              }
              ΔembeddedViewEnd();
            }
          }
          ΔcontainerRefreshEnd();
        }
      }, 3, 4, defs);

      const fixture = new ComponentFixture(App);

      // onChanges is called top to bottom, so top level comps (1 and 5) are called
      // before the comps inside the for loop's embedded view (2, 3, and 4)
      expect(events).toEqual([
        {
          type: 'onChanges',
          name: 'comp - comp',
          changes: {
            'val1': new SimpleChange(undefined, 1, true),
            'val2': new SimpleChange(undefined, 1, true),
          }
        },
        {
          type: 'onChanges',
          name: 'comp - comp',
          changes: {
            'val1': new SimpleChange(undefined, 5, true),
            'val2': new SimpleChange(undefined, 5, true),
          }
        },
        {
          type: 'onChanges',
          name: 'comp - comp',
          changes: {
            'val1': new SimpleChange(undefined, 2, true),
            'val2': new SimpleChange(undefined, 2, true),
          }
        },
        {
          type: 'onChanges',
          name: 'comp - comp',
          changes: {
            'val1': new SimpleChange(undefined, 3, true),
            'val2': new SimpleChange(undefined, 3, true),
          }
        },
        {
          type: 'onChanges',
          name: 'comp - comp',
          changes: {
            'val1': new SimpleChange(undefined, 4, true),
            'val2': new SimpleChange(undefined, 4, true),
          }
        },
      ]);
    });

    it('should call onChanges properly in for loop with children', () => {
      /**
       *  <parent [val1]="1" [publicVal2]="1"></parent>
       * % for (let j = 2; j < 5; j++) {
       *   <parent [val1]="j" [publicVal2]="j"></parent>
       * % }
       *  <parent [val1]="5" [publicVal2]="5"></parent>
       */

      const App = createComponent('app', function(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          Δelement(0, 'parent');
          Δcontainer(1);
          Δelement(2, 'parent');
        }
        if (rf & RenderFlags.Update) {
          ΔelementProperty(0, 'val1', Δbind(1));
          ΔelementProperty(0, 'publicVal2', Δbind(1));
          Δselect(2);
          ΔelementProperty(2, 'val1', Δbind(5));
          ΔelementProperty(2, 'publicVal2', Δbind(5));
          ΔcontainerRefreshStart(1);
          {
            for (let j = 2; j < 5; j++) {
              let rf1 = ΔembeddedViewStart(0, 1, 2);
              if (rf1 & RenderFlags.Create) {
                Δelement(0, 'parent');
              }
              if (rf1 & RenderFlags.Update) {
                ΔelementProperty(0, 'val1', Δbind(j));
                ΔelementProperty(0, 'publicVal2', Δbind(j));
              }
              ΔembeddedViewEnd();
            }
          }
          ΔcontainerRefreshEnd();
        }
      }, 3, 4, defs);

      const fixture = new ComponentFixture(App);

      // onChanges is called top to bottom, so top level comps (1 and 5) are called
      // before the comps inside the for loop's embedded view (2, 3, and 4)
      expect(events).toEqual([
        {
          type: 'onChanges',
          name: 'comp - parent',
          changes: {
            'val1': new SimpleChange(undefined, 1, true),
            'val2': new SimpleChange(undefined, 1, true),
          }
        },
        {
          type: 'onChanges',
          name: 'comp - parent',
          changes: {
            'val1': new SimpleChange(undefined, 5, true),
            'val2': new SimpleChange(undefined, 5, true),
          }
        },
        {
          type: 'onChanges',
          name: 'comp - parent',
          changes: {
            'val1': new SimpleChange(undefined, 2, true),
            'val2': new SimpleChange(undefined, 2, true),
          }
        },
        {
          type: 'onChanges',
          name: 'comp - comp',
          changes: {
            'val1': new SimpleChange(undefined, 2, true),
            'val2': new SimpleChange(undefined, 2, true),
          }
        },
        {
          type: 'onChanges',
          name: 'comp - parent',
          changes: {
            'val1': new SimpleChange(undefined, 3, true),
            'val2': new SimpleChange(undefined, 3, true),
          }
        },
        {
          type: 'onChanges',
          name: 'comp - comp',
          changes: {
            'val1': new SimpleChange(undefined, 3, true),
            'val2': new SimpleChange(undefined, 3, true),
          }
        },
        {
          type: 'onChanges',
          name: 'comp - parent',
          changes: {
            'val1': new SimpleChange(undefined, 4, true),
            'val2': new SimpleChange(undefined, 4, true),
          }
        },
        {
          type: 'onChanges',
          name: 'comp - comp',
          changes: {
            'val1': new SimpleChange(undefined, 4, true),
            'val2': new SimpleChange(undefined, 4, true),
          }
        },
        {
          type: 'onChanges',
          name: 'comp - comp',
          changes: {
            'val1': new SimpleChange(undefined, 1, true),
            'val2': new SimpleChange(undefined, 1, true),
          }
        },
        {
          type: 'onChanges',
          name: 'comp - comp',
          changes: {
            'val1': new SimpleChange(undefined, 5, true),
            'val2': new SimpleChange(undefined, 5, true),
          }
        },
      ]);
    });

    it('should not call onChanges if props are set directly', () => {
      let events: SimpleChanges[] = [];
      let compInstance: MyComp;
      class MyComp {
        value = 0;

        ngOnChanges(changes: SimpleChanges) { events.push(changes); }

        static ngComponentDef = ΔdefineComponent({
          type: MyComp,
          factory: () => {
            // Capture the instance so we can test setting the property directly
            compInstance = new MyComp();
            return compInstance;
          },
          template: (rf: RenderFlags, ctx: any) => {
            if (rf & RenderFlags.Create) {
              Δelement(0, 'div');
            }
            if (rf & RenderFlags.Update) {
              ΔelementProperty(0, 'id', Δbind(ctx.a));
            }
          },
          selectors: [['my-comp']],
          inputs: {
            value: 'value',
          },
          consts: 1,
          vars: 1,
        });
      }

      /**
       *  <my-comp [value]="1"></my-comp>
       */

      const App = createComponent('app', function(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          Δelement(0, 'my-comp');
        }
        if (rf & RenderFlags.Update) {
          ΔelementProperty(0, 'value', Δbind(1));
        }
      }, 1, 1, [MyComp]);

      const fixture = new ComponentFixture(App);
      events = [];

      // Try setting the property directly
      compInstance !.value = 2;

      fixture.update();
      expect(events).toEqual([]);
    });

  });

  describe('hook order', () => {
    let events: string[];

    beforeEach(() => { events = []; });

    function createAllHooksComponent(
        name: string, template: ComponentTemplate<any>, consts: number = 0, vars: number = 0,
        directives: any[] = []) {
      return class Component {
        val: string = '';

        ngOnChanges() { events.push(`changes ${name}${this.val}`); }

        ngOnInit() { events.push(`init ${name}${this.val}`); }
        ngDoCheck() { events.push(`check ${name}${this.val}`); }

        ngAfterContentInit() { events.push(`contentInit ${name}${this.val}`); }
        ngAfterContentChecked() { events.push(`contentCheck ${name}${this.val}`); }

        ngAfterViewInit() { events.push(`viewInit ${name}${this.val}`); }
        ngAfterViewChecked() { events.push(`viewCheck ${name}${this.val}`); }

        static ngComponentDef = ΔdefineComponent({
          type: Component,
          selectors: [[name]],
          factory: () => new Component(),
          consts: consts,
          vars: vars,
          inputs: {val: 'val'}, template,
          directives: directives,
          features: [ΔNgOnChangesFeature()],
        });
      };
    }

    it('should call all hooks in correct order', () => {
      const Comp = createAllHooksComponent('comp', (rf: RenderFlags, ctx: any) => {});

      /**
       * <comp [val]="1"></comp>
       * <comp [val]="2"></comp>
       */
      const App = createComponent('app', function(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          Δelement(0, 'comp');
          Δelement(1, 'comp');
        }
        // This template function is a little weird in that the `elementProperty` calls
        // below are directly setting values `1` and `2`, where normally there would be
        // a call to `bind()` that would do the work of seeing if something changed.
        // This means when `fixture.update()` is called below, ngOnChanges should fire,
        // even though the *value* itself never changed.
        if (rf & RenderFlags.Update) {
          ΔelementProperty(0, 'val', 1);
          Δselect(1);
          ΔelementProperty(1, 'val', 2);
        }
      }, 2, 0, [Comp]);

      const fixture = new ComponentFixture(App);
      expect(events).toEqual([
        'changes comp1', 'init comp1', 'check comp1', 'changes comp2', 'init comp2', 'check comp2',
        'contentInit comp1', 'contentCheck comp1', 'contentInit comp2', 'contentCheck comp2',
        'viewInit comp1', 'viewCheck comp1', 'viewInit comp2', 'viewCheck comp2'
      ]);

      events = [];
      fixture.update();  // Changes are made due to lack of `bind()` call in template fn.
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
          Δelement(0, 'comp');
        }
        if (rf & RenderFlags.Update) {
          ΔelementProperty(0, 'val', Δbind(ctx.val));
        }
      }, 1, 1, [Comp]);

      /**
       * <parent [val]="1"></parent>
       * <parent [val]="2"></parent>
       */
      const App = createComponent('app', function(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          Δelement(0, 'parent');
          Δelement(1, 'parent');
        }
        if (rf & RenderFlags.Update) {
          ΔelementProperty(0, 'val', 1);
          Δselect(1);
          ΔelementProperty(1, 'val', 2);
        }
      }, 2, 0, [Parent]);

      const fixture = new ComponentFixture(App);
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
      fixture.update();
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
          ΔprojectionDef();
          Δprojection(0);
          Δelement(1, 'view');
        }
        if (rf & RenderFlags.Update) {
          Δselect(1);
          ΔelementProperty(1, 'val', Δbind(ctx.val));
        }
      }, 2, 1, [View]);

      /**
       * <parent [val]="1">
       *   <content [val]="1"></content>
       * </parent>
       * <parent [val]="2">
       *   <content [val]="2"></content>
       * </parent>
       */
      const App = createComponent('app', function(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          ΔelementStart(0, 'parent');
          { Δelement(1, 'content'); }
          ΔelementEnd();
          ΔelementStart(2, 'parent');
          { Δelement(3, 'content'); }
          ΔelementEnd();
        }
        if (rf & RenderFlags.Update) {
          ΔelementProperty(0, 'val', Δbind(1));
          Δselect(1);
          ΔelementProperty(1, 'val', Δbind(1));
          Δselect(2);
          ΔelementProperty(2, 'val', Δbind(2));
          Δselect(3);
          ΔelementProperty(3, 'val', Δbind(2));
        }
      }, 4, 4, [Parent, Content]);

      const fixture = new ComponentFixture(App);
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
      fixture.update();
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

        static ngDirectiveDef = ΔdefineDirective({
          type: OnDestroyDirective,
          selectors: [['', 'onDestroyDirective', '']],
          factory: () => new OnDestroyDirective()
        });
      }


      function conditionTpl(rf: RenderFlags, ctx: Cmpt) {
        if (rf & RenderFlags.Create) {
          Δtemplate(0, null, 0, 1, 'ng-template', [AttributeMarker.Bindings, 'onDestroyDirective']);
        }
      }

      /**
       * <ng-template [ngIf]="condition">
       *  <ng-template onDestroyDirective></ng-template>
       * </ng-template>
       */
      function cmptTpl(rf: RenderFlags, cmpt: Cmpt) {
        if (rf & RenderFlags.Create) {
          Δtemplate(0, conditionTpl, 1, 1, 'ng-template', [AttributeMarker.Bindings, 'ngIf']);
        }
        if (rf & RenderFlags.Update) {
          ΔelementProperty(0, 'ngIf', Δbind(cmpt.showing));
        }
      }

      class Cmpt {
        showing = true;
        static ngComponentDef = ΔdefineComponent({
          type: Cmpt,
          factory: () => new Cmpt(),
          selectors: [['cmpt']],
          consts: 1,
          vars: 1,
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
