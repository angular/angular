/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgIf} from '@angular/common';

import {ViewEncapsulation, ɵɵdefineInjectable, ɵɵdefineInjector} from '../../src/core';
import {createInjector} from '../../src/di/r3_injector';
import {AttributeMarker, markDirty, ɵɵadvance, ɵɵdefineComponent, ɵɵdirectiveInject, ɵɵproperty, ɵɵtemplate} from '../../src/render3/index';
import {ɵɵelement, ɵɵelementEnd, ɵɵelementStart, ɵɵtext, ɵɵtextInterpolate} from '../../src/render3/instructions/all';
import {RenderFlags} from '../../src/render3/interfaces/definition';

import {ComponentFixture, containerEl, createComponent, MockRendererFactory, renderComponent, requestAnimationFrame, toHtml} from './render_util';

describe('component', () => {
  class CounterComponent {
    count = 0;

    increment() {
      this.count++;
    }

    static ɵfac = () => new CounterComponent;
    static ɵcmp = ɵɵdefineComponent({
      type: CounterComponent,
      encapsulation: ViewEncapsulation.None,
      selectors: [['counter']],
      decls: 1,
      vars: 1,
      template:
          function(rf: RenderFlags, ctx: CounterComponent) {
            if (rf & RenderFlags.Create) {
              ɵɵtext(0);
            }
            if (rf & RenderFlags.Update) {
              ɵɵtextInterpolate(ctx.count);
            }
          },
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
      static ɵprov = ɵɵdefineInjectable({
        token: MyService,
        providedIn: 'root',
        factory: () => new MyService('no-injector'),
      });
    }
    class MyComponent {
      constructor(public myService: MyService) {}
      static ɵfac = () => new MyComponent(ɵɵdirectiveInject(MyService));
      static ɵcmp = ɵɵdefineComponent({
        type: MyComponent,
        encapsulation: ViewEncapsulation.None,
        selectors: [['my-component']],
        decls: 1,
        vars: 1,
        template:
            function(fs: RenderFlags, ctx: MyComponent) {
              if (fs & RenderFlags.Create) {
                ɵɵtext(0);
              }
              if (fs & RenderFlags.Update) {
                ɵɵtextInterpolate(ctx.myService.value);
              }
            }
      });
    }

    class MyModule {
      static ɵinj = ɵɵdefineInjector(
          {providers: [{provide: MyService, useValue: new MyService('injector')}]});
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

      static ɵfac = () => new Comp();
      static ɵcmp = ɵɵdefineComponent({
        type: Comp,
        selectors: [['comp']],
        decls: 1,
        vars: 1,
        template:
            (rf: RenderFlags, ctx: Comp) => {
              if (rf & RenderFlags.Create) {
                ɵɵtext(0);
              }
              if (rf & RenderFlags.Update) {
                ɵɵtextInterpolate(ctx.name);
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
        ɵɵadvance(4097);
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

    static ɵfac =
        () => {
          comp = new Comp();
          return comp;
        }

    static ɵcmp = ɵɵdefineComponent({
      type: Comp,
      selectors: [['comp']],
      decls: 3,
      vars: 1,
      dependencies: [NgIf],
      consts: [[AttributeMarker.Template, 'ngIf']],
      /**
       *  <div>Root view</div>
       *  <div *ngIf="visible">Child view</div>
       */
      template:
          function(rf: RenderFlags, ctx: Comp) {
            if (rf & RenderFlags.Create) {
              ɵɵelementStart(0, 'div');
              ɵɵtext(1, 'Root view');
              ɵɵelementEnd();
              ɵɵtemplate(2, MyComponent_div_Template_2, 2, 0, 'div', 0);
            }
            if (rf & RenderFlags.Update) {
              ɵɵadvance(2);
              ɵɵproperty('ngIf', ctx.visible);
            }
          }
    });
  }

  const rendererFactory = new MockRendererFactory(['destroy']);
  const fixture = new ComponentFixture(Comp, {rendererFactory});

  comp!.visible = false;
  fixture.update();

  comp!.visible = true;
  fixture.update();

  const renderer = rendererFactory.lastRenderer!;
  const destroySpy = renderer.spies['destroy'];

  // we should never see `destroy` method being called
  // in case child views are created/removed
  expect(destroySpy.calls.count()).toBe(0);
});
