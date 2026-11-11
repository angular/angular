import { Component } from "@angular/core";
import * as i0 from "@angular/core";
const _c0 = ["*"];
export class UiButton {
  static ɵfac = function UiButton_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || UiButton)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: UiButton,
    selectors: [["ui-button"]],
    ngContentSelectors: _c0,
    decls: 1,
    vars: 0,
    template: function UiButton_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵprojectionDef();
        i0.ɵɵprojection(0);
      }
    },
    encapsulation: 2
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      UiButton,
      [
        {
          type: Component,
          args: [
            {
              selector: "ui-button",
              template: "<ng-content />"
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
    i0.ɵsetClassDebugInfo(UiButton, {
      className: "UiButton",
      filePath: "class_resolver_component.ts",
      lineNumber: 7
    });
})();
export class MyComponent {
  classes(cn) {
    return cn();
  }
  static ɵfac = function MyComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyComponent)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyComponent,
    selectors: [["my-component"]],
    decls: 2,
    vars: 0,
    consts: [[1, "px-2", 3, "class"]],
    template: function MyComponent_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵelementStart(0, "ui-button", 0);
        i0.ɵɵattributeResolver("class", function MyComponent_Template_ui_button_class_0_listener($event) {
          return $event.resolve(ctx.classes($event.resolver));
        }, 3);
        i0.ɵɵtext(1, "Save");
        i0.ɵɵelementEnd();
      }
    },
    dependencies: [UiButton],
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
              imports: [UiButton],
              template: `<ui-button class="px-2" (class)="classes">Save</ui-button>`
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
      filePath: "class_resolver_component.ts",
      lineNumber: 14
    });
})();
