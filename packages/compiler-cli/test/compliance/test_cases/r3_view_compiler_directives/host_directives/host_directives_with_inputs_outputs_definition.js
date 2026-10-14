import { Component, Directive, EventEmitter, Input, Output } from "@angular/core";
import * as i0 from "@angular/core";
export class HostDir {
  value = 0;
  color = "";
  opened = new EventEmitter();
  closed = new EventEmitter();
  static ɵfac = function HostDir_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || HostDir)();
  };
  static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: HostDir,
    inputs: { value: "value", color: "color" },
    outputs: { opened: "opened", closed: "closed" }
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      HostDir,
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
        ],
        color: [
          {
            type: Input
          }
        ],
        opened: [
          {
            type: Output
          }
        ],
        closed: [
          {
            type: Output
          }
        ]
      }
    );
})();
export class MyComponent {
  static ɵfac = function MyComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyComponent)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyComponent,
    selectors: [["my-component"]],
    standalone: false,
    features: [
      i0.ɵɵHostDirectivesFeature([
        {
          directive: HostDir,
          inputs: ["value", "value", "color", "colorAlias"],
          outputs: ["opened", "opened", "closed", "closedAlias"]
        }
      ])
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
              hostDirectives: [
                {
                  directive: HostDir,
                  inputs: ["value", "color: colorAlias"],
                  outputs: ["opened", "closed: closedAlias"]
                }
              ],
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
      filePath: "host_directives_with_inputs_outputs.ts",
      lineNumber: 21
    });
})();
