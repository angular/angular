import { Component, Directive, NgModule, TemplateRef } from "@angular/core";
import * as i0 from "@angular/core";
function MyComponent_div_3_span_2_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵelementStart(0, "span");
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
  }
  if (rf & 2) {
    i0.ɵɵnextContext();
    const bar_r1 = i0.ɵɵreference(4);
    i0.ɵɵnextContext();
    const foo_r2 = i0.ɵɵreference(1);
    const baz_r3 = i0.ɵɵreference(5);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate3("", foo_r2, "-", bar_r1, "-", baz_r3);
  }
}
function MyComponent_div_3_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵelementStart(0, "div");
    i0.ɵɵtext(1);
    i0.ɵɵtemplate(2, MyComponent_div_3_span_2_Template, 2, 3, "span", 3);
    i0.ɵɵelement(3, "span", null, 2);
    i0.ɵɵelementEnd();
  }
  if (rf & 2) {
    const bar_r1 = i0.ɵɵreference(4);
    i0.ɵɵnextContext();
    const foo_r2 = i0.ɵɵreference(1);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate2(" ", foo_r2, "-", bar_r1, " ");
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
  static ɵfac = function MyComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyComponent)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyComponent,
    selectors: [["my-component"]],
    standalone: false,
    decls: 6,
    vars: 1,
    consts: [
      ["foo", ""],
      ["baz", ""],
      ["bar", ""],
      [4, "if"]
    ],
    template: function MyComponent_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵelement(0, "div", null, 0);
        i0.ɵɵtext(2);
        i0.ɵɵtemplate(3, MyComponent_div_3_Template, 5, 2, "div", 3);
        i0.ɵɵelement(4, "div", null, 1);
      }
      if (rf & 2) {
        const foo_r2 = i0.ɵɵreference(1);
        i0.ɵɵadvance(2);
        i0.ɵɵtextInterpolate1(" ", foo_r2, " ");
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
              template: `
    <div #foo></div>
    {{foo}}
    <div *if>
      {{foo}}-{{bar}}
      <span *if>{{foo}}-{{bar}}-{{baz}}</span>
      <span #bar></span>
    </div>
    <div #baz></div>
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
      filePath: "local_reference_nested.ts",
      lineNumber: 25
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
