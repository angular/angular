import { Component, NgModule } from "@angular/core";
import * as i0 from "@angular/core";
export class MyComponent {
  onClick(v) {}
  static ɵfac = function MyComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyComponent)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyComponent,
    selectors: [["my-component"]],
    standalone: false,
    decls: 4,
    vars: 0,
    consts: [
      ["user", ""],
      [3, "click"]
    ],
    template: function MyComponent_Template(rf, ctx) {
      if (rf & 1) {
        const _r1 = i0.ɵɵgetCurrentView();
        i0.ɵɵelementStart(0, "button", 1);
        i0.ɵɵlistener("click", function MyComponent_Template_button_click_0_listener() {
          i0.ɵɵrestoreView(_r1);
          const user_r2 = i0.ɵɵreference(3);
          return i0.ɵɵresetView(ctx.onClick(user_r2.value));
        });
        i0.ɵɵtext(1, "Save");
        i0.ɵɵelementEnd();
        i0.ɵɵelement(2, "input", null, 0);
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
              selector: "my-component",
              template: `
    <button (click)="onClick(user.value)">Save</button>
    <input #user>
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
      filePath: "local_ref_before_listener.ts",
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
