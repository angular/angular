var __decorate =
  (this && this.__decorate) ||
  function (decorators, target, key, desc) {
    var c = arguments.length,
      r =
        c < 3
          ? target
          : desc === null
            ? (desc = Object.getOwnPropertyDescriptor(target, key))
            : desc,
      d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
      r = Reflect.decorate(decorators, target, key, desc);
    else
      for (var i = decorators.length - 1; i >= 0; i--)
        if ((d = decorators[i]))
          r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return (c > 3 && r && Object.defineProperty(target, key, r), r);
  };
var __metadata =
  (this && this.__metadata) ||
  function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
      return Reflect.metadata(k, v);
  };
import { Directive, Input, Output } from "@angular/core";
import { CustomPropDecorator } from "./custom";
import * as i0 from "@angular/core";
export class MyDir {
  foo;
  bar;
  custom;
  mixed;
  none;
  static ɵfac = function MyDir_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyDir)();
  };
  static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: MyDir,
    inputs: { foo: "foo", bar: [0, "baz", "bar"], mixed: "mixed" },
    outputs: { mixed: "mixed" }
  });
}
__decorate(
  [CustomPropDecorator(), __metadata("design:type", String)],
  MyDir.prototype,
  "custom",
  void 0
);
__decorate(
  [CustomPropDecorator(), __metadata("design:type", String)],
  MyDir.prototype,
  "mixed",
  void 0
);
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      MyDir,
      [
        {
          type: Directive
        }
      ],
      null,
      {
        foo: [
          {
            type: Input
          }
        ],
        bar: [
          {
            type: Input,
            args: ["baz"]
          }
        ],
        custom: [],
        mixed: [
          {
            type: Input
          },
          {
            type: Output
          }
        ]
      }
    );
})();
