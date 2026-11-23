import { Component, NgModule } from "@angular/core";
import * as i0 from "@angular/core";
function MyComponent_img_1_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵelement(0, "img", 1);
  }
}
function MyComponent_img_2_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵelementStart(0, "img", 4);
    i0.ɵɵi18nAttributes(1, 0);
    i0.ɵɵelementEnd();
  }
  if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵi18nExp(ctx_r0.id);
    i0.ɵɵi18nApply(1);
  }
}
export class MyComponent {
  static ɵfac = function MyComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyComponent)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyComponent,
    selectors: [["my-component"]],
    standalone: false,
    decls: 3,
    vars: 2,
    consts: () => {
      let i18n_0;
      if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        /**
         * @suppress {msgDescriptions}
         */
        const MSG_EXTERNAL_2367729185105559721$$SELF_CLOSING_TS_0 =
          /* @ts-ignore */
          goog.getMsg(
            "App logo #{$interpolation}",
            { "interpolation": "\uFFFD0\uFFFD" },
            { original_code: { "interpolation": "{{ id }}" } }
          );
        i18n_0 = MSG_EXTERNAL_2367729185105559721$$SELF_CLOSING_TS_0;
      } else {
        /* @ts-ignore */
        i18n_0 = $localize`App logo #${"\uFFFD0\uFFFD"}:INTERPOLATION:`;
      }
      return [
        ["title", i18n_0],
        ["src", "logo.png"],
        ["src", "logo.png", 4, "ngIf"],
        ["src", "logo.png", 3, "title", 4, "ngIf"],
        ["src", "logo.png", 6, "title"]
      ];
    },
    template: function MyComponent_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵelement(0, "img", 1);
        i0.ɵɵtemplate(1, MyComponent_img_1_Template, 1, 0, "img", 2)(
          2,
          MyComponent_img_2_Template,
          2,
          1,
          "img",
          3
        );
      }
      if (rf & 2) {
        i0.ɵɵadvance();
        i0.ɵɵproperty("ngIf", ctx.visible);
        i0.ɵɵadvance();
        i0.ɵɵproperty("ngIf", ctx.visible);
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
  <img src="logo.png" i18n />
  <img src="logo.png" i18n *ngIf="visible" />
  <img src="logo.png" i18n *ngIf="visible" i18n-title title="App logo #{{ id }}" />
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
    i0.ɵsetClassDebugInfo(MyComponent, {
      className: "MyComponent",
      filePath: "self_closing.ts",
      lineNumber: 12
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
