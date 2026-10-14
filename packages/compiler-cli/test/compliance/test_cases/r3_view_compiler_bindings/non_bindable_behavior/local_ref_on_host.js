import { Component, NgModule } from "@angular/core";
import * as i0 from "@angular/core";
export class MyComponent {
  name = "John Doe";
  static ɵfac = function MyComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyComponent)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyComponent,
    selectors: [["my-app"]],
    standalone: false,
    decls: 5,
    vars: 1,
    consts: [
      ["myRef", ""],
      ["id", "my-id"]
    ],
    template: function MyComponent_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵelementStart(0, "b", 1, 0);
        i0.ɵɵdisableBindings();
        i0.ɵɵelementStart(2, "i");
        i0.ɵɵtext(3, "Hello {{ name }}!");
        i0.ɵɵelementEnd();
        i0.ɵɵenableBindings();
        i0.ɵɵelementEnd();
        i0.ɵɵtext(4);
      }
      if (rf & 2) {
        const myRef_r1 = i0.ɵɵreference(1);
        i0.ɵɵadvance(4);
        i0.ɵɵtextInterpolate1(" ", myRef_r1.id, " ");
      }
    },
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
              selector: "my-app",
              template: `
    <b ngNonBindable #myRef id="my-id">
    <i>Hello {{ name }}!</i>
    </b>
    {{ myRef.id }}
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
    i0.ɵsetClassDebugInfo(MyComponent, {
      className: "MyComponent",
      filePath: "local_ref_on_host.ts",
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
          args: [{ declarations: [MyComponent] }]
        }
      ],
      null,
      null
    );
})();
(function () {
  (typeof ngJitMode === "undefined" || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(MyModule, { declarations: [MyComponent] });
})();
