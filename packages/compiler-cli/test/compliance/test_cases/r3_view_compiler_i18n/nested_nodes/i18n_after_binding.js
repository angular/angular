import { Component } from "@angular/core";
import * as i0 from "@angular/core";
export class MyComponent {
  someBoolean = false;
  someField;
  static ɵfac = function MyComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyComponent)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyComponent,
    selectors: [["my-cmp"]],
    decls: 3,
    vars: 2,
    consts: () => {
      let i18n_0;
      if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        /**
         * @suppress {msgDescriptions}
         */
        const MSG_EXTERNAL_8762838141169159471$$I18N_AFTER_BINDING_TS_0 =
          /* @ts-ignore */
          goog.getMsg(
            "{$tagInput} {$interpolation} ",
            { "interpolation": "\uFFFD0\uFFFD", "tagInput": "\uFFFD#2\uFFFD\uFFFD/#2\uFFFD" },
            {
              original_code: {
                "interpolation": "{{ someField }}",
                "tagInput": '<input [disabled]="someBoolean">'
              }
            }
          );
        i18n_0 = MSG_EXTERNAL_8762838141169159471$$I18N_AFTER_BINDING_TS_0;
      } else {
        /* @ts-ignore */
        i18n_0 = $localize`${"\uFFFD#2\uFFFD\uFFFD/#2\uFFFD"}:TAG_INPUT: ${"\uFFFD0\uFFFD"}:INTERPOLATION: `;
      }
      return [i18n_0, [3, "disabled"]];
    },
    template: function MyComponent_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵdomElementStart(0, "span");
        i0.ɵɵi18nStart(1, 0);
        i0.ɵɵdomElement(2, "input", 1);
        i0.ɵɵi18nEnd();
        i0.ɵɵdomElementEnd();
      }
      if (rf & 2) {
        i0.ɵɵadvance(2);
        i0.ɵɵdomProperty("disabled", ctx.someBoolean);
        i0.ɵɵi18nExp(ctx.someField);
        i0.ɵɵi18nApply(1);
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
		<span i18n>
  			<input [disabled]="someBoolean">
			{{ someField }}
		</span>
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
      filePath: "i18n_after_binding.ts",
      lineNumber: 12
    });
})();
