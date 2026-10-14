import { Component, Directive, forwardRef, Input } from "@angular/core";
import * as i0 from "@angular/core";
export class MyComponent {
  static ɵfac = function MyComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyComponent)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyComponent,
    selectors: [["my-component"]],
    standalone: false,
    features: [
      i0.ɵɵHostDirectivesFeature(function () {
        return [DirectiveB];
      })
    ],
    decls: 0,
    vars: 0,
    template: function MyComponent_Template(rf, ctx) {},
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
              template: "",
              hostDirectives: [forwardRef(() => DirectiveB)],
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
      filePath: "forward_ref_host_directives.ts",
      lineNumber: 9
    });
})();
export class DirectiveB {
  static ɵfac = function DirectiveB_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || DirectiveB)();
  };
  static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: DirectiveB,
    features: [
      i0.ɵɵHostDirectivesFeature(function () {
        return [{ directive: DirectiveA, inputs: ["value", "value"] }];
      })
    ]
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      DirectiveB,
      [
        {
          type: Directive,
          args: [
            {
              hostDirectives: [{ directive: forwardRef(() => DirectiveA), inputs: ["value"] }]
            }
          ]
        }
      ],
      null,
      null
    );
})();
export class DirectiveA {
  value;
  static ɵfac = function DirectiveA_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || DirectiveA)();
  };
  static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: DirectiveA,
    inputs: { value: "value" }
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      DirectiveA,
      [
        {
          type: Directive,
          args: [{}]
        }
      ],
      null,
      {
        value: [
          {
            type: Input
          }
        ]
      }
    );
})();
