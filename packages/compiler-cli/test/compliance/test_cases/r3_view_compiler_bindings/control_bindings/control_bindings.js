import { Component, Directive, input } from "@angular/core";
import * as i0 from "@angular/core";
export class FormField {
  formField = input(
    /* @ts-ignore */
    ...(ngDevMode ? [undefined, { debugName: "formField" }] : /* istanbul ignore next */ [])
  );
  static ɵfac = function FormField_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || FormField)();
  };
  static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: FormField,
    selectors: [["", "formField", ""]],
    inputs: { formField: [1, "formField"] }
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      FormField,
      [
        {
          type: Directive,
          args: [{ selector: "[formField]" }]
        }
      ],
      null,
      {
        formField: [
          { type: i0.Input, args: [{ isSignal: true, alias: "formField", required: false }] }
        ]
      }
    );
})();
export class MyComponent {
  value = "Hello, world!";
  static ɵfac = function MyComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyComponent)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyComponent,
    selectors: [["ng-component"]],
    decls: 4,
    vars: 2,
    consts: [
      ["formField", "Not a form control"],
      [3, "formField"]
    ],
    template: function MyComponent_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵelement(0, "div", 0);
        i0.ɵɵelementStart(1, "div");
        i0.ɵɵtext(2, "Not a form control either.");
        i0.ɵɵelementEnd();
        i0.ɵɵelementStart(3, "input", 1);
        i0.ɵɵcontrolCreate();
        i0.ɵɵelementEnd();
      }
      if (rf & 2) {
        i0.ɵɵadvance();
        i0.ɵɵattribute("formField", ctx.value);
        i0.ɵɵadvance(2);
        i0.ɵɵproperty("formField", ctx.value);
        i0.ɵɵcontrol();
      }
    },
    dependencies: [FormField],
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
              template: `
    <div formField="Not a form control"></div>
    <div [attr.formField]="value">Not a form control either.</div>
    <input [formField]="value">
  `,
              imports: [FormField]
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
      filePath: "control_bindings.ts",
      lineNumber: 16
    });
})();
