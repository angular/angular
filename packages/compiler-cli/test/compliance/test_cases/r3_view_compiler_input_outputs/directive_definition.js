import { Directive, Input, NgModule, Output } from "@angular/core";
import * as i0 from "@angular/core";
export class MyDirective {
  directiveInput;
  originalDirectiveInput;
  directiveOutput;
  originalDirectiveOutput;
  static ɵfac = function MyDirective_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyDirective)();
  };
  static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: MyDirective,
    selectors: [["", "my-directive", ""]],
    inputs: {
      directiveInput: "directiveInput",
      originalDirectiveInput: [0, "renamedDirectiveInput", "originalDirectiveInput"]
    },
    outputs: {
      directiveOutput: "directiveOutput",
      originalDirectiveOutput: "renamedDirectiveOutput"
    },
    standalone: false
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      MyDirective,
      [
        {
          type: Directive,
          args: [
            {
              selector: "[my-directive]",
              standalone: false
            }
          ]
        }
      ],
      null,
      {
        directiveInput: [
          {
            type: Input
          }
        ],
        originalDirectiveInput: [
          {
            type: Input,
            args: ["renamedDirectiveInput"]
          }
        ],
        directiveOutput: [
          {
            type: Output
          }
        ],
        originalDirectiveOutput: [
          {
            type: Output,
            args: ["renamedDirectiveOutput"]
          }
        ]
      }
    );
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
          args: [{ declarations: [MyDirective] }]
        }
      ],
      null,
      null
    );
})();
(function () {
  (typeof ngJitMode === "undefined" || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(MyModule, { declarations: [MyDirective] });
})();
