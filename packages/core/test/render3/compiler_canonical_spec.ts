/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, Directive, Injectable, NgModule, Optional, TemplateRef, Type} from '../../src/core';
import * as r3 from '../../src/render3/index';

import {containerEl, renderComponent, requestAnimationFrame, toHtml} from './render_util';

/**
 * NORMATIVE => /NORMATIVE: Designates what the compiler is expected to generate.
 *
 * All local variable names are considered non-normative (informative).
 */

describe('compiler specification', () => {
  describe('elements', () => {
    it('should translate DOM structure', () => {
      @Component({
        selector: 'my-component',
        template: `<div class="my-app" title="Hello">Hello <b>World</b>!</div>`
      })
      class MyComponent {
        // NORMATIVE
        static ngComponentDef = r3.defineComponent({
          tag: 'my-component',
          factory: () => new MyComponent(),
          template: function(ctx: MyComponent, cm: boolean) {
            if (cm) {
              r3.E(0, 'div', e0_attrs);
              r3.T(1, 'Hello ');
              r3.E(2, 'b');
              r3.T(3, 'World');
              r3.e();
              r3.T(4, '!');
              r3.e();
            }
          }
        });
        // /NORMATIVE
      }
      // Important: keep arrays outside of function to not create new instances.
      const e0_attrs = ['class', 'my-app', 'title', 'Hello'];

      expect(renderComp(MyComponent))
          .toEqual('<div class="my-app" title="Hello">Hello <b>World</b>!</div>');
    });
  });

  describe('components & directives', () => {
    it('should instantiate directives', () => {
      const log: string[] = [];
      @Component({selector: 'child', template: 'child-view'})
      class ChildComponent {
        constructor() { log.push('ChildComponent'); }
        // NORMATIVE
        static ngComponentDef = r3.defineComponent({
          tag: `child`,
          factory: () => new ChildComponent(),
          template: function(ctx: ChildComponent, cm: boolean) {
            if (cm) {
              r3.T(0, 'child-view');
            }
          }
        });
        // /NORMATIVE
      }

      @Directive({
        selector: 'some-directive',
      })
      class SomeDirective {
        constructor() { log.push('SomeDirective'); }
        // NORMATIVE
        static ngDirectiveDef = r3.defineDirective({
          factory: () => new SomeDirective(),
        });
        // /NORMATIVE
      }

      @Component({selector: 'my-component', template: `<child some-directive></child>!`})
      class MyComponent {
        // NORMATIVE
        static ngComponentDef = r3.defineComponent({
          tag: 'my-component',
          factory: () => new MyComponent(),
          template: function(ctx: MyComponent, cm: boolean) {
            if (cm) {
              r3.E(0, ChildComponent, e0_attrs, e0_dirs);
              r3.e();
              r3.T(3, '!');
            }
            ChildComponent.ngComponentDef.r(1, 0);
            SomeDirective.ngDirectiveDef.r(2, 0);
          }
        });
        // /NORMATIVE
      }
      // Important: keep arrays outside of function to not create new instances.
      // NORMATIVE
      const e0_attrs = ['some-directive', ''];
      const e0_dirs = [SomeDirective];
      // /NORMATIVE

      expect(renderComp(MyComponent)).toEqual('<child some-directive="">child-view</child>!');
      expect(log).toEqual(['ChildComponent', 'SomeDirective']);
    });

    xit('should support structural directives', () => {
      const log: string[] = [];
      @Directive({
        selector: '[if]',
      })
      class IfDirective {
        constructor(template: TemplateRef<any>) { log.push('ifDirective'); }
        // NORMATIVE
        static ngDirectiveDef = r3.defineDirective({
          factory: () => new IfDirective(r3.injectTemplateRef()),
        });
        // /NORMATIVE
      }

      @Component(
          {selector: 'my-component', template: `<ul #foo><li *if>{{salutation}} {{foo}}</li></ul>`})
      class MyComponent {
        salutation = 'Hello';
        // NORMATIVE
        static ngComponentDef = r3.defineComponent({
          tag: 'my-component',
          factory: () => new MyComponent(),
          template: function(ctx: MyComponent, cm: boolean) {
            if (cm) {
              r3.E(0, 'ul', null, null, e0_locals);
              r3.C(2, c1_dirs, C1);
              r3.e();
            }
            let foo = r3.m<any>(1);
            r3.cR(2);
            IfDirective.ngDirectiveDef.r(3, 2);
            r3.cr();

            function C1(ctx1: any, cm: boolean) {
              if (cm) {
                r3.E(0, 'li');
                r3.T(1);
                r3.e();
              }
              r3.t(1, r3.b2('', ctx.salutation, ' ', foo, ''));
            }
          }
        });
        // /NORMATIVE
      }
      // Important: keep arrays outside of function to not create new instances.
      // NORMATIVE
      const e0_locals = ['foo', ''];
      const c1_dirs = [IfDirective];
      // /NORMATIVE

      expect(renderComp(MyComponent)).toEqual('<child some-directive="">child-view</child>!');
      expect(log).toEqual(['ChildComponent', 'SomeDirective']);
    });
  });

  describe('local references', () => {
    // TODO(misko): currently disabled until local refs are working
    xit('should translate DOM structure', () => {
      @Component({selector: 'my-component', template: `<input #user>Hello {{user.value}}!`})
      class MyComponent {
        // NORMATIVE
        static ngComponentDef = r3.defineComponent({
          tag: 'my-component',
          factory: () => new MyComponent,
          template: function(ctx: MyComponent, cm: boolean) {
            if (cm) {
              r3.E(0, 'input', null, null, ['user', '']);
              r3.e();
              r3.T(2);
            }
            const l1_user = r3.m<any>(1);
            r3.t(2, r3.b1('Hello ', l1_user.value, '!'));
          }
        });
        // NORMATIVE
      }

      expect(renderComp(MyComponent))
          .toEqual('<div class="my-app" title="Hello">Hello <b>World</b>!</div>');
    });
  });

});

