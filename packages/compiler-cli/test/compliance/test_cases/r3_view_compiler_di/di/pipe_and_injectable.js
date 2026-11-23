import { Component, Injectable, NgModule, Pipe } from "@angular/core";
import * as i0 from "@angular/core";
class Service {
  static ɵfac = function Service_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || Service)();
  };
  static ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({ token: Service, factory: Service.ɵfac });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      Service,
      [
        {
          type: Injectable
        }
      ],
      null,
      null
    );
})();
export class MyPipe {
  constructor(service) {}
  transform(value, ...args) {
    return value;
  }
  static ɵfac = function MyPipe_Factory(__ngFactoryType__) {
    /* @ts-ignore */
    return new (__ngFactoryType__ || MyPipe)(i0.ɵɵdirectiveInject(Service, 16));
  };
  static ɵpipe = /*@__PURE__*/ i0.ɵɵdefinePipe({
    name: "myPipe",
    type: MyPipe,
    pure: true,
    standalone: false
  });
  static ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({ token: MyPipe, factory: MyPipe.ɵfac });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      MyPipe,
      [
        {
          type: Injectable
        },
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
      () => [{ type: Service }],
      null
    );
})();
export class MyOtherPipe {
  constructor(service) {}
  transform(value, ...args) {
    return value;
  }
  static ɵfac = function MyOtherPipe_Factory(__ngFactoryType__) {
    /* @ts-ignore */
    return new (__ngFactoryType__ || MyOtherPipe)(i0.ɵɵdirectiveInject(Service, 16));
  };
  static ɵpipe = /*@__PURE__*/ i0.ɵɵdefinePipe({
    name: "myOtherPipe",
    type: MyOtherPipe,
    pure: true,
    standalone: false
  });
  static ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({
    token: MyOtherPipe,
    factory: MyOtherPipe.ɵfac
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
        },
        {
          type: Injectable
        }
      ],
      () => [{ type: Service }],
      null
    );
})();
export class MyApp {
  static ɵfac = function MyApp_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyApp)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyApp,
    selectors: [["my-app"]],
    standalone: false,
    decls: 3,
    vars: 5,
    template: function MyApp_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵtext(0);
        i0.ɵɵpipe(1, "myPipe");
        i0.ɵɵpipe(2, "myOtherPipe");
      }
      if (rf & 2) {
        i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 3, i0.ɵɵpipeBind1(1, 1, 0)));
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
              template: "{{0 | myPipe | myOtherPipe}}",
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
      filePath: "pipe_and_injectable.ts",
      lineNumber: 35
    });
})();
export class MyModule {
  static ɵfac = function MyModule_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyModule)();
  };
  static ɵmod = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: MyModule });
  static ɵinj = /*@__PURE__*/ i0.ɵɵdefineInjector({ providers: [Service] });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      MyModule,
      [
        {
          type: NgModule,
          args: [{ declarations: [MyPipe, MyOtherPipe, MyApp], providers: [Service] }]
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
