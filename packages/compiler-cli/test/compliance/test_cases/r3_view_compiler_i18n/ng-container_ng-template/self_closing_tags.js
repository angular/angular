import { Component, NgModule } from "@angular/core";
import * as i0 from "@angular/core";
function MyComponent_ng_template_3_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵi18nStart(0, 1);
    i0.ɵɵelement(1, "img", 2);
    i0.ɵɵi18nEnd();
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
    decls: 4,
    vars: 0,
    consts: () => {
      let i18n_0;
      if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        /**
         * @suppress {msgDescriptions}
         */
        const MSG_EXTERNAL_5420441640329771391$$SELF_CLOSING_TAGS_TS_0 =
          /* @ts-ignore */
          goog.getMsg(
            "{$tagImg} is my logo #1 ",
            { "tagImg": "\uFFFD#2\uFFFD\uFFFD/#2\uFFFD" },
            { original_code: { "tagImg": '<img src="logo.png" title="Logo" />' } }
          );
        i18n_0 = MSG_EXTERNAL_5420441640329771391$$SELF_CLOSING_TAGS_TS_0;
      } else {
        /* @ts-ignore */
        i18n_0 = $localize`${"\uFFFD#2\uFFFD\uFFFD/#2\uFFFD"}:TAG_IMG: is my logo #1 `;
      }
      let i18n_1;
      if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        /**
         * @suppress {msgDescriptions}
         */
        const MSG_EXTERNAL_2178806453879858557$$SELF_CLOSING_TAGS_TS_1 =
          /* @ts-ignore */
          goog.getMsg(
            "{$tagImg} is my logo #2 ",
            { "tagImg": "\uFFFD#1\uFFFD\uFFFD/#1\uFFFD" },
            { original_code: { "tagImg": '<img src="logo.png" title="Logo" />' } }
          );
        i18n_1 = MSG_EXTERNAL_2178806453879858557$$SELF_CLOSING_TAGS_TS_1;
      } else {
        /* @ts-ignore */
        i18n_1 = $localize`${"\uFFFD#1\uFFFD\uFFFD/#1\uFFFD"}:TAG_IMG: is my logo #2 `;
      }
      return [i18n_0, i18n_1, ["src", "logo.png", "title", "Logo"]];
    },
    template: function MyComponent_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵelementContainerStart(0);
        i0.ɵɵi18nStart(1, 0);
        i0.ɵɵelement(2, "img", 2);
        i0.ɵɵi18nEnd();
        i0.ɵɵelementContainerEnd();
        i0.ɵɵtemplate(3, MyComponent_ng_template_3_Template, 2, 0, "ng-template");
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
  <ng-container i18n>
    <img src="logo.png" title="Logo" /> is my logo #1
  </ng-container>
  <ng-template i18n>
    <img src="logo.png" title="Logo" /> is my logo #2
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
    i0.ɵsetClassDebugInfo(MyComponent, {
      className: "MyComponent",
      filePath: "self_closing_tags.ts",
      lineNumber: 15
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
