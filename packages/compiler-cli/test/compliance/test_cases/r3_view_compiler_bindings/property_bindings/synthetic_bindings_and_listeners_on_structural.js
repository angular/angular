import { Component } from "@angular/core";
import * as i0 from "@angular/core";
function MyComponent_button_0_Template(rf, ctx) {
  if (rf & 1) {
    const _r1 = i0.ɵɵgetCurrentView();
    i0.ɵɵdomElementStart(0, "button");
    i0.ɵɵlistener(
      "@anim.start",
      function MyComponent_button_0_Template_button_animation_anim_start_0_listener($event) {
        i0.ɵɵrestoreView(_r1);
        const ctx_r1 = i0.ɵɵnextContext();
        return i0.ɵɵresetView(ctx_r1.fn($event));
      }
    );
    i0.ɵɵdomElementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵproperty("@anim", ctx_r1.field);
  }
}
export class MyComponent {
  field;
  fn;
  static ɵfac = function MyComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyComponent)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyComponent,
    selectors: [["my-cmp"]],
    decls: 1,
    vars: 1,
    consts: [[4, "ngIf"]],
    template: function MyComponent_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵdomTemplate(0, MyComponent_button_0_Template, 1, 1, "button", 0);
      }
      if (rf & 2) {
        i0.ɵɵdomProperty("ngIf", true);
      }
    },
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
              selector: "my-cmp",
              template: `
    <button
      *ngIf="true"
      [@anim]="field"
      (@anim.start)="fn($event)">
    </button>
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
    i0.ɵsetClassDebugInfo(MyComponent, {
      className: "MyComponent",
      filePath: "synthetic_bindings_and_listeners_on_structural.ts",
      lineNumber: 13
    });
})();
