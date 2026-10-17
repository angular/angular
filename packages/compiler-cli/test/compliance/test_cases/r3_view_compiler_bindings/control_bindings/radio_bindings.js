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
// Notice that we check that the binding order doesn't matter
export class MyComponent {
  value = "foo";
  static ɵfac = function MyComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyComponent)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyComponent,
    selectors: [["ng-component"]],
    decls: 2,
    vars: 4,
    consts: [
      ["type", "radio", "id", "radio", 3, "formField", "value"],
      ["type", "radio", "id", "radio", 3, "value", "formField"]
    ],
    template: function MyComponent_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵelementStart(0, "input", 0);
        i0.ɵɵcontrolCreate();
        i0.ɵɵelementEnd();
        i0.ɵɵelementStart(1, "input", 1);
        i0.ɵɵcontrolCreate();
        i0.ɵɵelementEnd();
      }
      if (rf & 2) {
        i0.ɵɵproperty("formField", ctx.value)("value", "foo");
        i0.ɵɵcontrol();
        i0.ɵɵadvance();
        i0.ɵɵproperty("value", "foo")("formField", ctx.value);
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
    <input
        type="radio"
        [formField]="value"
        [value]="'foo'"
        id="radio"
      />

      <input
        type="radio"
        [value]="'foo'"
        [formField]="value"
        id="radio"
      />
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
      filePath: "radio_bindings.ts",
      lineNumber: 27
    });
})();
