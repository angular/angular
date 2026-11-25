import {
  Component,
  Directive,
  forwardRef,
  NgModule,
  QueryList,
  ViewChild,
  ViewChildren
} from "@angular/core";
import * as i0 from "@angular/core";
export class ViewQueryComponent {
  someDir;
  someDirList;
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
        i0.ɵɵqueryRefresh((_t = i0.ɵɵloadQuery())) && (ctx.someDirList = _t);
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
            args: [forwardRef(() => SomeDirective)]
          }
        ],
        someDirList: [
          {
            type: ViewChildren,
            args: [forwardRef(() => SomeDirective)]
          }
        ]
      }
    );
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassDebugInfo(ViewQueryComponent, {
      className: "ViewQueryComponent",
      filePath: "view_query_forward_ref.ts",
      lineNumber: 10
    });
})();
export class MyApp {
  static ɵfac = function MyApp_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyApp)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyApp,
    selectors: [["my-app"]],
    standalone: false,
    decls: 1,
    vars: 0,
    template: function MyApp_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵelement(0, "view-query-component");
      }
    },
    dependencies: [ViewQueryComponent],
    encapsulation: 2
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      MyApp,
      [
        {
          type: Component,
          args: [
            {
              selector: "my-app",
              template: `
    <view-query-component></view-query-component>
  `,
              standalone: false
            }
          ]
        }
      ],
      null,
      null
    );
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassDebugInfo(MyApp, {
      className: "MyApp",
      filePath: "view_query_forward_ref.ts",
      lineNumber: 22
    });
})();
export class SomeDirective {
  static ɵfac = function SomeDirective_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || SomeDirective)();
  };
  static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: SomeDirective,
    selectors: [["", "someDir", ""]],
    standalone: false
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      SomeDirective,
      [
        {
          type: Directive,
          args: [
            {
              selector: "[someDir]",
              standalone: false
            }
          ]
        }
      ],
      null,
      null
    );
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
          args: [{ declarations: [SomeDirective, ViewQueryComponent, MyApp] }]
        }
      ],
      null,
      null
    );
})();
(function () {
  (typeof ngJitMode === "undefined" || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(MyModule, { declarations: [SomeDirective, ViewQueryComponent, MyApp] });
})();
