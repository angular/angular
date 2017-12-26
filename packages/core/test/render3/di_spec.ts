/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ElementRef, TemplateRef, ViewContainerRef} from '@angular/core';

import {bloomAdd, bloomFindPossibleInjector} from '../../src/render3/di';
import {C, D, E, PublicFeature, T, V, b, b2, c, cR, cr, defineDirective, e, inject, injectElementRef, injectTemplateRef, injectViewContainerRef, t, v} from '../../src/render3/index';
import {createLNode, createViewState, enterView, getOrCreateNodeInjector, leaveView} from '../../src/render3/instructions';
import {LNodeFlags, LNodeInjector} from '../../src/render3/interfaces';

import {renderToHtml} from './render_util';

describe('di', () => {
  describe('no dependencies', () => {
    it('should create directive with no deps', () => {
      class Directive {
        value: string = 'Created';
      }
      const DirectiveDef = defineDirective({type: Directive, factory: () => new Directive});

      function Template(ctx: any, cm: boolean) {
        if (cm) {
          E(0, 'div');
          {
            D(1, DirectiveDef.n(), DirectiveDef);
            T(2);
          }
          e();
        }
        t(2, b(D<Directive>(1).value));
      }

      expect(renderToHtml(Template, {})).toEqual('<div>Created</div>');
    });
  });

  describe('view dependencies', () => {
    it('should create directive with inter view dependencies', () => {
      class DirectiveA {
        value: string = 'A';
      }
      const DirectiveADef = defineDirective(
          {type: DirectiveA, factory: () => new DirectiveA, features: [PublicFeature]});

      class DirectiveB {
        value: string = 'B';
      }
      const DirectiveBDef = defineDirective(
          {type: DirectiveB, factory: () => new DirectiveB, features: [PublicFeature]});

      class DirectiveC {
        value: string;
        constructor(a: DirectiveA, b: DirectiveB) { this.value = a.value + b.value; }
      }
      const DirectiveCDef = defineDirective({
        type: DirectiveC,
        factory: () => new DirectiveC(inject(DirectiveA), inject(DirectiveB))
      });

      function Template(ctx: any, cm: boolean) {
        if (cm) {
          E(0, 'div');
          {
            D(1, DirectiveADef.n(), DirectiveADef);
            E(2, 'span');
            {
              D(3, DirectiveBDef.n(), DirectiveBDef);
              D(4, DirectiveCDef.n(), DirectiveCDef);
              T(5);
            }
            e();
          }
          e();
        }
        t(5, b(D<DirectiveC>(4).value));
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
      }
      const DirectiveDef = defineDirective({
        type: Directive,
        factory: () => new Directive(injectElementRef()),
        features: [PublicFeature]
      });

      class DirectiveSameInstance {
        value: boolean;
        constructor(elementRef: ElementRef, directive: Directive) {
          this.value = elementRef === directive.elementRef;
        }
      }
      const DirectiveSameInstanceDef = defineDirective({
        type: DirectiveSameInstance,
        factory: () => new DirectiveSameInstance(injectElementRef(), inject(Directive))
      });

      function Template(ctx: any, cm: boolean) {
        if (cm) {
          E(0, 'div');
          {
            D(1, DirectiveDef.n(), DirectiveDef);
            D(2, DirectiveSameInstanceDef.n(), DirectiveSameInstanceDef);
            T(3);
          }
          e();
        }
        t(3, b2('', D<Directive>(1).value, '-', D<DirectiveSameInstance>(2).value, ''));
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
      }
      const DirectiveDef = defineDirective({
        type: Directive,
        factory: () => new Directive(injectTemplateRef()),
        features: [PublicFeature]
      });

      class DirectiveSameInstance {
        value: boolean;
        constructor(templateRef: TemplateRef<any>, directive: Directive) {
          this.value = templateRef === directive.templateRef;
        }
      }
      const DirectiveSameInstanceDef = defineDirective({
        type: DirectiveSameInstance,
        factory: () => new DirectiveSameInstance(injectTemplateRef(), inject(Directive))
      });


      function Template(ctx: any, cm: any) {
        if (cm) {
          C(0, function() {});
          {
            D(1, DirectiveDef.n(), DirectiveDef);
            D(2, DirectiveSameInstanceDef.n(), DirectiveSameInstanceDef);
          }
          c();
          T(3);
        }
        t(3, b2('', D<Directive>(1).value, '-', D<DirectiveSameInstance>(2).value, ''));
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
      }
      const DirectiveDef = defineDirective({
        type: Directive,
        factory: () => new Directive(injectViewContainerRef()),
        features: [PublicFeature]
      });

      class DirectiveSameInstance {
        value: boolean;
        constructor(viewContainerRef: ViewContainerRef, directive: Directive) {
          this.value = viewContainerRef === directive.viewContainerRef;
        }
      }
      const DirectiveSameInstanceDef = defineDirective({
        type: DirectiveSameInstance,
        factory: () => new DirectiveSameInstance(injectViewContainerRef(), inject(Directive))
      });

      function Template(ctx: any, cm: boolean) {
        if (cm) {
          E(0, 'div');
          {
            D(1, DirectiveDef.n(), DirectiveDef);
            D(2, DirectiveSameInstanceDef.n(), DirectiveSameInstanceDef);
            T(3);
          }
          e();
        }
        t(3, b2('', D<Directive>(1).value, '-', D<DirectiveSameInstance>(2).value, ''));
      }

      expect(renderToHtml(Template, {})).toEqual('<div>ViewContainerRef-true</div>');
    });
  });

  describe('inject', () => {
    describe('bloom filter', () => {
      let di: LNodeInjector;
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

    it('should inject from parent view', () => {
      class ParentDirective {}
      const ParentDirectiveDef = defineDirective(
          {type: ParentDirective, factory: () => new ParentDirective(), features: [PublicFeature]});

      class ChildDirective {
        value: string;
        constructor(public parent: ParentDirective) {
          this.value = (parent.constructor as any).name;
        }
      }
      const ChildDirectiveDef = defineDirective({
        type: ChildDirective,
        factory: () => new ChildDirective(inject(ParentDirective)),
        features: [PublicFeature]
      });

      class Child2Directive {
        value: boolean;
        constructor(parent: ParentDirective, child: ChildDirective) {
          this.value = parent === child.parent;
        }
      }
      const Child2DirectiveDef = defineDirective({
        type: Child2Directive,
        factory: () => new Child2Directive(inject(ParentDirective), inject(ChildDirective))
      });

      function Template(ctx: any, cm: boolean) {
        if (cm) {
          E(0, 'div');
          {
            D(1, ParentDirectiveDef.n(), ParentDirectiveDef);
            C(2);
            c();
          }
          e();
        }
        cR(2);
        {
          if (V(0)) {
            E(0, 'span');
            {
              D(1, ChildDirectiveDef.n(), ChildDirectiveDef);
              D(2, Child2DirectiveDef.n(), Child2DirectiveDef);
              T(3);
            }
            e();
          }
          t(3, b2('', D<ChildDirective>(1).value, '-', D<Child2Directive>(2).value, ''));
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
      const contentView = createViewState(-1, null !, []);
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
