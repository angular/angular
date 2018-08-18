/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ChangeDetectionStrategy, ChangeDetectorRef, Component, ContentChild, ContentChildren, Directive, HostBinding, HostListener, Injectable, Input, NgModule, OnDestroy, Optional, Pipe, PipeTransform, QueryList, SimpleChanges, TemplateRef, ViewChild, ViewChildren, ViewContainerRef} from '../../../src/core';
import * as $r3$ from '../../../src/core_render3_private_export';
import {ComponentDefInternal} from '../../../src/render3/interfaces/definition';
import {renderComponent, toHtml} from '../render_util';


/// See: `normative.md`
describe('queries', () => {
  type $RenderFlags$ = $r3$.ɵRenderFlags;
  type $number$ = number;
  let someDir: SomeDirective;

  @Directive({
    selector: '[someDir]',
  })
  class SomeDirective {
    static ngDirectiveDef = $r3$.ɵdefineDirective({
      type: SomeDirective,
      selectors: [['', 'someDir', '']],
      factory: function SomeDirective_Factory() { return someDir = new SomeDirective(); },
      features: [$r3$.ɵPublicFeature]
    });
  }

  it('should support view queries', () => {
    type $ViewQueryComponent$ = ViewQueryComponent;

    // NORMATIVE
    const $e1_attrs$ = ['someDir', ''];
    // /NORMATIVE

    @Component({
      selector: 'view-query-component',
      template: `
      <div someDir></div>
    `
    })
    class ViewQueryComponent {
      // TODO(issue/24571): remove '!'.
      @ViewChild(SomeDirective) someDir !: SomeDirective;
      // TODO(issue/24571): remove '!'.
      @ViewChildren(SomeDirective) someDirList !: QueryList<SomeDirective>;

      // NORMATIVE
      static ngComponentDef = $r3$.ɵdefineComponent({
        type: ViewQueryComponent,
        selectors: [['view-query-component']],
        factory: function ViewQueryComponent_Factory() { return new ViewQueryComponent(); },
        consts: 3,
        vars: 0,
        template: function ViewQueryComponent_Template(
            rf: $RenderFlags$, ctx: $ViewQueryComponent$) {
          if (rf & 1) {
            $r3$.ɵelement(2, 'div', $e1_attrs$);
          }
        },
        viewQuery: function ViewQueryComponent_Query(rf: $RenderFlags$, ctx: $ViewQueryComponent$) {
          if (rf & 1) {
            $r3$.ɵquery(0, SomeDirective, false);
            $r3$.ɵquery(1, SomeDirective, false);
          }
          if (rf & 2) {
            let $tmp$: any;
            $r3$.ɵqueryRefresh($tmp$ = $r3$.ɵload<QueryList<any>>(0)) &&
                (ctx.someDir = $tmp$.first);
            $r3$.ɵqueryRefresh($tmp$ = $r3$.ɵload<QueryList<any>>(1)) &&
                (ctx.someDirList = $tmp$ as QueryList<any>);
          }
        }
      });
      // /NORMATIVE
    }

    // NON-NORMATIVE
    (ViewQueryComponent.ngComponentDef as ComponentDefInternal<any>).directiveDefs =
        [SomeDirective.ngDirectiveDef];
    // /NON-NORMATIVE

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
      // TODO(issue/24571): remove '!'.
      @ContentChild(SomeDirective) someDir !: SomeDirective;
      // TODO(issue/24571): remove '!'.
      @ContentChildren(SomeDirective) someDirList !: QueryList<SomeDirective>;

      // NORMATIVE
      static ngComponentDef = $r3$.ɵdefineComponent({
        type: ContentQueryComponent,
        selectors: [['content-query-component']],
        factory: function ContentQueryComponent_Factory() { return new ContentQueryComponent(); },
        consts: 2,
        vars: 0,
        contentQueries: function ContentQueryComponent_ContentQueries() {
          $r3$.ɵregisterContentQuery($r3$.ɵquery(null, SomeDirective, false));
          $r3$.ɵregisterContentQuery($r3$.ɵquery(null, SomeDirective, false));
        },
        contentQueriesRefresh: function ContentQueryComponent_ContentQueriesRefresh(
            dirIndex: $number$, queryStartIndex: $number$) {
          let $tmp$: any;
          const $instance$ = $r3$.ɵloadDirective<ContentQueryComponent>(dirIndex);
          $r3$.ɵqueryRefresh($tmp$ = $r3$.ɵloadQueryList<any>(queryStartIndex)) &&
              ($instance$.someDir = $tmp$.first);
          $r3$.ɵqueryRefresh($tmp$ = $r3$.ɵloadQueryList<any>(queryStartIndex + 1)) &&
              ($instance$.someDirList = $tmp$);
        },
        template: function ContentQueryComponent_Template(
            rf: $number$, ctx: $ContentQueryComponent$) {
          if (rf & 1) {
            $r3$.ɵprojectionDef();
            $r3$.ɵelementStart(0, 'div');
            $r3$.ɵprojection(1);
            $r3$.ɵelementEnd();
          }
        }
      });
      // /NORMATIVE
    }

    const $e2_attrs$ = ['someDir', ''];

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
        selectors: [['my-app']],
        factory: function MyApp_Factory() { return new MyApp(); },
        consts: 2,
        vars: 0,
        template: function MyApp_Template(rf: $RenderFlags$, ctx: $MyApp$) {
          if (rf & 1) {
            $r3$.ɵelementStart(0, 'content-query-component');
            contentQueryComp = $r3$.ɵloadDirective<ContentQueryComponent>(0);
            $r3$.ɵelement(1, 'div', $e2_attrs$);
            $r3$.ɵelementEnd();
          }
        }
      });
      // /NON-NORMATIVE
    }

    // NON-NORMATIVE
    (MyApp.ngComponentDef as ComponentDefInternal<any>).directiveDefs =
        [ContentQueryComponent.ngComponentDef, SomeDirective.ngDirectiveDef];
    // /NON-NORMATIVE

    expect(toHtml(renderComponent(MyApp)))
        .toEqual(
            `<content-query-component><div><div somedir=""></div></div></content-query-component>`);
    expect(contentQueryComp !.someDir).toEqual(someDir !);
    expect((contentQueryComp !.someDirList as QueryList<SomeDirective>).toArray()).toEqual([
      someDir !
    ]);
  });

});
