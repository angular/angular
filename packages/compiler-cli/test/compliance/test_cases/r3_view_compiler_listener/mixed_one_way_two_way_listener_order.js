import { Component, Directive, EventEmitter, Input, Output } from "@angular/core";
import * as i0 from "@angular/core";
export class Dir {
  a = "";
  aChange = new EventEmitter();
  b = new EventEmitter();
  c = "";
  cChange = new EventEmitter();
  d = new EventEmitter();
  static ɵfac = function Dir_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || Dir)();
  };
  static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: Dir,
    selectors: [["", "dir", ""]],
    inputs: { a: "a", c: "c" },
    outputs: { aChange: "aChange", b: "b", cChange: "cChange", d: "d" }
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
            type: Output
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
            type: Output
          }
        ]
      }
    );
})();
export class App {
  value = "hi";
  noop = () => {};
  static ɵfac = function App_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || App)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: App,
    selectors: [["ng-component"]],
    decls: 1,
    vars: 2,
    consts: [["dir", "", 3, "aChange", "b", "cChange", "d", "a", "c"]],
    template: function App_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵelementStart(0, "div", 0);
        i0.ɵɵtwoWayListener("aChange", function App_Template_div_aChange_0_listener($event) {
          i0.ɵɵtwoWayBindingSet(ctx.value, $event) || (ctx.value = $event);
          return $event;
        });
        i0.ɵɵlistener("b", function App_Template_div_b_0_listener() {
          return ctx.noop();
        });
        i0.ɵɵtwoWayListener("cChange", function App_Template_div_cChange_0_listener($event) {
          i0.ɵɵtwoWayBindingSet(ctx.value, $event) || (ctx.value = $event);
          return $event;
        });
        i0.ɵɵlistener("d", function App_Template_div_d_0_listener() {
          return ctx.noop();
        });
        i0.ɵɵelementEnd();
      }
      if (rf & 2) {
        i0.ɵɵtwoWayProperty("a", ctx.value)("c", ctx.value);
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
    <div dir [(a)]="value" (b)="noop()" [(c)]="value" (d)="noop()"></div>
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
      filePath: "mixed_one_way_two_way_listener_order.ts",
      lineNumber: 22
    });
})();
