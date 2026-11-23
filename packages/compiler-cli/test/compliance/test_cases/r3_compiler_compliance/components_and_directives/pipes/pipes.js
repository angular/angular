import { Component, NgModule, Pipe } from "@angular/core";
import * as i0 from "@angular/core";
const _c0 = a0 => [a0, 1, 2, 3, 4, 5];
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
export class MyPurePipe {
  transform(value, ...args) {
    return value;
  }
  static ɵfac = function MyPurePipe_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyPurePipe)();
  };
  static ɵpipe = /*@__PURE__*/ i0.ɵɵdefinePipe({
    name: "myPurePipe",
    type: MyPurePipe,
    pure: true,
    standalone: false
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      MyPurePipe,
      [
        {
          type: Pipe,
          args: [
            {
              name: "myPurePipe",
              pure: true,
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
  name = "World";
  size = 0;
  static ɵfac = function MyApp_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyApp)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyApp,
    selectors: [["my-app"]],
    standalone: false,
    decls: 7,
    vars: 20,
    template: function MyApp_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵtext(0);
        i0.ɵɵpipe(1, "myPipe");
        i0.ɵɵpipe(2, "myPurePipe");
        i0.ɵɵelementStart(3, "p");
        i0.ɵɵtext(4);
        i0.ɵɵpipe(5, "myPipe");
        i0.ɵɵpipe(6, "myPipe");
        i0.ɵɵelementEnd();
      }
      if (rf & 2) {
        i0.ɵɵtextInterpolate(
          i0.ɵɵpipeBind2(2, 6, i0.ɵɵpipeBind2(1, 3, ctx.name, ctx.size), ctx.size)
        );
        i0.ɵɵadvance(4);
        i0.ɵɵtextInterpolate2(
          "",
          i0.ɵɵpipeBindV(5, 9, i0.ɵɵpureFunction1(18, _c0, ctx.name)),
          " ",
          ctx.name ? 1 : i0.ɵɵpipeBind1(6, 16, 2)
        );
      }
    },
    dependencies: [MyPipe, MyPurePipe],
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
                "{{name | myPipe:size | myPurePipe:size }}<p>{{ name | myPipe:1:2:3:4:5 }} {{ name ? 1 : 2 | myPipe }}</p>",
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
    i0.ɵsetClassDebugInfo(MyApp, { className: "MyApp", filePath: "pipes.ts", lineNumber: 30 });
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
          args: [{ declarations: [MyPipe, MyPurePipe, MyApp] }]
        }
      ],
      null,
      null
    );
})();
(function () {
  (typeof ngJitMode === "undefined" || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(MyModule, { declarations: [MyPipe, MyPurePipe, MyApp] });
})();
