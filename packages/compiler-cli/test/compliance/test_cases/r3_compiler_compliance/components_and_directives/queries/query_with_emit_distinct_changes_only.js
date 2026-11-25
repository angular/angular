import { Component, ContentChildren, NgModule, QueryList, ViewChildren } from "@angular/core";
import { SomeDirective } from "./some.directive";
import * as i0 from "@angular/core";
const _c0 = ["myRef"];
export class ContentQueryComponent {
  myRefs;
  oldMyRefs;
  someDirs;
  oldSomeDirs;
  static ɵfac = function ContentQueryComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || ContentQueryComponent)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: ContentQueryComponent,
    selectors: [["content-query-component"]],
    contentQueries: function ContentQueryComponent_ContentQueries(rf, ctx, dirIndex) {
      if (rf & 1) {
        i0.ɵɵcontentQuery(dirIndex, _c0, 4)(dirIndex, _c0, 0);
      }
      if (rf & 2) {
        let _t;
        i0.ɵɵqueryRefresh((_t = i0.ɵɵloadQuery())) && (ctx.myRefs = _t);
        i0.ɵɵqueryRefresh((_t = i0.ɵɵloadQuery())) && (ctx.oldMyRefs = _t);
      }
    },
    viewQuery: function ContentQueryComponent_Query(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵviewQuery(SomeDirective, 5)(SomeDirective, 1);
      }
      if (rf & 2) {
        let _t;
        i0.ɵɵqueryRefresh((_t = i0.ɵɵloadQuery())) && (ctx.someDirs = _t);
        i0.ɵɵqueryRefresh((_t = i0.ɵɵloadQuery())) && (ctx.oldSomeDirs = _t);
      }
    },
    standalone: false,
    decls: 3,
    vars: 0,
    consts: [
      ["myRef", ""],
      ["someDir", ""]
    ],
    template: function ContentQueryComponent_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵelement(0, "div", 1)(1, "div", null, 0);
      }
    },
    encapsulation: 2
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      ContentQueryComponent,
      [
        {
          type: Component,
          args: [
            {
              selector: "content-query-component",
              template: `
    <div someDir></div>
    <div #myRef></div>
  `,
              standalone: false
            }
          ]
        }
      ],
      null,
      {
        myRefs: [
          {
            type: ContentChildren,
            args: ["myRef", { emitDistinctChangesOnly: true }]
          }
        ],
        oldMyRefs: [
          {
            type: ContentChildren,
            args: ["myRef", { emitDistinctChangesOnly: false }]
          }
        ],
        someDirs: [
          {
            type: ViewChildren,
            args: [SomeDirective, { emitDistinctChangesOnly: true }]
          }
        ],
        oldSomeDirs: [
          {
            type: ViewChildren,
            args: [SomeDirective, { emitDistinctChangesOnly: false }]
          }
        ]
      }
    );
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassDebugInfo(ContentQueryComponent, {
      className: "ContentQueryComponent",
      filePath: "query_with_emit_distinct_changes_only.ts",
      lineNumber: 13
    });
})();
export class MyModule {
  static ɵfac = function MyModule_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyModule)();
  };
  static ɵmod = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: MyModule });
  static ɵinj = /*@__PURE__*/ i0.ɵɵdefineInjector({});
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      MyModule,
      [
        {
          type: NgModule,
          args: [{ declarations: [ContentQueryComponent] }]
        }
      ],
      null,
      null
    );
})();
(function () {
  (typeof ngJitMode === "undefined" || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(MyModule, { declarations: [ContentQueryComponent] });
})();
