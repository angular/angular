/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ViewEncapsulation, ɵɵdefineInjectable, ɵɵdefineInjector} from '../../src/core';
import {createInjector} from '../../src/di/r3_injector';
import {AttributeMarker, ComponentFactory, LifecycleHooksFeature, getRenderedText, markDirty, ɵɵdefineComponent, ɵɵdirectiveInject, ɵɵproperty, ɵɵselect, ɵɵtemplate} from '../../src/render3/index';
import {tick, ɵɵcontainer, ɵɵcontainerRefreshEnd, ɵɵcontainerRefreshStart, ɵɵelement, ɵɵelementEnd, ɵɵelementStart, ɵɵembeddedViewEnd, ɵɵembeddedViewStart, ɵɵnextContext, ɵɵtext, ɵɵtextBinding} from '../../src/render3/instructions/all';
import {ComponentDef, RenderFlags} from '../../src/render3/interfaces/definition';

import {NgIf} from './common_with_def';
import {ComponentFixture, MockRendererFactory, containerEl, createComponent, renderComponent, renderToHtml, requestAnimationFrame, toHtml} from './render_util';

describe('component', () => {
  class CounterComponent {
    count = 0;

    increment() { this.count++; }

    static ngComponentDef = ɵɵdefineComponent({
      type: CounterComponent,
      encapsulation: ViewEncapsulation.None,
      selectors: [['counter']],
      consts: 1,
      vars: 1,
      template: function(rf: RenderFlags, ctx: CounterComponent) {
        if (rf & RenderFlags.Create) {
          ɵɵtext(0);
        }
        if (rf & RenderFlags.Update) {
          ɵɵselect(0);
          ɵɵtextBinding(ctx.count);
        }
      },
      factory: () => new CounterComponent,
      inputs: {count: 'count'},
    });
  }

  describe('renderComponent', () => {
    it('should render on initial call', () => {
      renderComponent(CounterComponent);
      expect(toHtml(containerEl)).toEqual('0');
    });

    it('should re-render on input change or method invocation', () => {
      const component = renderComponent(CounterComponent);
      expect(toHtml(containerEl)).toEqual('0');
      component.count = 123;
      markDirty(component);
      expect(toHtml(containerEl)).toEqual('0');
      requestAnimationFrame.flush();
      expect(toHtml(containerEl)).toEqual('123');
      component.increment();
      markDirty(component);
      expect(toHtml(containerEl)).toEqual('123');
      requestAnimationFrame.flush();
      expect(toHtml(containerEl)).toEqual('124');
    });

    class MyService {
      constructor(public value: string) {}
      static ngInjectableDef = ɵɵdefineInjectable({
        token: MyService,
        providedIn: 'root',
        factory: () => new MyService('no-injector'),
      });
    }
    class MyComponent {
      constructor(public myService: MyService) {}
      static ngComponentDef = ɵɵdefineComponent({
        type: MyComponent,
        encapsulation: ViewEncapsulation.None,
        selectors: [['my-component']],
        factory: () => new MyComponent(ɵɵdirectiveInject(MyService)),
        consts: 1,
        vars: 1,
        template: function(fs: RenderFlags, ctx: MyComponent) {
          if (fs & RenderFlags.Create) {
            ɵɵtext(0);
          }
          if (fs & RenderFlags.Update) {
            ɵɵselect(0);
            ɵɵtextBinding(ctx.myService.value);
          }
        }
      });
    }

    class MyModule {
      static ngInjectorDef = ɵɵdefineInjector({
        factory: () => new MyModule(),
        providers: [{provide: MyService, useValue: new MyService('injector')}]
      });
    }

    it('should support bootstrapping without injector', () => {
      const fixture = new ComponentFixture(MyComponent);
      expect(fixture.html).toEqual('no-injector');
    });

    it('should support bootstrapping with injector', () => {
      const fixture = new ComponentFixture(MyComponent, {injector: createInjector(MyModule)});
      expect(fixture.html).toEqual('injector');
    });

  });

  it('should instantiate components at high indices', () => {

    // {{ name }}
    class Comp {
      // @Input
      name = '';

      static ngComponentDef = ɵɵdefineComponent({
        type: Comp,
        selectors: [['comp']],
        factory: () => new Comp(),
        consts: 1,
        vars: 1,
        template: (rf: RenderFlags, ctx: Comp) => {
          if (rf & RenderFlags.Create) {
            ɵɵtext(0);
          }
          if (rf & RenderFlags.Update) {
            ɵɵselect(0);
            ɵɵtextBinding(ctx.name);
          }
        },
        inputs: {name: 'name'}
      });
    }

    // Artificially inflating the slot IDs of this app component to mimic an app
    // with a very large view
    const App = createComponent('app', (rf: RenderFlags, ctx: any) => {
      if (rf & RenderFlags.Create) {
        ɵɵelement(4097, 'comp');
      }
      if (rf & RenderFlags.Update) {
        ɵɵselect(4097);
        ɵɵproperty('name', ctx.name);
      }
    }, 4098, 1, [Comp]);

    const fixture = new ComponentFixture(App);
    expect(fixture.html).toEqual('<comp></comp>');

    fixture.component.name = 'some name';
    fixture.update();
    expect(fixture.html).toEqual('<comp>some name</comp>');
  });

});

