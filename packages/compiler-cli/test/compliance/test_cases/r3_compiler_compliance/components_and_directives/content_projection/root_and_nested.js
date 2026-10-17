import { Component, NgModule } from "@angular/core";
import * as i0 from "@angular/core";
const _c0 = [
  [["", "id", "tomainbefore"]],
  [["", "id", "tomainafter"]],
  [["", "id", "totemplate"]],
  [["", "id", "tonestedtemplate"]],
  "*"
];
const _c1 = [
  "[id=toMainBefore]",
  "[id=toMainAfter]",
  "[id=toTemplate]",
  "[id=toNestedTemplate]",
  "*"
];
function Cmp_ng_template_1_ng_template_1_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵprojection(0, 3);
  }
}
function Cmp_ng_template_1_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵprojection(0, 2);
    i0.ɵɵtemplate(1, Cmp_ng_template_1_ng_template_1_Template, 1, 0, "ng-template");
  }
}
function Cmp_ng_template_2_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵtext(0, " '*' selector in a template: ");
    i0.ɵɵprojection(1, 4);
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
    decls: 4,
    vars: 0,
    template: function Cmp_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵprojectionDef(_c0);
        i0.ɵɵprojection(0);
        i0.ɵɵtemplate(1, Cmp_ng_template_1_Template, 2, 0, "ng-template")(
          2,
          Cmp_ng_template_2_Template,
          2,
          0,
          "ng-template"
        );
        i0.ɵɵprojection(3, 1);
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
    <ng-content select="[id=toMainBefore]"></ng-content>
    <ng-template>
      <ng-content select="[id=toTemplate]"></ng-content>
      <ng-template>
        <ng-content select="[id=toNestedTemplate]"></ng-content>
      </ng-template>
    </ng-template>
    <ng-template>
      '*' selector in a template: <ng-content></ng-content>
    </ng-template>
    <ng-content select="[id=toMainAfter]"></ng-content>
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
      filePath: "root_and_nested.ts",
      lineNumber: 19
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
