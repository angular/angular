/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ChangeDetectionStrategy, ChangeDetectorRef, Component, ContentChild, ContentChildren, Directive, HostBinding, HostListener, Injectable, Input, NgModule, OnDestroy, Optional, Pipe, PipeTransform, QueryList, SimpleChanges, TemplateRef, ViewChild, ViewChildren, ViewContainerRef} from '../../../src/core';
import * as $r3$ from '../../../src/core_render3_private_export';
import {renderComponent, toHtml} from '../render_util';

/// See: `normative.md`
describe('injection', () => {
  type $boolean$ = boolean;

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
        tag: 'my-comp',
        factory: function MyComp_Factory() { return new MyComp($r3$.ɵinjectChangeDetectorRef()); },
        template: function MyComp_Template(ctx: $MyComp$, cm: $boolean$) {
          if (cm) {
            $r3$.ɵT(0);
          }
          $r3$.ɵt(0, $r3$.ɵb(ctx.value));
        }
      });
      // /NORMATIVE
    }

    class MyApp {
      static ngComponentDef = $r3$.ɵdefineComponent({
        type: MyApp,
        tag: 'my-app',
        factory: function MyApp_Factory() { return new MyApp(); },
        /** <my-comp></my-comp> */
        template: function MyApp_Template(ctx: $MyApp$, cm: $boolean$) {
          if (cm) {
            $r3$.ɵE(0, MyComp);
            $r3$.ɵe();
          }
          MyComp.ngComponentDef.h(1, 0);
          $r3$.ɵr(1, 0);
        }
      });
    }

    const app = renderComponent(MyApp);
    // ChangeDetectorRef is the token, ViewRef is historically the constructor
    expect(toHtml(app)).toEqual('<my-comp>ViewRef</my-comp>');
  });

});