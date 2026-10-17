import { Component, Directive, NgModule, TemplateRef } from "@angular/core";
import * as i0 from "@angular/core";
function MyComponent_li_2_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵelementStart(0, "li");
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
  }
  if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    const foo_r2 = i0.ɵɵreference(1);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate2("", ctx_r0.salutation, " ", foo_r2);
  }
}
export class IfDirective {
  constructor(template) {}
  static ɵfac = function IfDirective_Factory(__ngFactoryType__) {
    /* @ts-ignore */
    return new (__ngFactoryType__ || IfDirective)(i0.ɵɵdirectiveInject(i0.TemplateRef));
  };
  static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: IfDirective,
    selectors: [["", "if", ""]],
    standalone: false
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      IfDirective,
      [
        {
          type: Directive,
          args: [
            {
              selector: "[if]",
              standalone: false
            }
          ]
        }
      ],
      () => [{ type: i0.TemplateRef }],
      null
    );
})();
export class MyComponent {
  salutation = "Hello";
  static ɵfac = function MyComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyComponent)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyComponent,
    selectors: [["my-component"]],
    standalone: false,
    decls: 3,
    vars: 0,
    consts: [
      ["foo", ""],
      [4, "if"]
    ],
    template: function MyComponent_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵelementStart(0, "ul", null, 0);
        i0.ɵɵtemplate(2, MyComponent_li_2_Template, 2, 2, "li", 1);
        i0.ɵɵelementEnd();
      }
    },
    dependencies: [IfDirective],
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
              template: "<ul #foo><li *if>{{salutation}} {{foo}}</li></ul>",
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
      filePath: "structural_directives.ts",
      lineNumber: 16
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
          args: [{ declarations: [IfDirective, MyComponent] }]
        }
      ],
      null,
      null
    );
})();
(function () {
  (typeof ngJitMode === "undefined" || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(MyModule, { declarations: [IfDirective, MyComponent] });
})();
