import { Directive, Input, input } from "@angular/core";
import * as i0 from "@angular/core";
function convertToBoolean(value) {
  return value === true || value !== "";
}
export class TestDir {
  counter = input(
    0 /* @ts-ignore */,
    ...(ngDevMode ? [{ debugName: "counter" }] : /* istanbul ignore next */ [])
  );
  signalWithTransform = input(false, {
    ...(ngDevMode ? { debugName: "signalWithTransform" } : /* istanbul ignore next */ {}),
    transform: convertToBoolean
  });
  signalWithTransformAndAlias = input(false, {
    ...(ngDevMode ? { debugName: "signalWithTransformAndAlias" } : /* istanbul ignore next */ {}),
    alias: "publicNameSignal",
    transform: convertToBoolean
  });
  decoratorInput = true;
  decoratorInputWithAlias = true;
  decoratorInputWithTransformAndAlias = true;
  static ɵfac = function TestDir_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || TestDir)();
  };
  static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: TestDir,
    inputs: {
      counter: [1, "counter"],
      signalWithTransform: [1, "signalWithTransform"],
      signalWithTransformAndAlias: [1, "publicNameSignal", "signalWithTransformAndAlias"],
      decoratorInput: "decoratorInput",
      decoratorInputWithAlias: [0, "publicNameDecorator", "decoratorInputWithAlias"],
      decoratorInputWithTransformAndAlias: [
        2,
        "publicNameDecorator2",
        "decoratorInputWithTransformAndAlias",
        convertToBoolean
      ]
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
        counter: [
          { type: i0.Input, args: [{ isSignal: true, alias: "counter", required: false }] }
        ],
        signalWithTransform: [
          {
            type: i0.Input,
            args: [{ isSignal: true, alias: "signalWithTransform", required: false }]
          }
        ],
        signalWithTransformAndAlias: [
          { type: i0.Input, args: [{ isSignal: true, alias: "publicNameSignal", required: false }] }
        ],
        decoratorInput: [
          {
            type: Input
          }
        ],
        decoratorInputWithAlias: [
          {
            type: Input,
            args: ["publicNameDecorator"]
          }
        ],
        decoratorInputWithTransformAndAlias: [
          {
            type: Input,
            args: [{ alias: "publicNameDecorator2", transform: convertToBoolean }]
          }
        ]
      }
    );
})();
