import { Directive, Input, NgModule } from "@angular/core";
import * as i0 from "@angular/core";
function toNumber(value) {
  return value ? 1 : 0;
}
export class MyDirective {
  functionDeclarationInput;
  // There's an extra `_` parameter, because full compilation strips the parentheses around the
  // parameters while partial compilation keeps them. This ensures consistent output.
  // @ts-ignore
  inlineFunctionInput;
  static ɵfac = function MyDirective_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyDirective)();
  };
  static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: MyDirective,
    selectors: [["", "my-directive", ""]],
    inputs: {
      functionDeclarationInput: [
        2,
        "functionDeclarationInput",
        "functionDeclarationInput",
        toNumber
      ],
      inlineFunctionInput: [
        2,
        "inlineFunctionInput",
        "inlineFunctionInput",
        (value, _) => (value ? 1 : 0)
      ]
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
        functionDeclarationInput: [
          {
            type: Input,
            args: [{ transform: toNumber }]
          }
        ],
        inlineFunctionInput: [
          {
            type: Input,
            args: [{ transform: (value, _) => (value ? 1 : 0) }]
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
