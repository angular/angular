import { Component, NgModule } from "@angular/core";
import * as i0 from "@angular/core";
function MyComponent_div_0_Template(rf, ctx) {
  if (rf & 1) {
    const _r1 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 2);
    i0.ɵɵlistener("click", function MyComponent_div_0_Template_div_click_0_listener() {
      i0.ɵɵrestoreView(_r1);
      const ctx_r1 = i0.ɵɵnextContext();
      return i0.ɵɵresetView(ctx_r1.greet(ctx_r1));
    });
    i0.ɵɵelementEnd();
  }
}
function MyComponent_div_1_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵelement(0, "div", 3);
  }
  if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵproperty("id", ctx_r1);
  }
}
export class MyComponent {
  greet(val) {}
  static ɵfac = function MyComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyComponent)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyComponent,
    selectors: [["my-component"]],
    standalone: false,
    decls: 2,
    vars: 2,
    consts: [
      [3, "click", 4, "ngIf"],
      [3, "id", 4, "ngIf"],
      [3, "click"],
      [3, "id"]
    ],
    template: function MyComponent_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵtemplate(0, MyComponent_div_0_Template, 1, 0, "div", 0)(
          1,
          MyComponent_div_1_Template,
          1,
          1,
          "div",
          1
        );
      }
      if (rf & 2) {
        i0.ɵɵproperty("ngIf", true);
        i0.ɵɵadvance();
        i0.ɵɵproperty("ngIf", true);
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
    <div *ngIf="true" (click)="greet(this)"></div>
    <div *ngIf="true" [id]="this"></div>
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
      filePath: "implicit_receiver.ts",
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
