import { Directive, input } from "@angular/core";
import * as i0 from "@angular/core";
// Note: `@Input` non-signal inputs did not support arrow functions as an example.
const toBoolean = v => v === true || v !== "";
// Note: `@Input` non-signal inputs did not support transform function "builders" and generics.
const complexTransform = defaultVal => v => v || defaultVal;
export class TestDir {
  name = input.required({
    ...(ngDevMode ? { debugName: "name" } : /* istanbul ignore next */ {}),
    transform: v => v === true || v !== ""
  });
  name2 = input.required({
    ...(ngDevMode ? { debugName: "name2" } : /* istanbul ignore next */ {}),
    transform: toBoolean
  });
  genericTransform = input.required({
    ...(ngDevMode ? { debugName: "genericTransform" } : /* istanbul ignore next */ {}),
    transform: complexTransform(1)
  });
  genericTransform2 = input.required({
    ...(ngDevMode ? { debugName: "genericTransform2" } : /* istanbul ignore next */ {}),
    transform: complexTransform(null)
  });
  static ɵfac = function TestDir_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || TestDir)();
  };
  static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: TestDir,
    inputs: {
      name: [1, "name"],
      name2: [1, "name2"],
      genericTransform: [1, "genericTransform"],
      genericTransform2: [1, "genericTransform2"]
    }
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      TestDir,
      [
        {
          type: Directive,
          args: [{}]
        }
      ],
      null,
      {
        name: [{ type: i0.Input, args: [{ isSignal: true, alias: "name", required: true }] }],
        name2: [{ type: i0.Input, args: [{ isSignal: true, alias: "name2", required: true }] }],
        genericTransform: [
          { type: i0.Input, args: [{ isSignal: true, alias: "genericTransform", required: true }] }
        ],
        genericTransform2: [
          { type: i0.Input, args: [{ isSignal: true, alias: "genericTransform2", required: true }] }
        ]
      }
    );
})();
