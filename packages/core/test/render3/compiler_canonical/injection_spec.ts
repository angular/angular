/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Attribute, ChangeDetectorRef, Component, INJECTOR, Inject, InjectFlags, Injectable, Injector, SkipSelf, defineInjectable, inject} from '../../../src/core';
import * as $r3$ from '../../../src/core_render3_private_export';
import {renderComponent, toHtml} from '../render_util';



/// See: `normative.md`
describe('injection', () => {
  type $RenderFlags$ = $r3$.ɵRenderFlags;

  describe('directives', () => {
    // Directives (and Components) should use `directiveInject`
    it('should inject ChangeDetectorRef', () => {
      type $MyComp$ = MyComp;
      type $MyApp$ = MyApp;

      @Component({selector: 'my-comp', template: `{{ value }}`})
      class MyComp {
        value: string;
        constructor(public cdr: ChangeDetectorRef) { this.value = (cdr.constructor as any).name; }

        // NORMATIVE
        static ngComponentDef = $r3$.ɵdefineComponent({
          type: MyComp,
          selectors: [['my-comp']],
          factory: function MyComp_Factory() {
            return new MyComp($r3$.ɵdirectiveInject(ChangeDetectorRef as any));
          },
          consts: 1,
          vars: 1,
          template: function MyComp_Template(rf: $RenderFlags$, ctx: $MyComp$) {
            if (rf & 1) {
              $r3$.ɵtext(0);
            }
            if (rf & 2) {
              $r3$.ɵtextBinding(0, $r3$.ɵbind(ctx.value));
            }
          }
        });
        // /NORMATIVE
      }

      class MyApp {
        static ngComponentDef = $r3$.ɵdefineComponent({
          type: MyApp,
          selectors: [['my-app']],
          factory: function MyApp_Factory() { return new MyApp(); },
          consts: 1,
          vars: 0,
          /** <my-comp></my-comp> */
          template: function MyApp_Template(rf: $RenderFlags$, ctx: $MyApp$) {
            if (rf & 1) {
              $r3$.ɵelement(0, 'my-comp');
            }
          },
          directives: () => [MyComp]
        });
      }


      const app = renderComponent(MyApp);
      // ChangeDetectorRef is the token, ViewRef is historically the constructor
      expect(toHtml(app)).toEqual('<my-comp>ViewRef</my-comp>');
    });

    it('should inject attributes', () => {
      type $MyComp$ = MyComp;
      type $MyApp$ = MyApp;

      @Component({selector: 'my-comp', template: `{{ title }}`})
      class MyComp {
        constructor(@Attribute('title') public title: string|undefined) {}

        // NORMATIVE
        static ngComponentDef = $r3$.ɵdefineComponent({
          type: MyComp,
          selectors: [['my-comp']],
          factory: function MyComp_Factory() { return new MyComp($r3$.ɵinjectAttribute('title')); },
          consts: 1,
          vars: 1,
          template: function MyComp_Template(rf: $RenderFlags$, ctx: $MyComp$) {
            if (rf & 1) {
              $r3$.ɵtext(0);
            }
            if (rf & 2) {
              $r3$.ɵtextBinding(0, $r3$.ɵbind(ctx.title));
            }
          }
        });
        // /NORMATIVE
      }

      class MyApp {
        static ngComponentDef = $r3$.ɵdefineComponent({
          type: MyApp,
          selectors: [['my-app']],
          factory: function MyApp_Factory() { return new MyApp(); },
          consts: 1,
          vars: 0,
          /** <my-comp></my-comp> */
          template: function MyApp_Template(rf: $RenderFlags$, ctx: $MyApp$) {
            if (rf & 1) {
              $r3$.ɵelement(0, 'my-comp', e0_attrs);
            }
          },
          directives: () => [MyComp]
        });
      }
      const e0_attrs = ['title', 'WORKS'];
      const app = renderComponent(MyApp);
      // ChangeDetectorRef is the token, ViewRef is historically the constructor
      expect(toHtml(app)).toEqual('<my-comp title="WORKS">WORKS</my-comp>');
    });

    // TODO(misko): enable once `providers` and `viewProvdires` are implemented.
    xit('should inject into an injectable', () => {
      type $MyApp$ = MyApp;

      @Injectable()
      class ServiceA {
        // NORMATIVE
        static ngInjectableDef = defineInjectable({
          factory: function ServiceA_Factory() { return new ServiceA(); },
        });
        // /NORMATIVE
      }

      @Injectable()
      class ServiceB {
        // NORMATIVE
        static ngInjectableDef = defineInjectable({
          factory: function ServiceA_Factory() { return new ServiceB(); },
        });
        // /NORMATIVE
      }

      @Component({
        template: '',
        providers: [ServiceA],
        viewProviders: [ServiceB],
      })
      class MyApp {
        constructor(serviceA: ServiceA, serviceB: ServiceB, injector: Injector) {}

        static ngComponentDef = $r3$.ɵdefineComponent({
          type: MyApp,
          selectors: [['my-app']],
          factory: function MyApp_Factory() {
            return new MyApp(
                $r3$.ɵdirectiveInject(ServiceA), $r3$.ɵdirectiveInject(ServiceB), inject(INJECTOR));
          },
          consts: 0,
          vars: 0,
          template: function MyApp_Template(rf: $RenderFlags$, ctx: $MyApp$) {},
          providers: [ServiceA],
          viewProviders: [ServiceB],
        });
      }
      const e0_attrs = ['title', 'WORKS'];
      const app = renderComponent(MyApp);
      // ChangeDetectorRef is the token, ViewRef is historically the constructor
      expect(toHtml(app)).toEqual('<my-comp title="WORKS">WORKS</my-comp>');
    });
  });

  describe('services', () => {
    // Services should use `inject`
    @Injectable()
    class ServiceA {
      constructor(@Inject(String) name: String, injector: Injector) {}

      // NORMATIVE
      static ngInjectableDef = defineInjectable({
        factory: function ServiceA_Factory() {
          return new ServiceA(inject(String), inject(INJECTOR));
        },
      });
      // /NORMATIVE
    }

    @Injectable()
    class ServiceB {
      constructor(serviceA: ServiceA, @SkipSelf() injector: Injector) {}
      // NORMATIVE
      static ngInjectableDef = defineInjectable({
        factory: function ServiceA_Factory() {
          return new ServiceB(inject(ServiceA), inject(INJECTOR, InjectFlags.SkipSelf) !);
        },
      });
      // /NORMATIVE
    }

  });

});
