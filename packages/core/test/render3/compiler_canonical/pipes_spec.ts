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
xdescribe('pipes', () => {
  type $MyApp$ = MyApp;
  type $boolean$ = boolean;

  @Pipe({
    name: 'myPipe',
    pure: false,
  })
  class MyPipe implements PipeTransform,
      OnDestroy {
    transform(value: any, ...args: any[]) { throw new Error('Method not implemented.'); }
    ngOnDestroy(): void { throw new Error('Method not implemented.'); }

    // NORMATIVE
    static ngPipeDef = $r3$.ɵdefinePipe({
      type: MyPipe,
      factory: function MyPipe_Factory() { return new MyPipe(); },
      pure: false,
    });
    // /NORMATIVE
  }

  @Pipe({
    name: 'myPurePipe',
  })
  class MyPurePipe implements PipeTransform {
    transform(value: any, ...args: any[]) { throw new Error('Method not implemented.'); }

    // NORMATIVE
    static ngPipeDef = $r3$.ɵdefinePipe({
      type: MyPurePipe,
      factory: function MyPurePipe_Factory() { return new MyPurePipe(); },
    });
    // /NORMATIVE
  }

  // NORMATIVE
  const $MyPurePipe_ngPipeDef$ = MyPurePipe.ngPipeDef;
  const $MyPipe_ngPipeDef$ = MyPipe.ngPipeDef;
  // /NORMATIVE

  @Component({template: `{{name | myPipe:size | myPurePipe:size }}`})
  class MyApp {
    name = 'World';
    size = 0;

    // NORMATIVE
    static ngComponentDef = $r3$.ɵdefineComponent({
      type: MyApp,
      tag: 'my-app',
      factory: function MyApp_Factory() { return new MyApp(); },
      template: function MyApp_Template(ctx: $MyApp$, cm: $boolean$) {
        if (cm) {
          $r3$.ɵT(0);
          $r3$.ɵPp(1, $MyPurePipe_ngPipeDef$, $MyPurePipe_ngPipeDef$.n());
          $r3$.ɵPp(2, $MyPipe_ngPipeDef$, $MyPipe_ngPipeDef$.n());
        }
        $r3$.ɵt(2, $r3$.ɵi1('', $r3$.ɵpb2(1, $r3$.ɵpb2(2, ctx.name, ctx.size), ctx.size), ''));
      }
    });
    // /NORMATIVE
  }

  it('should render pipes', () => {
                                // TODO(misko): write a test once pipes runtime is implemented.
                            });
});
