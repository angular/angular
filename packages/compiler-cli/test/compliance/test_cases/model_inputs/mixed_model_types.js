import { Directive, EventEmitter, Input, model, Output } from "@angular/core";
import * as i0 from "@angular/core";
export class TestDir {
  counter = model(
    0 /* @ts-ignore */,
    ...(ngDevMode ? [{ debugName: "counter" }] : /* istanbul ignore next */ [])
  );
  modelWithAlias = model(false, {
    ...(ngDevMode ? { debugName: "modelWithAlias" } : /* istanbul ignore next */ {}),
    alias: "alias"
  });
  decoratorInput = true;
  decoratorInputWithAlias = true;
  decoratorOutput = new EventEmitter();
  decoratorOutputWithAlias = new EventEmitter();
  decoratorInputTwoWay = true;
  decoratorInputTwoWayChange = new EventEmitter();
  static ɵfac = function TestDir_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || TestDir)();
  };
  static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: TestDir,
    inputs: {
      counter: [1, "counter"],
      modelWithAlias: [1, "alias", "modelWithAlias"],
      decoratorInput: "decoratorInput",
      decoratorInputWithAlias: [0, "publicNameDecorator", "decoratorInputWithAlias"],
      decoratorInputTwoWay: "decoratorInputTwoWay"
    },
    outputs: {
      counter: "counterChange",
      modelWithAlias: "aliasChange",
      decoratorOutput: "decoratorOutput",
      decoratorOutputWithAlias: "aliasDecoratorOutputWithAlias",
      decoratorInputTwoWayChange: "decoratorInputTwoWayChange"
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
          { type: i0.Input, args: [{ isSignal: true, alias: "counter", required: false }] },
          { type: i0.Output, args: ["counterChange"] }
        ],
        modelWithAlias: [
          { type: i0.Input, args: [{ isSignal: true, alias: "alias", required: false }] },
          { type: i0.Output, args: ["aliasChange"] }
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
        decoratorOutput: [
          {
            type: Output
          }
        ],
        decoratorOutputWithAlias: [
          {
            type: Output,
            args: ["aliasDecoratorOutputWithAlias"]
          }
        ],
        decoratorInputTwoWay: [
          {
            type: Input
          }
        ],
        decoratorInputTwoWayChange: [
          {
            type: Output
          }
        ]
      }
    );
})();
