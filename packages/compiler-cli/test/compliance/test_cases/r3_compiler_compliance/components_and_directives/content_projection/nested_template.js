import { Component, NgModule } from "@angular/core";
import * as i0 from "@angular/core";
const _c0 = [[["span", "title", "tofirst"]], "*"];
const _c1 = ["span[title=toFirst]", "*"];
function Cmp_div_0_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 2);
    i0.ɵɵprojection(1);
    i0.ɵɵelementEnd();
  }
}
function Cmp_div_1_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 3);
    i0.ɵɵtext(1, " No ng-content, no instructions generated. ");
    i0.ɵɵelementEnd();
  }
}
function Cmp_ng_template_2_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵtext(0, " '*' selector: ");
    i0.ɵɵprojection(1, 1);
  }
}
class Cmp {
  static ɵfac = function Cmp_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || Cmp)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: Cmp,
    selectors: [["ng-component"]],
    standalone: false,
    ngContentSelectors: _c1,
    decls: 3,
    vars: 2,
    consts: [
      ["id", "second", 4, "ngIf"],
      ["id", "third", 4, "ngIf"],
      ["id", "second"],
      ["id", "third"]
    ],
    template: function Cmp_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵprojectionDef(_c0);
        i0.ɵɵtemplate(0, Cmp_div_0_Template, 2, 0, "div", 0)(1, Cmp_div_1_Template, 2, 0, "div", 1)(
          2,
          Cmp_ng_template_2_Template,
          2,
          0,
          "ng-template"
        );
      }
      if (rf & 2) {
        i0.ɵɵproperty("ngIf", ctx.visible);
        i0.ɵɵadvance();
        i0.ɵɵproperty("ngIf", ctx.visible);
      }
    },
    encapsulation: 2
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      Cmp,
      [
        {
          type: Component,
          args: [
            {
              template: `
    <div id="second" *ngIf="visible">
      <ng-content SELECT="span[title=toFirst]"></ng-content>
    </div>
    <div id="third" *ngIf="visible">
      No ng-content, no instructions generated.
    </div>
    <ng-template>
      '*' selector: <ng-content></ng-content>
    </ng-template>
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
    i0.ɵsetClassDebugInfo(Cmp, {
      className: "Cmp",
      filePath: "nested_template.ts",
      lineNumber: 17
    });
})();
class Module {
  static ɵfac = function Module_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || Module)();
  };
  static ɵmod = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: Module });
  static ɵinj = /*@__PURE__*/ i0.ɵɵdefineInjector({});
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      Module,
      [
        {
          type: NgModule,
          args: [{ declarations: [Cmp] }]
        }
      ],
      null,
      null
    );
})();
(function () {
  (typeof ngJitMode === "undefined" || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(Module, { declarations: [Cmp] });
})();
