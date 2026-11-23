import { Component, NgModule } from "@angular/core";
import * as i0 from "@angular/core";
function MyComponent_div_0_span_1_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵelementStart(0, "span");
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
  }
  if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    const item_r2 = ctx_r0.$implicit;
    const i_r3 = ctx_r0.index;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate2(" ", i_r3, " - ", item_r2, " ");
  }
}
function MyComponent_div_0_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵelementStart(0, "div");
    i0.ɵɵtemplate(1, MyComponent_div_0_span_1_Template, 2, 2, "span", 1);
    i0.ɵɵelementEnd();
  }
  if (rf & 2) {
    const ctx_r3 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", ctx_r3.showing);
  }
}
export class MyComponent {
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
      [4, "ngFor", "ngForOf"],
      [4, "ngIf"]
    ],
    template: function MyComponent_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵtemplate(0, MyComponent_div_0_Template, 2, 1, "div", 0);
      }
      if (rf & 2) {
        i0.ɵɵproperty("ngForOf", ctx.items);
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
    <div *ngFor="let item of items; index as i">
        <span *ngIf="showing">
          {{ i }} - {{ item }}
        </span>
    </div>`,
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
      filePath: "ng_for_parent_context_variables.ts",
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
