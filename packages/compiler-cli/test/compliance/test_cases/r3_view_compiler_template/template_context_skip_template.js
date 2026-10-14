import { Component, NgModule } from "@angular/core";
import * as i0 from "@angular/core";
function MyComponent_div_0_div_1_div_1_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵelementStart(0, "div");
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
  }
  if (rf & 2) {
    const middle_r1 = i0.ɵɵnextContext().$implicit;
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate2(" ", middle_r1.value, " - ", ctx_r1.name, " ");
  }
}
function MyComponent_div_0_div_1_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵelementStart(0, "div");
    i0.ɵɵtemplate(1, MyComponent_div_0_div_1_div_1_Template, 2, 2, "div", 0);
    i0.ɵɵelementEnd();
  }
  if (rf & 2) {
    const middle_r1 = ctx.$implicit;
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngForOf", middle_r1.items);
  }
}
function MyComponent_div_0_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵelementStart(0, "div");
    i0.ɵɵtemplate(1, MyComponent_div_0_div_1_Template, 2, 1, "div", 0);
    i0.ɵɵelementEnd();
  }
  if (rf & 2) {
    const outer_r3 = ctx.$implicit;
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngForOf", outer_r3.items);
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
    consts: [[4, "ngFor", "ngForOf"]],
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
    <div *ngFor="let outer of items">
      <div *ngFor="let middle of outer.items">
        <div *ngFor="let inner of middle.items">
          {{ middle.value }} - {{ name }}
        </div>
      </div>
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
      filePath: "template_context_skip.ts",
      lineNumber: 15
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