xdescribe('NgModule', () => {
  interface Injectable {
    scope?: /*InjectorDefType<any>*/ any;
    factory: Function;
  }

  function defineInjectable(opts: Injectable): Injectable {
    // This class should be imported from https://github.com/angular/angular/pull/20850
    return opts;
  }
  function defineInjector(opts: any): any {
    // This class should be imported from https://github.com/angular/angular/pull/20850
    return opts;
  }
  it('should convert module', () => {
    @Injectable()
    class Toast {
      constructor(name: String) {}
      // NORMATIVE
      static ngInjectableDef = defineInjectable({
        factory: () => new Toast(inject(String)),
      });
      // /NORMATIVE
    }

    class CommonModule {
      // NORMATIVE
      static ngInjectorDef = defineInjector({});
      // /NORMATIVE
    }

    @NgModule({
      providers: [Toast, {provide: String, useValue: 'Hello'}],
      imports: [CommonModule],
    })
    class MyModule {
      constructor(toast: Toast) {}
      // NORMATIVE
      static ngInjectorDef = defineInjector({
        factory: () => new MyModule(inject(Toast)),
        provider: [
          {provide: Toast, deps: [String]},  // If Toast has matadata generate this line
          Toast,                             // If toast has not metadata generate this line.
          {provide: String, useValue: 'Hello'}
        ],
        imports: [CommonModule]
      });
      // /NORMATIVE
    }

    @Injectable(/*{MyModule}*/)
    class BurntToast {
      constructor(@Optional() toast: Toast|null, name: String) {}
      // NORMATIVE
      static ngInjectableDef = defineInjectable({
        scope: MyModule,
        factory: () => new BurntToast(inject(Toast, r3.InjectFlags.Optional), inject(String)),
      });
      // /NORMATIVE
    }

  });
});

function renderComp<T>(type: r3.ComponentType<T>): string {
  return toHtml(renderComponent(type));
}
