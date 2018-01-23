/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ElementRef, TemplateRef, ViewContainerRef} from '@angular/core';

import {defineComponent} from '../../src/render3/definition';
import {InjectFlags, bloomAdd, bloomFindPossibleInjector, getOrCreateNodeInjector} from '../../src/render3/di';
import {C, E, PublicFeature, T, V, b, b2, cR, cr, defineDirective, e, inject, injectElementRef, injectTemplateRef, injectViewContainerRef, m, t, v} from '../../src/render3/index';
import {createLNode, createLView, createTView, enterView, leaveView} from '../../src/render3/instructions';
import {LInjector} from '../../src/render3/interfaces/injector';
import {LNodeFlags} from '../../src/render3/interfaces/node';

import {renderComponent, renderToHtml} from './render_util';

describe('di', () => {
  describe('no dependencies', () => {
    it('should create directive with no deps', () => {
      class Directive {
        value: string = 'Created';
        static ngDirectiveDef = defineDirective({type: Directive, factory: () => new Directive});
      }

      function Template(ctx: any, cm: boolean) {
        if (cm) {
          E(0, 'div', null, [Directive]);
          { T(2); }
          e();
        }
        t(2, b(m<Directive>(1).value));
      }

      expect(renderToHtml(Template, {})).toEqual('<div>Created</div>');
    });
  });

  describe('view dependencies', () => {
    it('should create directive with inter view dependencies', () => {
      class DirectiveA {
        value: string = 'A';
        static ngDirectiveDef = defineDirective(
            {type: DirectiveA, factory: () => new DirectiveA, features: [PublicFeature]});
      }

      class DirectiveB {
        value: string = 'B';
        static ngDirectiveDef = defineDirective(
            {type: DirectiveB, factory: () => new DirectiveB, features: [PublicFeature]});
      }

      class DirectiveC {
        value: string;
        constructor(a: DirectiveA, b: DirectiveB) { this.value = a.value + b.value; }
        static ngDirectiveDef = defineDirective({
          type: DirectiveC,
          factory: () => new DirectiveC(inject(DirectiveA), inject(DirectiveB))
        });
      }

      function Template(ctx: any, cm: boolean) {
        if (cm) {
          E(0, 'div', null, [DirectiveA]);
          {
            E(2, 'span', null, [DirectiveB, DirectiveC]);
            { T(5); }
            e();
          }
          e();
        }
        t(5, b(m<DirectiveC>(4).value));
      }

      expect(renderToHtml(Template, {})).toEqual('<div><span>AB</span></div>');
    });
  });

  describe('ElementRef', () => {
    it('should create directive with ElementRef dependencies', () => {
      class Directive {
        value: string;
        constructor(public elementRef: ElementRef) {
          this.value = (elementRef.constructor as any).name;
        }
        static ngDirectiveDef = defineDirective({
          type: Directive,
          factory: () => new Directive(injectElementRef()),
          features: [PublicFeature]
        });
      }

      class DirectiveSameInstance {
        value: boolean;
        constructor(elementRef: ElementRef, directive: Directive) {
          this.value = elementRef === directive.elementRef;
        }
        static ngDirectiveDef = defineDirective({
          type: DirectiveSameInstance,
          factory: () => new DirectiveSameInstance(injectElementRef(), inject(Directive))
        });
      }

      function Template(ctx: any, cm: boolean) {
        if (cm) {
          E(0, 'div', null, [Directive, DirectiveSameInstance]);
          { T(3); }
          e();
        }
        t(3, b2('', m<Directive>(1).value, '-', m<DirectiveSameInstance>(2).value, ''));
      }

      expect(renderToHtml(Template, {})).toEqual('<div>ElementRef-true</div>');
    });
  });

  describe('TemplateRef', () => {
    it('should create directive with TemplateRef dependencies', () => {
      class Directive {
        value: string;
        constructor(public templateRef: TemplateRef<any>) {
          this.value = (templateRef.constructor as any).name;
        }
        static ngDirectiveDef = defineDirective({
          type: Directive,
          factory: () => new Directive(injectTemplateRef()),
          features: [PublicFeature]
        });
      }

      class DirectiveSameInstance {
        value: boolean;
        constructor(templateRef: TemplateRef<any>, directive: Directive) {
          this.value = templateRef === directive.templateRef;
        }
        static ngDirectiveDef = defineDirective({
          type: DirectiveSameInstance,
          factory: () => new DirectiveSameInstance(injectTemplateRef(), inject(Directive))
        });
      }


      function Template(ctx: any, cm: any) {
        if (cm) {
          C(0, [Directive, DirectiveSameInstance], function() {});
          T(3);
        }
        t(3, b2('', m<Directive>(1).value, '-', m<DirectiveSameInstance>(2).value, ''));
      }

      expect(renderToHtml(Template, {})).toEqual('TemplateRef-true');
    });
  });

  describe('ViewContainerRef', () => {
    it('should create directive with ViewContainerRef dependencies', () => {
      class Directive {
        value: string;
        constructor(public viewContainerRef: ViewContainerRef) {
          this.value = (viewContainerRef.constructor as any).name;
        }
        static ngDirectiveDef = defineDirective({
          type: Directive,
          factory: () => new Directive(injectViewContainerRef()),
          features: [PublicFeature]
        });
      }

      class DirectiveSameInstance {
        value: boolean;
        constructor(viewContainerRef: ViewContainerRef, directive: Directive) {
          this.value = viewContainerRef === directive.viewContainerRef;
        }
        static ngDirectiveDef = defineDirective({
          type: DirectiveSameInstance,
          factory: () => new DirectiveSameInstance(injectViewContainerRef(), inject(Directive))
        });
      }

      function Template(ctx: any, cm: boolean) {
        if (cm) {
          E(0, 'div', null, [Directive, DirectiveSameInstance]);
          { T(3); }
          e();
        }
        t(3, b2('', m<Directive>(1).value, '-', m<DirectiveSameInstance>(2).value, ''));
      }

      expect(renderToHtml(Template, {})).toEqual('<div>ViewContainerRef-true</div>');
    });
  });

  describe('inject', () => {
    describe('bloom filter', () => {
      let di: LInjector;
      beforeEach(() => {
        di = {} as any;
        di.bf0 = 0;
        di.bf1 = 0;
        di.bf2 = 0;
        di.bf3 = 0;
        di.cbf0 = 0;
        di.cbf1 = 0;
        di.cbf2 = 0;
        di.cbf3 = 0;
      });

      function bloomState() { return [di.bf3, di.bf2, di.bf1, di.bf0]; }

      it('should add values', () => {
        bloomAdd(di, { __NG_ELEMENT_ID__: 0 } as any);
        expect(bloomState()).toEqual([0, 0, 0, 1]);
        bloomAdd(di, { __NG_ELEMENT_ID__: 32 + 1 } as any);
        expect(bloomState()).toEqual([0, 0, 2, 1]);
        bloomAdd(di, { __NG_ELEMENT_ID__: 64 + 2 } as any);
        expect(bloomState()).toEqual([0, 4, 2, 1]);
        bloomAdd(di, { __NG_ELEMENT_ID__: 96 + 3 } as any);
        expect(bloomState()).toEqual([8, 4, 2, 1]);
      });

      it('should query values', () => {
        bloomAdd(di, { __NG_ELEMENT_ID__: 0 } as any);
        bloomAdd(di, { __NG_ELEMENT_ID__: 32 } as any);
        bloomAdd(di, { __NG_ELEMENT_ID__: 64 } as any);
        bloomAdd(di, { __NG_ELEMENT_ID__: 96 } as any);

        expect(bloomFindPossibleInjector(di, 0)).toEqual(di);
        expect(bloomFindPossibleInjector(di, 1)).toEqual(null);
        expect(bloomFindPossibleInjector(di, 32)).toEqual(di);
        expect(bloomFindPossibleInjector(di, 64)).toEqual(di);
        expect(bloomFindPossibleInjector(di, 96)).toEqual(di);
      });
    });

    describe('flags', () => {
      it('should return defaultValue not found', () => {
        class MyApp {
          constructor(public value: string) {}

          static ngComponentDef = defineComponent({
            type: MyApp,
            tag: 'my-app',
            factory: () => new MyApp(inject(String as any, InjectFlags.Default, 'DefaultValue')),
            template: () => null
          });
        }
        const myApp = renderComponent(MyApp);
        expect(myApp.value).toEqual('DefaultValue');
      });
    });

    it('should inject from parent view', () => {
      class ParentDirective {
        static ngDirectiveDef = defineDirective({
          type: ParentDirective,
          factory: () => new ParentDirective(),
          features: [PublicFeature]
        });
      }

      class ChildDirective {
        value: string;
        constructor(public parent: ParentDirective) {
          this.value = (parent.constructor as any).name;
        }
        static ngDirectiveDef = defineDirective({
          type: ChildDirective,
          factory: () => new ChildDirective(inject(ParentDirective)),
          features: [PublicFeature]
        });
      }

      class Child2Directive {
        value: boolean;
        constructor(parent: ParentDirective, child: ChildDirective) {
          this.value = parent === child.parent;
        }
        static ngDirectiveDef = defineDirective({
          type: Child2Directive,
          factory: () => new Child2Directive(inject(ParentDirective), inject(ChildDirective))
        });
      }

      function Template(ctx: any, cm: boolean) {
        if (cm) {
          E(0, 'div', null, [ParentDirective]);
          { C(2); }
          e();
        }
        cR(2);
        {
          if (V(0)) {
            E(0, 'span', null, [ChildDirective, Child2Directive]);
            { T(3); }
            e();
          }
          t(3, b2('', m<ChildDirective>(1).value, '-', m<Child2Directive>(2).value, ''));
          v();
        }
        cr();
      }

      expect(renderToHtml(Template, {})).toEqual('<div><span>ParentDirective-true</span></div>');
    });

    it('should inject from module Injector', () => {

                                             });
  });

  describe('getOrCreateNodeInjector', () => {
    it('should handle initial undefined state', () => {
      const contentView = createLView(-1, null !, createTView());
      const oldView = enterView(contentView, null !);
      try {
        const parent = createLNode(0, LNodeFlags.Element, null, null);

        // Simulate the situation where the previous parent is not initialized.
        // This happens on first bootstrap because we don't init existing values
        // so that we have smaller HelloWorld.
        (parent as{parent: any}).parent = undefined;

        const injector = getOrCreateNodeInjector();
        expect(injector).not.toBe(null);
      } finally {
        leaveView(oldView);
      }
    });
  });

});
