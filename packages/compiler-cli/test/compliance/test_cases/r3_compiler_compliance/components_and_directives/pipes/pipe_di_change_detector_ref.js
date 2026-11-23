import { ChangeDetectorRef, Component, NgModule, Optional, Pipe } from "@angular/core";
import * as i0 from "@angular/core";
export class MyPipe {
  constructor(changeDetectorRef) {}
  transform(value, ...args) {
    return value;
  }
  static ɵfac = function MyPipe_Factory(__ngFactoryType__) {
    /* @ts-ignore */
    return new (__ngFactoryType__ || MyPipe)(i0.ɵɵdirectiveInject(i0.ChangeDetectorRef, 16));
  };
  static ɵpipe = /*@__PURE__*/ i0.ɵɵdefinePipe({
    name: "myPipe",
    type: MyPipe,
    pure: true,
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
              standalone: false
            }
          ]
        }
      ],
      () => [{ type: i0.ChangeDetectorRef }],
      null
    );
})();
export class MyOtherPipe {
  constructor(changeDetectorRef) {}
  transform(value, ...args) {
    return value;
  }
  static ɵfac = function MyOtherPipe_Factory(__ngFactoryType__) {
    /* @ts-ignore */
    return new (__ngFactoryType__ || MyOtherPipe)(i0.ɵɵdirectiveInject(i0.ChangeDetectorRef, 24));
  };
  static ɵpipe = /*@__PURE__*/ i0.ɵɵdefinePipe({
    name: "myOtherPipe",
    type: MyOtherPipe,
    pure: true,
    standalone: false
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      MyOtherPipe,
      [
        {
          type: Pipe,
          args: [
            {
              name: "myOtherPipe",
              standalone: false
            }
          ]
        }
      ],
      () => [
        {
          type: i0.ChangeDetectorRef,
          decorators: [
            {
              type: Optional
            }
          ]
        }
      ],
      null
    );
})();
export class MyApp {
  name = "World";
  static ɵfac = function MyApp_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyApp)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyApp,
    selectors: [["my-app"]],
    standalone: false,
    decls: 5,
    vars: 6,
    template: function MyApp_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵtext(0);
        i0.ɵɵpipe(1, "myPipe");
        i0.ɵɵelementStart(2, "p");
        i0.ɵɵtext(3);
        i0.ɵɵpipe(4, "myOtherPipe");
        i0.ɵɵelementEnd();
      }
      if (rf & 2) {
        i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(1, 2, ctx.name));
        i0.ɵɵadvance(3);
        i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(4, 4, ctx.name));
      }
    },
    dependencies: [MyPipe, MyOtherPipe],
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
              template: "{{name | myPipe }}<p>{{ name | myOtherPipe }}</p>",
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
      filePath: "pipe_di_change_detector_ref.ts",
      lineNumber: 31
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
          args: [{ declarations: [MyPipe, MyOtherPipe, MyApp] }]
        }
      ],
      null,
      null
    );
})();
(function () {
  (typeof ngJitMode === "undefined" || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(MyModule, { declarations: [MyPipe, MyOtherPipe, MyApp] });
})();
