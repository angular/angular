import { Component, NgModule, QueryList, ViewChild, ViewChildren } from "@angular/core";
import * as i0 from "@angular/core";
const _c0 = ["myRef"];
const _c1 = ["myRef1", "myRef2", "myRef3"];
export class ViewQueryComponent {
  myRef;
  myRefs;
  static ɵfac = function ViewQueryComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || ViewQueryComponent)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: ViewQueryComponent,
    selectors: [["view-query-component"]],
    viewQuery: function ViewQueryComponent_Query(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵviewQuery(_c0, 5)(_c1, 5);
      }
      if (rf & 2) {
        let _t;
        i0.ɵɵqueryRefresh((_t = i0.ɵɵloadQuery())) && (ctx.myRef = _t.first);
        i0.ɵɵqueryRefresh((_t = i0.ɵɵloadQuery())) && (ctx.myRefs = _t);
      }
    },
    standalone: false,
    decls: 4,
    vars: 0,
    consts: [
      ["myRef", ""],
      ["myRef1", ""]
    ],
    template: function ViewQueryComponent_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵelement(0, "div", null, 0)(2, "div", null, 1);
      }
    },
    encapsulation: 2
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      ViewQueryComponent,
      [
        {
          type: Component,
          args: [
            {
              selector: "view-query-component",
              template: `
    <div #myRef></div>
    <div #myRef1></div>
  `,
              standalone: false
            }
          ]
        }
      ],
      null,
      {
        myRef: [
          {
            type: ViewChild,
            args: ["myRef"]
          }
        ],
        myRefs: [
          {
            type: ViewChildren,
            args: ["myRef1, myRef2, myRef3"]
          }
        ]
      }
    );
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassDebugInfo(ViewQueryComponent, {
      className: "ViewQueryComponent",
      filePath: "view_query_for_local_ref.ts",
      lineNumber: 11
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
          args: [{ declarations: [ViewQueryComponent] }]
        }
      ],
      null,
      null
    );
})();
(function () {
  (typeof ngJitMode === "undefined" || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(MyModule, { declarations: [ViewQueryComponent] });
})();
