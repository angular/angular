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
describe('queries', () => {
  type $boolean$ = boolean;
  type $number$ = number;
  let someDir: SomeDirective;

  @Directive({
    selector: '[someDir]',
  })
  class SomeDirective {
    static ngDirectiveDef = $r3$.ɵdefineDirective({
      type: SomeDirective,
      factory: function SomeDirective_Factory() { return someDir = new SomeDirective(); },
      features: [$r3$.ɵPublicFeature]
    });
  }

  it('should support view queries', () => {
    type $ViewQueryComponent$ = ViewQueryComponent;

    // NORMATIVE
    const $e1_attrs$ = ['someDir', ''];
    const $e1_dirs$ = [SomeDirective];
    // /NORMATIVE

    @Component({
      selector: 'view-query-component',
      template: `
      <div someDir></div>
    `
    })
    class ViewQueryComponent {
      @ViewChild(SomeDirective) someDir: SomeDirective;
      @ViewChildren(SomeDirective) someDirList: QueryList<SomeDirective>;

      // NORMATIVE
      static ngComponentDef = $r3$.ɵdefineComponent({
        type: ViewQueryComponent,
        tag: 'view-query-component',
        factory: function ViewQueryComponent_Factory() { return new ViewQueryComponent(); },
        template: function ViewQueryComponent_Template(ctx: $ViewQueryComponent$, cm: $boolean$) {
          let $tmp$: any;
          if (cm) {
            $r3$.ɵQ(0, SomeDirective, false);
            $r3$.ɵQ(1, SomeDirective, false);
            $r3$.ɵE(2, 'div', $e1_attrs$, $e1_dirs$);
            $r3$.ɵe();
          }

          $r3$.ɵqR($tmp$ = $r3$.ɵld<QueryList<any>>(0)) && (ctx.someDir = $tmp$.first);
          $r3$.ɵqR($tmp$ = $r3$.ɵld<QueryList<any>>(1)) &&
              (ctx.someDirList = $tmp$ as QueryList<any>);
          SomeDirective.ngDirectiveDef.h(3, 2);
          $r3$.ɵr(3, 2);
        }
      });
      // /NORMATIVE
    }


    const viewQueryComp = renderComponent(ViewQueryComponent);
    expect(viewQueryComp.someDir).toEqual(someDir);
    expect((viewQueryComp.someDirList as QueryList<SomeDirective>).toArray()).toEqual([someDir !]);
  });

  it('should support content queries', () => {
    type $MyApp$ = MyApp;
    type $ContentQueryComponent$ = ContentQueryComponent;

    let contentQueryComp: ContentQueryComponent;

    @Component({
      selector: 'content-query-component',
      template: `
        <div><ng-content></ng-content></div>
      `
    })
    class ContentQueryComponent {
      @ContentChild(SomeDirective) someDir: SomeDirective;
      @ContentChildren(SomeDirective) someDirList: QueryList<SomeDirective>;

      // NORMATIVE
      static ngComponentDef = $r3$.ɵdefineComponent({
        type: ContentQueryComponent,
        tag: 'content-query-component',
        factory: function ContentQueryComponent_Factory() {
          return [
            new ContentQueryComponent(), $r3$.ɵQ(null, SomeDirective, false),
            $r3$.ɵQ(null, SomeDirective, false)
          ];
        },
        hostBindings: function ContentQueryComponent_HostBindings(
            dirIndex: $number$, elIndex: $number$) {
          let $tmp$: any;
          const $instance$ = $r3$.ɵld<any[]>(dirIndex)[0];
          $r3$.ɵqR($tmp$ = $r3$.ɵld<any[]>(dirIndex)[1]) && ($instance$.someDir = $tmp$.first);
          $r3$.ɵqR($tmp$ = $r3$.ɵld<any[]>(dirIndex)[2]) && ($instance$.someDirList = $tmp$);
        },
        template: function ContentQueryComponent_Template(
            ctx: $ContentQueryComponent$, cm: $boolean$) {
          if (cm) {
            $r3$.ɵpD(0);
            $r3$.ɵE(1, 'div');
            $r3$.ɵP(2, 0);
            $r3$.ɵe();
          }
        }
      });
      // /NORMATIVE
    }

    const $e2_attrs$ = ['someDir', ''];
    const $e2_dirs$ = [SomeDirective];

    @Component({
      selector: 'my-app',
      template: `
        <content-query-component>
          <div someDir></div>
        </content-query-component>
      `
    })
    class MyApp {
      // NON-NORMATIVE
      static ngComponentDef = $r3$.ɵdefineComponent({
        type: MyApp,
        tag: 'my-app',
        factory: function MyApp_Factory() { return new MyApp(); },
        template: function MyApp_Template(ctx: $MyApp$, cm: $boolean$) {
          if (cm) {
            $r3$.ɵE(0, ContentQueryComponent);
            contentQueryComp = $r3$.ɵld<any[]>(1)[0];
            $r3$.ɵE(2, 'div', $e2_attrs$, $e2_dirs$);
            $r3$.ɵe();
            $r3$.ɵe();
          }
          ContentQueryComponent.ngComponentDef.h(1, 0);
          SomeDirective.ngDirectiveDef.h(3, 2);
          $r3$.ɵr(1, 0);
          $r3$.ɵr(3, 2);
        }
      });
      // /NON-NORMATIVE
    }


    expect(toHtml(renderComponent(MyApp)))
        .toEqual(
            `<content-query-component><div><div somedir=""></div></div></content-query-component>`);
    expect(contentQueryComp !.someDir).toEqual(someDir !);
    expect((contentQueryComp !.someDirList as QueryList<SomeDirective>).toArray()).toEqual([
      someDir !
    ]);
  });

});
