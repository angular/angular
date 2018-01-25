/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, Directive, Injectable, Input, NgModule, Optional, SimpleChanges, TemplateRef, Type, ViewContainerRef} from '../../src/core';
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
          type: MyComponent,
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
          type: ChildComponent,
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
          type: SomeDirective,
          factory: () => new SomeDirective(),
        });
        // /NORMATIVE
      }

      @Component({selector: 'my-component', template: `<child some-directive></child>!`})
      class MyComponent {
        // NORMATIVE
        static ngComponentDef = r3.defineComponent({
          type: MyComponent,
          tag: 'my-component',
          factory: () => new MyComponent(),
          template: function(ctx: MyComponent, cm: boolean) {
            if (cm) {
              r3.E(0, ChildComponent, e0_attrs, e0_dirs);
              r3.e();
              r3.T(3, '!');
            }
            r3.r(1, 0);
            r3.r(2, 0);
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
          type: IfDirective,
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
          type: MyComponent,
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
            r3.r(3, 2);
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

    it('should support content projection', () => {
      @Component({selector: 'simple', template: `<div><ng-content></ng-content></div>`})
      class SimpleComponent {
        static ngComponentDef = r3.defineComponent({
          type: SimpleComponent,
          tag: 'simple',
          factory: () => new SimpleComponent(),
          template: function(ctx: SimpleComponent, cm: boolean) {
            if (cm) {
              r3.pD(0);
              r3.E(0, 'div');
              r3.P(2, 0);
              r3.e();
            }
          }
        });
      }

      @Component({
        selector: 'complex',
        template: `
        <div id="first"><ng-content select="span[title=toFirst]"></ng-content></div>
        <div id="second"><ng-content select="span[title=toSecond]"></ng-content></div>`
      })
      class ComplexComponent {
        static ngComponentDef = r3.defineComponent({
          type: ComplexComponent,
          tag: 'complex',
          factory: () => new ComplexComponent(),
          template: function(ctx: ComplexComponent, cm: boolean) {
            if (cm) {
              r3.pD(0, pD_0);
              r3.E(1, 'div', ['id', 'first']);
              r3.P(2, 0, 1);
              r3.e();
              r3.E(3, 'div', ['id', 'second']);
              r3.P(4, 0, 2);
              r3.e();
            }
          }
        });
      }
      const pD_0: r3.CssSelector[] =
          [[[['span', 'title', 'toFirst'], null]], [[['span', 'title', 'toSecond'], null]]];

      @Component({
        selector: 'my-app',
        template: `<simple>content</simple>
        <complex></complex>`
      })
      class MyApp {
        static ngComponentDef = r3.defineComponent({
          type: MyApp,
          tag: 'my-app',
          factory: () => new MyApp(),
          template: function(ctx: MyApp, cm: boolean) {
            if (cm) {
              r3.E(0, SimpleComponent);
              r3.T(2, 'content');
              r3.e();
            }
          }
        });
      }
    });
  });

  describe('local references', () => {
    // TODO(misko): currently disabled until local refs are working
    xit('should translate DOM structure', () => {
      @Component({selector: 'my-component', template: `<input #user>Hello {{user.value}}!`})
      class MyComponent {
        // NORMATIVE
        static ngComponentDef = r3.defineComponent({
          type: MyComponent,
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

  describe('template variables', () => {

    interface ForOfContext {
      $implicit: any;
      index: number;
      even: boolean;
      odd: boolean;
    }

    @Directive({selector: '[forOf]'})
    class ForOfDirective {
      private previous: any[];

      constructor(private view: ViewContainerRef, private template: TemplateRef<any>) {}

      @Input() forOf: any[];

      ngOnChanges(simpleChanges: SimpleChanges) {
        if ('forOf' in simpleChanges) {
          this.update();
        }
      }

      ngDoCheck(): void {
        const previous = this.previous;
        const current = this.forOf;
        if (!previous || previous.length != current.length ||
            previous.some((value: any, index: number) => current[index] !== previous[index])) {
          this.update();
        }
      }

      private update() {
        // TODO(chuckj): Not implemented yet
        // this.view.clear();
        if (this.forOf) {
          const current = this.forOf;
          for (let i = 0; i < current.length; i++) {
            const context = {$implicit: current[i], index: i, even: i % 2 == 0, odd: i % 2 == 1};
            // TODO(chuckj): Not implemented yet
            // this.view.createEmbeddedView(this.template, context);
          }
          this.previous = [...this.forOf];
        }
      }

      // NORMATIVE
      static ngDirectiveDef = r3.defineDirective({
        type: ForOfDirective,
        factory: function ForOfDirective_Factory() {
          return new ForOfDirective(r3.injectViewContainerRef(), r3.injectTemplateRef());
        },
        // TODO(chuckj): Enable when ngForOf enabling lands.
        // features: [NgOnChangesFeature(NgForOf)],
        inputs: {forOf: 'forOf'}
      });
      // /NORMATIVE
    }

    it('should support a let variable and reference', () => {
      interface Item {
        name: string;
      }

      const c1_dirs = [ForOfDirective];

      @Component({
        selector: 'my-component',
        template: `<ul><li *for="let item of items">{{item.name}}</li></ul>`
      })
      class MyComponent {
        items = [{name: 'one'}, {name: 'two'}];

        // NORMATIVE
        static ngComponentDef = r3.defineComponent({
          type: MyComponent,
          tag: 'my-component',
          factory: function MyComponent_Factory() { return new MyComponent(); },
          template: function MyComponentTemplate(ctx: MyComponent, cm: boolean) {
            if (cm) {
              r3.E(0, 'ul');
              r3.C(1, c1_dirs, MyComponent_ForOfDirective_Template_1);
              r3.e();
            }
            r3.p(1, 'forOf', r3.b(ctx.items));
            r3.cR(1);
            r3.r(2, 1);
            r3.cr();

            function MyComponent_ForOfDirective_Template_1(ctx1: any, cm: boolean) {
              if (cm) {
                r3.E(0, 'li');
                r3.T(1);
                r3.e();
              }
              const l0_item = ctx1.$implicit;
              r3.t(1, r3.b1('', l0_item.name, ''));
            }
          }
        });
        // /NORMATIVE
      }

      // TODO(chuckj): update when the changes to enable ngForOf lands.
      expect(renderComp(MyComponent)).toEqual('<ul></ul>');
    });

    it('should support accessing parent template variables', () => {
      interface Info {
        description: string;
      }
      interface Item {
        name: string;
        infos: Info[];
      }

      const c1_dirs = [ForOfDirective];

      @Component({
        selector: 'my-component',
        template: `
          <ul>
            <li *for="let item of items">
              <div>{{item.name}}</div>
              <ul>
                <li *for="let info of item.infos">
                  {{item.name}}: {{info.description}}
                </li>
              </ui>
            </li>
          </ul>`
      })
      class MyComponent {
        items: Item[] = [
          {name: 'one', infos: [{description: '11'}, {description: '12'}]},
          {name: 'two', infos: [{description: '21'}, {description: '22'}]}
        ];

        // NORMATIVE
        static ngComponentDef = r3.defineComponent({
          type: MyComponent,
          tag: 'my-component',
          factory: function MyComponent_Factory() { return new MyComponent(); },
          template: function MyComponent_Template(ctx: MyComponent, cm: boolean) {
            if (cm) {
              r3.E(0, 'ul');
              r3.C(1, c1_dirs, MyComponent_ForOfDirective_Template_1);
              r3.e();
            }
            r3.p(1, 'forOf', r3.b(ctx.items));
            r3.cR(1);
            r3.r(2, 1);
            r3.cr();

            function MyComponent_ForOfDirective_Template_1(ctx1: any, cm: boolean) {
              if (cm) {
                r3.E(0, 'div');
                r3.T(1);
                r3.e();
                r3.E(2, 'ul');
                r3.C(3, c1_dirs, MyComponent_ForOfDirective_ForOfDirective_Template_3);
                r3.e();
              }
              const l0_item = ctx1.$implicit;
              r3.t(1, r3.b1('', l0_item.name, ''));
              r3.p(4, 'forOf', r3.b(ctx.items));
              r3.cR(3);
              r3.r(4, 3);
              r3.cr();

              function MyComponent_ForOfDirective_ForOfDirective_Template_3(
                  ctx2: any, cm: boolean) {
                if (cm) {
                  r3.E(0, 'li');
                  r3.T(1);
                  r3.e();
                }
                const l0_info = ctx2.info;
                r3.t(1, r3.b2('', l0_item.name, ': ', l0_info.description, ''));
              }
            }
          }
        });
        // /NORMATIVE
      }
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
          {provide: Toast, deps: [String]},  // If Toast has metadata generate this line
          Toast,                             // If Toast has no metadata generate this line.
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
