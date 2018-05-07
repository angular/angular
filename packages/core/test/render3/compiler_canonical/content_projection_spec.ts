/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ChangeDetectionStrategy, ChangeDetectorRef, Component, ContentChild, ContentChildren, Directive, HostBinding, HostListener, Injectable, Input, NgModule, OnDestroy, Optional, Pipe, PipeTransform, QueryList, SimpleChanges, TemplateRef, ViewChild, ViewChildren, ViewContainerRef} from '../../../src/core';
import * as $r3$ from '../../../src/core_render3_private_export';

/// See: `normative.md`
describe('content projection', () => {
  type $RenderFlags$ = $r3$.ɵRenderFlags;

  it('should support content projection', () => {
    type $SimpleComponent$ = SimpleComponent;
    type $ComplexComponent$ = ComplexComponent;
    type $MyApp$ = MyApp;

    @Component({selector: 'simple', template: `<div><ng-content></ng-content></div>`})
    class SimpleComponent {
      // NORMATIVE
      static ngComponentDef = $r3$.ɵdefineComponent({
        type: SimpleComponent,
        selectors: [['simple']],
        factory: () => new SimpleComponent(),
        template: function(rf: $RenderFlags$, ctx: $SimpleComponent$) {
          if (rf & 1) {
            $r3$.ɵpD(0);
            $r3$.ɵE(1, 'div');
            $r3$.ɵP(2, 0);
            $r3$.ɵe();
          }
        }
      });
      // /NORMATIVE
    }

    // NORMATIVE
    const $pD_0P$: $r3$.ɵCssSelectorList[] =
        [[['span', 'title', 'toFirst']], [['span', 'title', 'toSecond']]];
    const $pD_0R$: string[] = ['span[title=toFirst]', 'span[title=toSecond]'];
    // /NORMATIVE

    @Component({
      selector: 'complex',
      template: `
      <div id="first"><ng-content select="span[title=toFirst]"></ng-content></div>
      <div id="second"><ng-content select="span[title=toSecond]"></ng-content></div>`
    })
    class ComplexComponent {
      // NORMATIVE
      static ngComponentDef = $r3$.ɵdefineComponent({
        type: ComplexComponent,
        selectors: [['complex']],
        factory: () => new ComplexComponent(),
        template: function(rf: $RenderFlags$, ctx: $ComplexComponent$) {
          if (rf & 1) {
            $r3$.ɵpD(0, $pD_0P$, $pD_0R$);
            $r3$.ɵE(1, 'div', ['id', 'first']);
            $r3$.ɵP(2, 0, 1);
            $r3$.ɵe();
            $r3$.ɵE(3, 'div', ['id', 'second']);
            $r3$.ɵP(4, 0, 2);
            $r3$.ɵe();
          }
        }
      });
      // /NORMATIVE
    }

    @Component({
      selector: 'my-app',
      template: `<simple>content</simple>
      <complex></complex>`
    })
    class MyApp {
      static ngComponentDef = $r3$.ɵdefineComponent({
        type: MyApp,
        selectors: [['my-app']],
        factory: () => new MyApp(),
        template: function(rf: $RenderFlags$, ctx: $MyApp$) {
          if (rf & 1) {
            $r3$.ɵE(0, 'simple');
            $r3$.ɵT(1, 'content');
            $r3$.ɵe();
          }
        },
        directives: () => [SimpleComponent]
      });
    }
  });

});
