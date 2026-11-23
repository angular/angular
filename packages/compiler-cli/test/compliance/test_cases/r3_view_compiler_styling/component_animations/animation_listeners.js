import { Component, NgModule } from "@angular/core";
import * as i0 from "@angular/core";
class MyComponent {
  exp;
  startEvent;
  doneEvent;
  onStart(event) {
    this.startEvent = event;
  }
  onDone(event) {
    this.doneEvent = event;
  }
  static ɵfac = function MyComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyComponent)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyComponent,
    selectors: [["my-cmp"]],
    standalone: false,
    decls: 1,
    vars: 1,
    template: function MyComponent_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵelementStart(0, "div");
        i0.ɵɵlistener(
          "@myAnimation.start",
          function MyComponent_Template_div_animation_myAnimation_start_0_listener($event) {
            return ctx.onStart($event);
          }
        )(
          "@myAnimation.done",
          function MyComponent_Template_div_animation_myAnimation_done_0_listener($event) {
            return ctx.onDone($event);
          }
        );
        i0.ɵɵelementEnd();
      }
      if (rf & 2) {
        i0.ɵɵproperty("@myAnimation", ctx.exp);
      }
    },
    encapsulation: 2,
    data: {
      animation: [
        trigger("myAnimation", [
          transition("* => state", [
            style({ "opacity": "0" }),
            animate(500, style({ "opacity": "1" }))
          ])
        ])
      ]
    }
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
              selector: "my-cmp",
              template: `
    <div
      [@myAnimation]="exp"
      (@myAnimation.start)="onStart($event)"
      (@myAnimation.done)="onDone($event)"></div>
  `,
              animations: [
                trigger("myAnimation", [
                  transition("* => state", [
                    style({ "opacity": "0" }),
                    animate(500, style({ "opacity": "1" }))
                  ])
                ])
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
      filePath: "animation_listeners.ts",
      lineNumber: 23
    });
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
          args: [{ declarations: [MyComponent] }]
        }
      ],
      null,
      null
    );
})();
(function () {
  (typeof ngJitMode === "undefined" || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(MyModule, { declarations: [MyComponent] });
})();
