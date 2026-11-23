import { Component, Directive, Input, NgModule } from "@angular/core";
import * as i0 from "@angular/core";
export class SpanDir {
  someProp;
  static ɵfac = function SpanDir_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || SpanDir)();
  };
  static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: SpanDir,
    selectors: [["span"]],
    inputs: { someProp: "someProp" },
    standalone: false
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      SpanDir,
      [
        {
          type: Directive,
          args: [
            {
              selector: "span",
              standalone: false
            }
          ]
        }
      ],
      null,
      {
        someProp: [
          {
            type: Input
          }
        ]
      }
    );
})();
export class CustomEl {
  prop;
  otherProp;
  static ɵfac = function CustomEl_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || CustomEl)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: CustomEl,
    selectors: [["custom-element"]],
    inputs: { prop: "prop", otherProp: "otherProp" },
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
      {
        prop: [
          {
            type: Input
          }
        ],
        otherProp: [
          {
            type: Input
          }
        ]
      }
    );
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassDebugInfo(CustomEl, {
      className: "CustomEl",
      filePath: "chain_multiple_bindings_for_multiple_elements.ts",
      lineNumber: 15
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
    consts: [
      [3, "title", "id", "tabindex"],
      [3, "id", "title", "someProp"],
      [3, "prop", "otherProp"]
    ],
    template: function MyComponent_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵelement(0, "button", 0)(1, "span", 1)(2, "custom-element", 2);
      }
      if (rf & 2) {
        i0.ɵɵproperty("title", ctx.myTitle)("id", ctx.buttonId)("tabindex", 1);
        i0.ɵɵadvance();
        i0.ɵɵproperty("id", 1)("title", "hello")("someProp", 1 + 2);
        i0.ɵɵadvance();
        i0.ɵɵproperty("prop", "one")("otherProp", 2);
      }
    },
    dependencies: [CustomEl, SpanDir],
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
    <button [title]="myTitle" [id]="buttonId" [tabindex]="1"></button>
    <span [id]="1" [title]="'hello'" [someProp]="1 + 2"></span>
    <custom-element [prop]="'one'" [otherProp]="2"></custom-element>
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
      lineNumber: 28
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
          args: [{ declarations: [MyComponent, CustomEl, SpanDir] }]
        }
      ],
      null,
      null
    );
})();
(function () {
  (typeof ngJitMode === "undefined" || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(MyMod, { declarations: [MyComponent, CustomEl, SpanDir] });
})();
