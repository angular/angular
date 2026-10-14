import { Component, NgModule } from "@angular/core";
import * as i0 from "@angular/core";
export class CustomEl {
  static ɵfac = function CustomEl_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || CustomEl)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: CustomEl,
    selectors: [["custom-element"]],
    standalone: false,
    decls: 0,
    vars: 0,
    template: function CustomEl_Template(rf, ctx) {},
    encapsulation: 2
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      CustomEl,
      [
        {
          type: Component,
          args: [
            {
              selector: "custom-element",
              template: "",
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
    i0.ɵsetClassDebugInfo(CustomEl, {
      className: "CustomEl",
      filePath: "chain_multiple_bindings_for_multiple_elements.ts",
      lineNumber: 7
    });
})();
export class MyComponent {
  myTitle = "hello";
  buttonId = "special-button";
  static ɵfac = function MyComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyComponent)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyComponent,
    selectors: [["ng-component"]],
    standalone: false,
    decls: 3,
    vars: 8,
    template: function MyComponent_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵelement(0, "button")(1, "span")(2, "custom-element");
      }
      if (rf & 2) {
        i0.ɵɵattribute("title", ctx.myTitle)("id", ctx.buttonId)("tabindex", 1);
        i0.ɵɵadvance();
        i0.ɵɵattribute("id", 1)("title", "hello")("some-attr", 1 + 2);
        i0.ɵɵadvance();
        i0.ɵɵattribute("some-attr", "one")("some-other-attr", 2);
      }
    },
    dependencies: [CustomEl],
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
    <button [attr.title]="myTitle" [attr.id]="buttonId" [attr.tabindex]="1"></button>
    <span [attr.id]="1" [attr.title]="'hello'" [attr.some-attr]="1 + 2"></span>
    <custom-element [attr.some-attr]="'one'" [attr.some-other-attr]="2"></custom-element>
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
      filePath: "chain_multiple_bindings_for_multiple_elements.ts",
      lineNumber: 18
    });
})();
export class MyMod {
  static ɵfac = function MyMod_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyMod)();
  };
  static ɵmod = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: MyMod });
  static ɵinj = /*@__PURE__*/ i0.ɵɵdefineInjector({});
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      MyMod,
      [
        {
          type: NgModule,
          args: [{ declarations: [MyComponent, CustomEl] }]
        }
      ],
      null,
      null
    );
})();
(function () {
  (typeof ngJitMode === "undefined" || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(MyMod, { declarations: [MyComponent, CustomEl] });
})();
