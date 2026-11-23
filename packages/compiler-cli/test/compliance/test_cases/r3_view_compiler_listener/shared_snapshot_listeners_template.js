import { Component, NgModule } from "@angular/core";
import * as i0 from "@angular/core";
function MyComponent_div_0_Template(rf, ctx) {
  if (rf & 1) {
    const _r1 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div")(1, "div", 1);
    i0.ɵɵlistener("click", function MyComponent_div_0_Template_div_click_1_listener() {
      i0.ɵɵrestoreView(_r1);
      const ctx_r1 = i0.ɵɵnextContext();
      return i0.ɵɵresetView(ctx_r1.onClick(1));
    });
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(2, "button", 1);
    i0.ɵɵlistener("click", function MyComponent_div_0_Template_button_click_2_listener() {
      i0.ɵɵrestoreView(_r1);
      const ctx_r1 = i0.ɵɵnextContext();
      return i0.ɵɵresetView(ctx_r1.onClick2(2));
    });
    i0.ɵɵelementEnd()();
  }
}
export class MyComponent {
  onClick(name) {}
  onClick2(name) {}
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
      [4, "ngIf"],
      [3, "click"]
    ],
    template: function MyComponent_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵtemplate(0, MyComponent_div_0_Template, 3, 0, "div", 0);
      }
      if (rf & 2) {
        i0.ɵɵproperty("ngIf", ctx.showing);
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
    <div *ngIf="showing">
      <div (click)="onClick(1)"></div>
      <button (click)="onClick2(2)"></button>
    </div>
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
      filePath: "shared_snapshot_listeners.ts",
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
