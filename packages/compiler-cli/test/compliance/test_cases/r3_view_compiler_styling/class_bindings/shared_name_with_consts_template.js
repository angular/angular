import { Component } from "@angular/core";
import * as i0 from "@angular/core";
function MyComponent_div_4_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵdomElement(0, "div", 7);
  }
}
function MyComponent_div_6_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵdomElement(0, "div", 8);
  }
  if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵdomProperty("all", ctx_r0.all);
  }
}
export class MyComponent {
  tabIndex = 0;
  static ɵfac = function MyComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyComponent)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyComponent,
    selectors: [["my-component"]],
    decls: 7,
    vars: 3,
    consts: () => {
      let i18n_0;
      if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        /**
         * @suppress {msgDescriptions}
         */
        const MSG_EXTERNAL_8915674564851115041$$SHARED_NAME_WITH_CONSTS_TS_0 =
          /* @ts-ignore */
          goog.getMsg("label");
        i18n_0 = MSG_EXTERNAL_8915674564851115041$$SHARED_NAME_WITH_CONSTS_TS_0;
      } else {
        /* @ts-ignore */
        i18n_0 = $localize`label`;
      }
      return [
        ["attr", "", 1, "attr"],
        ["ngProjectAs", "selector", 5, ["selector"], 1, "selector"],
        [1, "width", 2, "width", "0px"],
        [1, "tabindex", 3, "tabindex"],
        ["class", "ngIf", 4, "ngIf"],
        ["aria-label", i18n_0, 1, "aria-label"],
        [
          "all",
          "",
          "ngProjectAs",
          "all",
          "style",
          "all:all",
          "class",
          "all",
          5,
          ["all"],
          3,
          "all",
          4,
          "all"
        ],
        [1, "ngIf"],
        ["all", "", "ngProjectAs", "all", 5, ["all"], 1, "all", 2, "all", "all", 3, "all"]
      ];
    },
    template: function MyComponent_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵdomElement(0, "div", 0)(1, "div", 1)(2, "div", 2)(3, "div", 3);
        i0.ɵɵdomTemplate(4, MyComponent_div_4_Template, 1, 0, "div", 4);
        i0.ɵɵdomElement(5, "div", 5);
        i0.ɵɵdomTemplate(6, MyComponent_div_6_Template, 1, 1, "div", 6);
      }
      if (rf & 2) {
        i0.ɵɵadvance(3);
        i0.ɵɵdomProperty("tabIndex", ctx.tabIndex);
        i0.ɵɵadvance();
        i0.ɵɵdomProperty("ngIf", ctx.cond);
        i0.ɵɵadvance(2);
        i0.ɵɵdomProperty("all", ctx.all);
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
              selector: "my-component",
              template: `
  <div attr class="attr"></div>
  <div ngProjectAs="selector" class="selector"></div>
  <div style="width:0px" class="width"></div>
  <div [tabindex]="tabIndex" class="tabindex"></div>
  <div *ngIf="cond" class="ngIf"></div>
  <div aria-label="label" i18n-aria-label class="aria-label"></div>
  <div all ngProjectAs="all" style="all:all" [all]="all" *all="all" i18n-all class="all"></div>
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
      filePath: "shared_name_with_consts.ts",
      lineNumber: 15
    });
})();
