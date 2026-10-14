import { Component, NgModule } from "@angular/core";
import * as i0 from "@angular/core";
function MyComponent_div_0_Template(rf, ctx) {
  if (rf & 1) {
    const _r1 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 1);
    i0.ɵɵlistener("click", function MyComponent_div_0_Template_div_click_0_listener() {
      const ctx_r1 = i0.ɵɵrestoreView(_r1);
      const d_r3 = ctx_r1.$implicit;
      const i_r4 = ctx_r1.index;
      const ctx_r4 = i0.ɵɵnextContext();
      return i0.ɵɵresetView(ctx_r4._handleClick(d_r3, i_r4));
    });
    i0.ɵɵelementEnd();
  }
}
export class MyComponent {
  _data = [1, 2, 3];
  _handleClick(d, i) {}
  static ɵfac = function MyComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyComponent)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyComponent,
    selectors: [["my-component"]],
    standalone: false,
    decls: 1,
    vars: 1,
    consts: [
      [3, "click", 4, "ngFor", "ngForOf"],
      [3, "click"]
    ],
    template: function MyComponent_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵtemplate(0, MyComponent_div_0_Template, 1, 0, "div", 0);
      }
      if (rf & 2) {
        i0.ɵɵproperty("ngForOf", ctx._data);
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
    <div *ngFor="let d of _data; let i = index" (click)="_handleClick(d, i)"></div>
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
      filePath: "nested_template_context_many_bindings.ts",
      lineNumber: 10
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