it('should not invoke renderer destroy method for embedded views', () => {
  let comp: Comp;

  function MyComponent_div_Template_2(rf: any, ctx: any) {
    if (rf & RenderFlags.Create) {
      ɵɵelementStart(0, 'div');
      ɵɵtext(1, 'Child view');
      ɵɵelementEnd();
    }
  }

  class Comp {
    visible = true;

    static ngComponentDef = ɵɵdefineComponent({
      type: Comp,
      selectors: [['comp']],
      consts: 3,
      vars: 1,
      factory: () => {
        comp = new Comp();
        return comp;
      },
      directives: [NgIf],
      /**
       *  <div>Root view</div>
       *  <div *ngIf="visible">Child view</div>
       */
      template: function(rf: RenderFlags, ctx: Comp) {
        if (rf & RenderFlags.Create) {
          ɵɵelementStart(0, 'div');
          ɵɵtext(1, 'Root view');
          ɵɵelementEnd();
          ɵɵtemplate(
              2, MyComponent_div_Template_2, 2, 0, 'div', [AttributeMarker.Template, 'ngIf']);
        }
        if (rf & RenderFlags.Update) {
          ɵɵselect(2);
          ɵɵproperty('ngIf', ctx.visible);
        }
      }
    });
  }

  const rendererFactory = new MockRendererFactory(['destroy']);
  const fixture = new ComponentFixture(Comp, {rendererFactory});

  comp !.visible = false;
  fixture.update();

  comp !.visible = true;
  fixture.update();

  const renderer = rendererFactory.lastRenderer !;
  const destroySpy = renderer.spies['destroy'];

  // we should never see `destroy` method being called
  // in case child views are created/removed
  expect(destroySpy.calls.count()).toBe(0);
});

describe('component with a container', () => {
  function showItems(rf: RenderFlags, ctx: {items: string[]}) {
    if (rf & RenderFlags.Create) {
      ɵɵcontainer(0);
    }
    if (rf & RenderFlags.Update) {
      ɵɵcontainerRefreshStart(0);
      {
        for (const item of ctx.items) {
          const rf0 = ɵɵembeddedViewStart(0, 1, 1);
          {
            if (rf0 & RenderFlags.Create) {
              ɵɵtext(0);
            }
            if (rf0 & RenderFlags.Update) {
              ɵɵselect(0);
              ɵɵtextBinding(item);
            }
          }
          ɵɵembeddedViewEnd();
        }
      }
      ɵɵcontainerRefreshEnd();
    }
  }

  class WrapperComponent {
    // TODO(issue/24571): remove '!'.
    items !: string[];
    static ngComponentDef = ɵɵdefineComponent({
      type: WrapperComponent,
      encapsulation: ViewEncapsulation.None,
      selectors: [['wrapper']],
      consts: 1,
      vars: 0,
      template: function ChildComponentTemplate(rf: RenderFlags, ctx: {items: string[]}) {
        if (rf & RenderFlags.Create) {
          ɵɵcontainer(0);
        }
        if (rf & RenderFlags.Update) {
          ɵɵcontainerRefreshStart(0);
          {
            const rf0 = ɵɵembeddedViewStart(0, 1, 0);
            { showItems(rf0, {items: ctx.items}); }
            ɵɵembeddedViewEnd();
          }
          ɵɵcontainerRefreshEnd();
        }
      },
      factory: () => new WrapperComponent,
      inputs: {items: 'items'}
    });
  }

  function template(rf: RenderFlags, ctx: {items: string[]}) {
    if (rf & RenderFlags.Create) {
      ɵɵelement(0, 'wrapper');
    }
    if (rf & RenderFlags.Update) {
      ɵɵselect(0);
      ɵɵproperty('items', ctx.items);
    }
  }

  const defs = [WrapperComponent];

  it('should re-render on input change', () => {
    const ctx: {items: string[]} = {items: ['a']};
    expect(renderToHtml(template, ctx, 1, 1, defs)).toEqual('<wrapper>a</wrapper>');

    ctx.items = [...ctx.items, 'b'];
    expect(renderToHtml(template, ctx, 1, 1, defs)).toEqual('<wrapper>ab</wrapper>');
  });
});

