import { Component } from "@angular/core";
import * as i0 from "@angular/core";
export class MyComponent {
  value1;
  value2;
  static ɵfac = function MyComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyComponent)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyComponent,
    selectors: [["my-component"]],
    decls: 8,
    vars: 8,
    consts: [
      ["aria-label", "hello", "aria-label", "hi"],
      [2, "height", "0"],
      [1, "cls2"],
      [3, "tabindex"],
      [3, "click"]
    ],
    template: function MyComponent_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵdomElement(0, "div", 0);
        i0.ɵɵdomElementStart(1, "div", 1);
        i0.ɵɵdomElement(2, "div", 2)(3, "div")(4, "div", 3)(5, "div")(6, "div");
        i0.ɵɵdomElementStart(7, "div", 4);
        i0.ɵɵdomListener("click", function MyComponent_Template_div_click_7_listener($event) {
          return $event.stopPropagation();
        })("click", function MyComponent_Template_div_click_7_listener($event) {
          return $event.preventDefault();
        });
        i0.ɵɵdomElementEnd()();
      }
      if (rf & 2) {
        i0.ɵɵadvance(3);
        i0.ɵɵattribute("aria-label", ctx.value1)("aria-label", ctx.value2);
        i0.ɵɵadvance();
        i0.ɵɵdomProperty("tabIndex", ctx.value1)("tabIndex", ctx.value2);
        i0.ɵɵadvance();
        i0.ɵɵclassMap(ctx.value2);
        i0.ɵɵadvance();
        i0.ɵɵstyleMap(ctx.value2);
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
    <div aria-label="hello" aria-label="hi"></div>
    <div style="width: 0" style="height: 0">
    <div class="cls1" class="cls2"></div>
    <div [attr.aria-label]="value1" [attr.aria-label]="value2"></div>
    <div [tabindex]="value1" [tabindex]="value2"></div>
    <div [class]="value1" [class]="value2"></div>
    <div [style]="value1" [style]="value2"></div>
    <div (click)="$event.stopPropagation()" (click)="$event.preventDefault()"></div>
  `
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
      filePath: "duplicate_bindings.ts",
      lineNumber: 16
    });
})();
