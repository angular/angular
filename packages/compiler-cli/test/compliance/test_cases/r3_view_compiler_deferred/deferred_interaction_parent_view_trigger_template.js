import { Component } from "@angular/core";
import * as i0 from "@angular/core";
function MyApp_ng_template_0_ng_template_4_ng_template_0_Defer_0_Template(rf, ctx) {}
function MyApp_ng_template_0_ng_template_4_ng_template_0_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵdomTemplate(0, MyApp_ng_template_0_ng_template_4_ng_template_0_Defer_0_Template, 0, 0);
    i0.ɵɵdefer(1, 0);
    i0.ɵɵdeferOnInteraction(1, 2);
    i0.ɵɵdeferPrefetchOnInteraction(1, 2);
  }
}
function MyApp_ng_template_0_ng_template_4_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵtemplate(0, MyApp_ng_template_0_ng_template_4_ng_template_0_Template, 3, 0, "ng-template");
  }
}
function MyApp_ng_template_0_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵtext(0);
    i0.ɵɵelementStart(1, "button", null, 0);
    i0.ɵɵtext(3, "Click me");
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(4, MyApp_ng_template_0_ng_template_4_Template, 1, 0, "ng-template");
  }
  if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵtextInterpolate1(" ", ctx_r0.message, " ");
  }
}
export class MyApp {
  message = "hello";
  static ɵfac = function MyApp_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyApp)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyApp,
    selectors: [["ng-component"]],
    standalone: false,
    decls: 1,
    vars: 0,
    consts: [["button", ""]],
    template: function MyApp_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵtemplate(0, MyApp_ng_template_0_Template, 5, 1, "ng-template");
      }
    },
    encapsulation: 2
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      MyApp,
      [
        {
          type: Component,
          args: [
            {
              template: `
    <ng-template>
      {{message}}
      <button #button>Click me</button>

      <ng-template>
        <ng-template>
          @defer (on interaction(button); prefetch on interaction(button)) {}
        </ng-template>
      </ng-template>
    </ng-template>
  `,
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
    i0.ɵsetClassDebugInfo(MyApp, {
      className: "MyApp",
      filePath: "deferred_interaction_parent_view_trigger.ts",
      lineNumber: 18
    });
})();
