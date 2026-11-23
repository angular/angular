import { Component, NgModule, Pipe } from "@angular/core";
import * as i0 from "@angular/core";
const _c0 = a0 => [a0, 1, 2, 3, 4];
export class MyPipe {
  transform(value, ...args) {
    return value;
  }
  ngOnDestroy() {}
  static ɵfac = function MyPipe_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyPipe)();
  };
  static ɵpipe = /*@__PURE__*/ i0.ɵɵdefinePipe({
    name: "myPipe",
    type: MyPipe,
    pure: false,
    standalone: false
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      MyPipe,
      [
        {
          type: Pipe,
          args: [
            {
              name: "myPipe",
              pure: false,
              standalone: false
            }
          ]
        }
      ],
      null,
      null
    );
})();
export class MyApp {
  name = "";
  static ɵfac = function MyApp_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyApp)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyApp,
    selectors: [["my-app"]],
    standalone: false,
    decls: 6,
    vars: 27,
    template: function MyApp_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵtext(0);
        i0.ɵɵpipe(1, "myPipe");
        i0.ɵɵpipe(2, "myPipe");
        i0.ɵɵpipe(3, "myPipe");
        i0.ɵɵpipe(4, "myPipe");
        i0.ɵɵpipe(5, "myPipe");
      }
      if (rf & 2) {
        i0.ɵɵtextInterpolate5(
          "0:",
          i0.ɵɵpipeBind1(1, 5, ctx.name),
          "1:",
          i0.ɵɵpipeBind2(2, 7, ctx.name, 1),
          "2:",
          i0.ɵɵpipeBind3(3, 10, ctx.name, 1, 2),
          "3:",
          i0.ɵɵpipeBind4(4, 14, ctx.name, 1, 2, 3),
          "4:",
          i0.ɵɵpipeBindV(5, 19, i0.ɵɵpureFunction1(25, _c0, ctx.name))
        );
      }
    },
    dependencies: [MyPipe],
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
              template:
                "0:{{name | myPipe}}1:{{name | myPipe:1}}2:{{name | myPipe:1:2}}3:{{name | myPipe:1:2:3}}4:{{name | myPipe:1:2:3:4}}",
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
      filePath: "pipe_invocation.ts",
      lineNumber: 19
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
          args: [{ declarations: [MyPipe, MyApp] }]
        }
      ],
      null,
      null
    );
})();
(function () {
  (typeof ngJitMode === "undefined" || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(MyModule, { declarations: [MyPipe, MyApp] });
})();