describe('recursive components', () => {
  let events: string[];
  let count: number;

  beforeEach(() => {
    events = [];
    count = 0;
  });

  class TreeNode {
    constructor(
        public value: number, public depth: number, public left: TreeNode|null,
        public right: TreeNode|null) {}
  }

  /**
   * {{ data.value }}
   *
   * % if (data.left != null) {
   *   <tree-comp [data]="data.left"></tree-comp>
   * % }
   * % if (data.right != null) {
   *   <tree-comp [data]="data.right"></tree-comp>
   * % }
   */
  class TreeComponent {
    data: TreeNode = _buildTree(0);

    ngDoCheck() { events.push('check' + this.data.value); }

    ngOnDestroy() { events.push('destroy' + this.data.value); }

    static ngComponentDef = ɵɵdefineComponent({
      type: TreeComponent,
      encapsulation: ViewEncapsulation.None,
      selectors: [['tree-comp']],
      factory: () => new TreeComponent(),
      consts: 3,
      vars: 1,
      template: (rf: RenderFlags, ctx: TreeComponent) => {
        if (rf & RenderFlags.Create) {
          ɵɵtext(0);
          ɵɵcontainer(1);
          ɵɵcontainer(2);
        }
        if (rf & RenderFlags.Update) {
          ɵɵselect(0);
          ɵɵtextBinding(ctx.data.value);
          ɵɵcontainerRefreshStart(1);
          {
            if (ctx.data.left != null) {
              let rf0 = ɵɵembeddedViewStart(0, 1, 1);
              if (rf0 & RenderFlags.Create) {
                ɵɵelement(0, 'tree-comp');
              }
              if (rf0 & RenderFlags.Update) {
                ɵɵselect(0);
                ɵɵproperty('data', ctx.data.left);
              }
              ɵɵembeddedViewEnd();
            }
          }
          ɵɵcontainerRefreshEnd();
          ɵɵcontainerRefreshStart(2);
          {
            if (ctx.data.right != null) {
              let rf0 = ɵɵembeddedViewStart(0, 1, 1);
              if (rf0 & RenderFlags.Create) {
                ɵɵelement(0, 'tree-comp');
              }
              if (rf0 & RenderFlags.Update) {
                ɵɵselect(0);
                ɵɵproperty('data', ctx.data.right);
              }
              ɵɵembeddedViewEnd();
            }
          }
          ɵɵcontainerRefreshEnd();
        }
      },
      inputs: {data: 'data'}
    });
  }

  (TreeComponent.ngComponentDef as ComponentDef<TreeComponent>).directiveDefs =
      () => [TreeComponent.ngComponentDef];

  /**
   * {{ data.value }}
   *  <ng-if-tree [data]="data.left" *ngIf="data.left"></ng-if-tree>
   *  <ng-if-tree [data]="data.right" *ngIf="data.right"></ng-if-tree>
   */
  class NgIfTree {
    data: TreeNode = _buildTree(0);

    ngDoCheck() { events.push('check' + this.data.value); }

    ngOnDestroy() { events.push('destroy' + this.data.value); }

    static ngComponentDef = ɵɵdefineComponent({
      type: NgIfTree,
      encapsulation: ViewEncapsulation.None,
      selectors: [['ng-if-tree']],
      factory: () => new NgIfTree(),
      consts: 3,
      vars: 3,
      template: (rf: RenderFlags, ctx: NgIfTree) => {

        if (rf & RenderFlags.Create) {
          ɵɵtext(0);
          ɵɵtemplate(
              1, IfTemplate, 1, 1, 'ng-if-tree',
              [AttributeMarker.Bindings, 'data', AttributeMarker.Template, 'ngIf']);
          ɵɵtemplate(
              2, IfTemplate2, 1, 1, 'ng-if-tree',
              [AttributeMarker.Bindings, 'data', AttributeMarker.Template, 'ngIf']);
        }
        if (rf & RenderFlags.Update) {
          ɵɵselect(0);
          ɵɵtextBinding(ctx.data.value);
          ɵɵselect(1);
          ɵɵproperty('ngIf', ctx.data.left);
          ɵɵselect(2);
          ɵɵproperty('ngIf', ctx.data.right);
        }

      },
      inputs: {data: 'data'},
    });
  }

  function IfTemplate(rf: RenderFlags, left: any) {
    if (rf & RenderFlags.Create) {
      ɵɵelementStart(0, 'ng-if-tree');
      ɵɵelementEnd();
    }
    if (rf & RenderFlags.Update) {
      const parent = ɵɵnextContext();
      ɵɵselect(0);
      ɵɵproperty('data', parent.data.left);
    }
  }

  function IfTemplate2(rf: RenderFlags, right: any) {
    if (rf & RenderFlags.Create) {
      ɵɵelementStart(0, 'ng-if-tree');
      ɵɵelementEnd();
    }
    if (rf & RenderFlags.Update) {
      const parent = ɵɵnextContext();
      ɵɵselect(0);
      ɵɵproperty('data', parent.data.right);
    }
  }

  (NgIfTree.ngComponentDef as ComponentDef<NgIfTree>).directiveDefs =
      () => [NgIfTree.ngComponentDef, NgIf.ngDirectiveDef];

  function _buildTree(currDepth: number): TreeNode {
    const children = currDepth < 2 ? _buildTree(currDepth + 1) : null;
    const children2 = currDepth < 2 ? _buildTree(currDepth + 1) : null;
    return new TreeNode(count++, currDepth, children, children2);
  }

  it('should check each component just once', () => {
    const comp = renderComponent(TreeComponent, {hostFeatures: [LifecycleHooksFeature]});
    expect(getRenderedText(comp)).toEqual('6201534');
    expect(events).toEqual(['check6', 'check2', 'check0', 'check1', 'check5', 'check3', 'check4']);

    events = [];
    tick(comp);
    expect(events).toEqual(['check6', 'check2', 'check0', 'check1', 'check5', 'check3', 'check4']);
  });

  // This tests that the view tree is set up properly for recursive components
  it('should call onDestroys properly', () => {

    /**
     * % if (!skipContent) {
     *   <tree-comp></tree-comp>
     * % }
     */
    const App = createComponent('app', function(rf: RenderFlags, ctx: any) {
      if (rf & RenderFlags.Create) {
        ɵɵcontainer(0);
      }
      if (rf & RenderFlags.Update) {
        ɵɵcontainerRefreshStart(0);
        if (!ctx.skipContent) {
          const rf0 = ɵɵembeddedViewStart(0, 1, 0);
          if (rf0 & RenderFlags.Create) {
            ɵɵelementStart(0, 'tree-comp');
            ɵɵelementEnd();
          }
          ɵɵembeddedViewEnd();
        }
        ɵɵcontainerRefreshEnd();
      }
    }, 1, 0, [TreeComponent]);

    const fixture = new ComponentFixture(App);
    expect(getRenderedText(fixture.component)).toEqual('6201534');

    events = [];
    fixture.component.skipContent = true;
    fixture.update();
    expect(events).toEqual(
        ['destroy0', 'destroy1', 'destroy2', 'destroy3', 'destroy4', 'destroy5', 'destroy6']);
  });

  it('should call onDestroys properly with ngIf', () => {
    /**
     * % if (!skipContent) {
     *   <ng-if-tree></ng-if-tree>
     * % }
     */
    const App = createComponent('app', function(rf: RenderFlags, ctx: any) {
      if (rf & RenderFlags.Create) {
        ɵɵcontainer(0);
      }
      if (rf & RenderFlags.Update) {
        ɵɵcontainerRefreshStart(0);
        if (!ctx.skipContent) {
          const rf0 = ɵɵembeddedViewStart(0, 1, 0);
          if (rf0 & RenderFlags.Create) {
            ɵɵelementStart(0, 'ng-if-tree');
            ɵɵelementEnd();
          }
          ɵɵembeddedViewEnd();
        }
        ɵɵcontainerRefreshEnd();
      }
    }, 1, 0, [NgIfTree]);

    const fixture = new ComponentFixture(App);
    expect(getRenderedText(fixture.component)).toEqual('6201534');
    expect(events).toEqual(['check6', 'check2', 'check0', 'check1', 'check5', 'check3', 'check4']);

    events = [];
    fixture.component.skipContent = true;
    fixture.update();
    expect(events).toEqual(
        ['destroy0', 'destroy1', 'destroy2', 'destroy3', 'destroy4', 'destroy5', 'destroy6']);
  });

  it('should map inputs minified & unminified names', async() => {
    class TestInputsComponent {
      // TODO(issue/24571): remove '!'.
      minifiedName !: string;
      static ngComponentDef = ɵɵdefineComponent({
        type: TestInputsComponent,
        encapsulation: ViewEncapsulation.None,
        selectors: [['test-inputs']],
        inputs: {minifiedName: 'unminifiedName'},
        consts: 0,
        vars: 0,
        factory: () => new TestInputsComponent(),
        template: function(rf: RenderFlags, ctx: TestInputsComponent): void {
          // Template not needed for this test
        }
      });
    }

    const testInputsComponentFactory = new ComponentFactory(TestInputsComponent.ngComponentDef);

    expect([
      {propName: 'minifiedName', templateName: 'unminifiedName'}
    ]).toEqual(testInputsComponentFactory.inputs);

  });

});
