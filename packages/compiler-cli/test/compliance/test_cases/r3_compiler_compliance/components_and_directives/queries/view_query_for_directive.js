import { Component, NgModule, QueryList, ViewChild, ViewChildren } from "@angular/core";
import { SomeDirective } from "./some.directive";
import * as i0 from "@angular/core";
export class ViewQueryComponent {
  someDir;
  someDirs;
  static ɵfac = function ViewQueryComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || ViewQueryComponent)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: ViewQueryComponent,
    selectors: [["view-query-component"]],
    viewQuery: function ViewQueryComponent_Query(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵviewQuery(SomeDirective, 5)(SomeDirective, 5);
      }
      if (rf & 2) {
        let _t;
        i0.ɵɵqueryRefresh((_t = i0.ɵɵloadQuery())) && (ctx.someDir = _t.first);
        i0.ɵɵqueryRefresh((_t = i0.ɵɵloadQuery())) && (ctx.someDirs = _t);
      }
    },
    standalone: false,
    decls: 1,
    vars: 0,
    consts: [["someDir", ""]],
    template: function ViewQueryComponent_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵelement(0, "div", 0);
      }
    },
    dependencies: () => [SomeDirective],
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
    <div someDir></div>
  `,
              standalone: false
            }
          ]
        }
      ],
      null,
      {
        someDir: [
          {
            type: ViewChild,
            args: [SomeDirective]
          }
        ],
        someDirs: [
          {
            type: ViewChildren,
            args: [SomeDirective]
          }
        ]
      }
    );
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassDebugInfo(ViewQueryComponent, {
      className: "ViewQueryComponent",
      filePath: "view_query_for_directive.ts",
      lineNumber: 12
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
          args: [{ declarations: [SomeDirective, ViewQueryComponent] }]
        }
      ],
      null,
      null
    );
})();
(function () {
  (typeof ngJitMode === "undefined" || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(MyModule, { declarations: [SomeDirective, ViewQueryComponent] });
})();
