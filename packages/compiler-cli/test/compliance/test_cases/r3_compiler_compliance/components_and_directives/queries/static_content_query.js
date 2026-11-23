import { Component, ContentChild, ElementRef, NgModule } from "@angular/core";
import { SomeDirective } from "./some.directive";
import * as i0 from "@angular/core";
const _c0 = ["foo"];
const _c1 = ["*"];
export class ContentQueryComponent {
  someDir;
  foo;
  static ɵfac = function ContentQueryComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || ContentQueryComponent)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: ContentQueryComponent,
    selectors: [["content-query-component"]],
    contentQueries: function ContentQueryComponent_ContentQueries(rf, ctx, dirIndex) {
      if (rf & 1) {
        i0.ɵɵcontentQuery(dirIndex, SomeDirective, 7)(dirIndex, _c0, 5);
      }
      if (rf & 2) {
        let _t;
        i0.ɵɵqueryRefresh((_t = i0.ɵɵloadQuery())) && (ctx.someDir = _t.first);
        i0.ɵɵqueryRefresh((_t = i0.ɵɵloadQuery())) && (ctx.foo = _t.first);
      }
    },
    standalone: false,
    ngContentSelectors: _c1,
    decls: 2,
    vars: 0,
    template: function ContentQueryComponent_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵprojectionDef();
        i0.ɵɵelementStart(0, "div");
        i0.ɵɵprojection(1);
        i0.ɵɵelementEnd();
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
    <div><ng-content></ng-content></div>
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
            type: ContentChild,
            args: [SomeDirective, { static: true }]
          }
        ],
        foo: [
          {
            type: ContentChild,
            args: ["foo"]
          }
        ]
      }
    );
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassDebugInfo(ContentQueryComponent, {
      className: "ContentQueryComponent",
      filePath: "static_content_query.ts",
      lineNumber: 12
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
    decls: 2,
    vars: 0,
    consts: [["someDir", ""]],
    template: function MyApp_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵelementStart(0, "content-query-component");
        i0.ɵɵelement(1, "div", 0);
        i0.ɵɵelementEnd();
      }
    },
    dependencies: () => [SomeDirective, ContentQueryComponent],
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
    <content-query-component>
      <div someDir></div>
    </content-query-component>
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
      filePath: "static_content_query.ts",
      lineNumber: 26
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
          args: [{ declarations: [SomeDirective, ContentQueryComponent, MyApp] }]
        }
      ],
      null,
      null
    );
})();
(function () {
  (typeof ngJitMode === "undefined" || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(MyModule, {
      declarations: [SomeDirective, ContentQueryComponent, MyApp]
    });
})();
