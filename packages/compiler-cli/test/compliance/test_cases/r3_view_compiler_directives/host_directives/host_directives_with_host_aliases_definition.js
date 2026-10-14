import { Component, Directive, EventEmitter, Input, Output } from "@angular/core";
import * as i0 from "@angular/core";
export class HostDir {
  value = 1;
  color = "";
  opened = new EventEmitter();
  closed = new EventEmitter();
  static ɵfac = function HostDir_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || HostDir)();
  };
  static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: HostDir,
    inputs: { value: [0, "valueAlias", "value"], color: [0, "colorAlias", "color"] },
    outputs: { opened: "openedAlias", closed: "closedAlias" }
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
            type: Input,
            args: ["valueAlias"]
          }
        ],
        color: [
          {
            type: Input,
            args: ["colorAlias"]
          }
        ],
        opened: [
          {
            type: Output,
            args: ["openedAlias"]
          }
        ],
        closed: [
          {
            type: Output,
            args: ["closedAlias"]
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
          inputs: ["valueAlias", "valueAlias", "colorAlias", "customColorAlias"],
          outputs: ["openedAlias", "openedAlias", "closedAlias", "customClosedAlias"]
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
                  inputs: ["valueAlias", "colorAlias: customColorAlias"],
                  outputs: ["openedAlias", "closedAlias: customClosedAlias"]
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
      filePath: "host_directives_with_host_aliases.ts",
      lineNumber: 21
    });
})();
