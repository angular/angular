import { Component, NgModule, Pipe } from "@angular/core";
import * as i0 from "@angular/core";
export class AsyncPipe {
  transform(v) {}
  static ɵfac = function AsyncPipe_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || AsyncPipe)();
  };
  static ɵpipe = /*@__PURE__*/ i0.ɵɵdefinePipe({
    name: "async",
    type: AsyncPipe,
    pure: true,
    standalone: false
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      AsyncPipe,
      [
        {
          type: Pipe,
          args: [
            {
              name: "async",
              standalone: false
            }
          ]
        }
      ],
      null,
      null
    );
})();
// https://github.com/angular/angular/issues/37194
// Verifies that temporary expressions used for expressions with potential side-effects in
// the LHS of a safe navigation access are emitted within the binding expression itself, to
// ensure that these temporaries are evaluated during the evaluation of the binding. This
// is important for when the LHS contains a pipe, as pipe evaluation depends on the current
// binding index.
export class MyComponent {
  myTitle = "hello";
  auth;
  static ɵfac = function MyComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyComponent)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyComponent,
    selectors: [["ng-component"]],
    standalone: false,
    decls: 2,
    vars: 5,
    consts: [[3, "title", "id", "tabindex"]],
    template: function MyComponent_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵelement(0, "button", 0);
        i0.ɵɵpipe(1, "async");
      }
      if (rf & 2) {
        let tmp_1_0;
        i0.ɵɵproperty("title", ctx.myTitle)(
          "id",
          (tmp_1_0 = i0.ɵɵpipeBind1(1, 3, ctx.auth().identity())) == null ? null : tmp_1_0.id
        )("tabindex", 1);
      }
    },
    dependencies: [AsyncPipe],
    encapsulation: 2
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      MyComponent,
      [
        {
          type: Component,
          args: [
            {
              template:
                '<button [title]="myTitle" [id]="(auth().identity() | async)?.id" [tabindex]="1"></button>',
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
    i0.ɵsetClassDebugInfo(MyComponent, {
      className: "MyComponent",
      filePath: "temporary_variables_use_null.ts",
      lineNumber: 21
    });
})();
export class MyMod {
  static ɵfac = function MyMod_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyMod)();
  };
  static ɵmod = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: MyMod });
  static ɵinj = /*@__PURE__*/ i0.ɵɵdefineInjector({});
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      MyMod,
      [
        {
          type: NgModule,
          args: [{ declarations: [MyComponent, AsyncPipe] }]
        }
      ],
      null,
      null
    );
})();
(function () {
  (typeof ngJitMode === "undefined" || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(MyMod, { declarations: [MyComponent, AsyncPipe] });
})();
