import { Component, NgModule } from "@angular/core";
import * as i0 from "@angular/core";
const _c0 = ["*"];
const _c1 = ["*ngIf", "show"];
function AComponent_ng_content_0_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵprojection(0, 0, _c1);
  }
}
function BComponent_ng_content_0_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵprojection(0, 0, _c1);
  }
}
export class AComponent {
  show = true;
  static ɵfac = function AComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || AComponent)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: AComponent,
    selectors: [["a-component"]],
    standalone: false,
    ngContentSelectors: _c0,
    decls: 1,
    vars: 1,
    consts: [[4, "ngIf"]],
    template: function AComponent_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵprojectionDef();
        i0.ɵɵtemplate(0, AComponent_ng_content_0_Template, 1, 0, "ng-content", 0);
      }
      if (rf & 2) {
        i0.ɵɵproperty("ngIf", ctx.show);
      }
    },
    encapsulation: 2
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      AComponent,
      [
        {
          type: Component,
          args: [
            {
              selector: "a-component",
              template: `
    <ng-content *ngIf="show"></ng-content>
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
    i0.ɵsetClassDebugInfo(AComponent, {
      className: "AComponent",
      filePath: "unique_template_function_names_ng_content.ts",
      lineNumber: 10
    });
})();
export class BComponent {
  show = true;
  static ɵfac = function BComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || BComponent)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: BComponent,
    selectors: [["b-component"]],
    standalone: false,
    ngContentSelectors: _c0,
    decls: 1,
    vars: 1,
    consts: [[4, "ngIf"]],
    template: function BComponent_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵprojectionDef();
        i0.ɵɵtemplate(0, BComponent_ng_content_0_Template, 1, 0, "ng-content", 0);
      }
      if (rf & 2) {
        i0.ɵɵproperty("ngIf", ctx.show);
      }
    },
    encapsulation: 2
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      BComponent,
      [
        {
          type: Component,
          args: [
            {
              selector: "b-component",
              template: `
    <ng-content *ngIf="show"></ng-content>
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
    i0.ɵsetClassDebugInfo(BComponent, {
      className: "BComponent",
      filePath: "unique_template_function_names_ng_content.ts",
      lineNumber: 21
    });
})();
export class AModule {
  static ɵfac = function AModule_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || AModule)();
  };
  static ɵmod = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: AModule });
  static ɵinj = /*@__PURE__*/ i0.ɵɵdefineInjector({});
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      AModule,
      [
        {
          type: NgModule,
          args: [{ declarations: [AComponent, BComponent] }]
        }
      ],
      null,
      null
    );
})();
(function () {
  (typeof ngJitMode === "undefined" || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(AModule, { declarations: [AComponent, BComponent] });
})();
