import { Component, Directive, Input, Output } from "@angular/core";
import * as i0 from "@angular/core";
export class Dir {
  a;
  aChange;
  b;
  c;
  cChange;
  d;
  static ɵfac = function Dir_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || Dir)();
  };
  static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: Dir,
    selectors: [["", "dir", ""]],
    inputs: { a: "a", b: "b", c: "c", d: "d" },
    outputs: { aChange: "aChange", cChange: "cChange" }
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      Dir,
      [
        {
          type: Directive,
          args: [{ selector: "[dir]" }]
        }
      ],
      null,
      {
        a: [
          {
            type: Input
          }
        ],
        aChange: [
          {
            type: Output
          }
        ],
        b: [
          {
            type: Input
          }
        ],
        c: [
          {
            type: Input
          }
        ],
        cChange: [
          {
            type: Output
          }
        ],
        d: [
          {
            type: Input
          }
        ]
      }
    );
})();
export class App {
  value = "hi";
  static ɵfac = function App_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || App)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: App,
    selectors: [["ng-component"]],
    decls: 1,
    vars: 4,
    consts: [["dir", "", 3, "aChange", "cChange", "a", "b", "c", "d"]],
    template: function App_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵelementStart(0, "div", 0);
        i0.ɵɵtwoWayListener("aChange", function App_Template_div_aChange_0_listener($event) {
          i0.ɵɵtwoWayBindingSet(ctx.value, $event) || (ctx.value = $event);
          return $event;
        })("cChange", function App_Template_div_cChange_0_listener($event) {
          i0.ɵɵtwoWayBindingSet(ctx.value, $event) || (ctx.value = $event);
          return $event;
        });
        i0.ɵɵelementEnd();
      }
      if (rf & 2) {
        i0.ɵɵtwoWayProperty("a", ctx.value);
        i0.ɵɵproperty("b", ctx.value);
        i0.ɵɵtwoWayProperty("c", ctx.value);
        i0.ɵɵproperty("d", ctx.value);
      }
    },
    dependencies: [Dir],
    encapsulation: 2
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      App,
      [
        {
          type: Component,
          args: [
            {
              imports: [Dir],
              template: `
    <div dir [(a)]="value" [b]="value" [(c)]="value" [d]="value"></div>
  `
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
    i0.ɵsetClassDebugInfo(App, {
      className: "App",
      filePath: "mixed_one_way_two_way_property_order.ts",
      lineNumber: 22
    });
})();
