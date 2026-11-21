import { Component, Directive } from "@angular/core";
import * as i0 from "@angular/core";
function ManifestDomPropertyShapes_Conditional_2_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵdomElement(0, "my-button", 2);
  }
  if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵdomProperty("readonly", ctx_r0.readonly)("innerHTML", ctx_r0.html, i0.ɵɵsanitizeHtml);
  }
}
function ManifestPropertyShapes_Conditional_2_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵelement(0, "my-button", 3);
    i0.ɵɵelementStart(1, "my-button", 4);
    i0.ɵɵi18nAttributes(2, 0, ["for"]);
    i0.ɵɵelementEnd();
  }
  if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵproperty("innerHTML", i0.ɵɵinterpolate(ctx_r0.html), i0.ɵɵsanitizeHtml);
    i0.ɵɵadvance();
    i0.ɵɵi18nExp(ctx_r0.html);
    i0.ɵɵi18nApply(2);
  }
}
export class ForceFull {
  static ɵfac = function ForceFull_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || ForceFull)();
  };
  static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: ForceFull,
    selectors: [["", "forceFull", ""]]
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      ForceFull,
      [
        {
          type: Directive,
          args: [{ selector: "[forceFull]" }]
        }
      ],
      null,
      null
    );
})();
export class ManifestDomProperties {
  readonly = false;
  formaction = "/submit";
  html = "<strong>content</strong>";
  tabindex = 0;
  static ɵfac = function ManifestDomProperties_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || ManifestDomProperties)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: ManifestDomProperties,
    selectors: [["manifest-dom-properties"]],
    decls: 1,
    vars: 4,
    consts: [[3, "formactionChange", "readonly", "formaction", "innerHTML", "tabindex"]],
    template: function ManifestDomProperties_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵdomElementStart(0, "my-button", 0);
        i0.ɵɵtwoWayListener(
          "formactionChange",
          function ManifestDomProperties_Template_my_button_formactionChange_0_listener($event) {
            i0.ɵɵtwoWayBindingSet(ctx.formaction, $event) || (ctx.formaction = $event);
            return $event;
          }
        );
        i0.ɵɵdomElementEnd();
      }
      if (rf & 2) {
        i0.ɵɵdomProperty("readonly", ctx.readonly);
        i0.ɵɵtwoWayProperty("formaction", ctx.formaction, i0.ɵɵsanitizeUrl, true);
        i0.ɵɵdomProperty("innerHTML", ctx.html, i0.ɵɵsanitizeHtml)("tabIndex", ctx.tabindex);
      }
    },
    encapsulation: 2
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      ManifestDomProperties,
      [
        {
          type: Component,
          args: [
            {
              selector: "manifest-dom-properties",
              template: `
    <my-button
      [readonly]="readonly"
      [(formaction)]="formaction"
      [innerHTML]="html"
      [tabindex]="tabindex"
    ></my-button>
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
    i0.ɵsetClassDebugInfo(ManifestDomProperties, {
      className: "ManifestDomProperties",
      filePath: "test.ts",
      lineNumber: 17
    });
})();
export class ManifestProperties {
  readonly = false;
  formaction = "/submit";
  html = "<strong>content</strong>";
  static ɵfac = function ManifestProperties_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || ManifestProperties)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: ManifestProperties,
    selectors: [["manifest-properties"]],
    decls: 1,
    vars: 3,
    consts: [["forceFull", "", 3, "formactionChange", "readonly", "formaction", "innerHTML"]],
    template: function ManifestProperties_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵelementStart(0, "my-button", 0);
        i0.ɵɵtwoWayListener(
          "formactionChange",
          function ManifestProperties_Template_my_button_formactionChange_0_listener($event) {
            i0.ɵɵtwoWayBindingSet(ctx.formaction, $event) || (ctx.formaction = $event);
            return $event;
          }
        );
        i0.ɵɵelementEnd();
      }
      if (rf & 2) {
        i0.ɵɵproperty("readonly", ctx.readonly, null, true);
        i0.ɵɵtwoWayProperty("formaction", ctx.formaction, i0.ɵɵsanitizeUrl, true);
        i0.ɵɵproperty("innerHTML", ctx.html, i0.ɵɵsanitizeHtml);
      }
    },
    dependencies: [ForceFull],
    encapsulation: 2
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      ManifestProperties,
      [
        {
          type: Component,
          args: [
            {
              selector: "manifest-properties",
              imports: [ForceFull],
              template: `
    <my-button
      forceFull
      [readonly]="readonly"
      [(formaction)]="formaction"
      [innerHTML]="html"
    ></my-button>
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
    i0.ɵsetClassDebugInfo(ManifestProperties, {
      className: "ManifestProperties",
      filePath: "test.ts",
      lineNumber: 36
    });
})();
export class ManifestDomPropertyShapes {
  readonly = false;
  html = "<strong>content</strong>";
  static ɵfac = function ManifestDomPropertyShapes_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || ManifestDomPropertyShapes)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: ManifestDomPropertyShapes,
    selectors: [["manifest-dom-property-shapes"]],
    decls: 6,
    vars: 6,
    consts: () => {
      let i18n_0;
      if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        /**
         * @suppress {msgDescriptions}
         */
        const MSG_EXTERNAL_6864156469362183835$$TEST_TS_0 =
          /* @ts-ignore */
          goog.getMsg(
            "{$interpolation}",
            { "interpolation": "\uFFFD0\uFFFD" },
            { original_code: { "interpolation": "{{html}}" } }
          );
        i18n_0 = MSG_EXTERNAL_6864156469362183835$$TEST_TS_0;
      } else {
        /* @ts-ignore */
        i18n_0 = $localize`${"\uFFFD0\uFFFD"}:INTERPOLATION:`;
      }
      return [
        ["for", i18n_0],
        [3, "readonly"],
        [3, "readonly", "innerHTML"],
        [3, "innerHTML"],
        [6, "for"]
      ];
    },
    template: function ManifestDomPropertyShapes_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵdomElement(0, "my-button", 1)(1, "input", 1);
        i0.ɵɵconditionalCreate(
          2,
          ManifestDomPropertyShapes_Conditional_2_Template,
          1,
          2,
          "my-button",
          2
        );
        i0.ɵɵdomElement(3, "my-button", 3);
        i0.ɵɵdomElementStart(4, "my-button", 4);
        i0.ɵɵi18nAttributes(5, 0, ["for"]);
        i0.ɵɵdomElementEnd();
      }
      if (rf & 2) {
        i0.ɵɵdomProperty("readonly", ctx.readonly);
        i0.ɵɵadvance();
        i0.ɵɵdomProperty("readOnly", ctx.readonly);
        i0.ɵɵadvance();
        i0.ɵɵconditional(ctx.readonly ? 2 : -1);
        i0.ɵɵadvance();
        i0.ɵɵdomProperty("innerHTML", i0.ɵɵinterpolate(ctx.html), i0.ɵɵsanitizeHtml);
        i0.ɵɵadvance();
        i0.ɵɵi18nExp(ctx.html);
        i0.ɵɵi18nApply(5);
      }
    },
    encapsulation: 2
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      ManifestDomPropertyShapes,
      [
        {
          type: Component,
          args: [
            {
              selector: "manifest-dom-property-shapes",
              template: `
    <my-button [readonly]="readonly" />
    <input [readonly]="readonly" />
    @if (readonly) {
      <my-button [readonly]="readonly" [innerHTML]="html" />
    }
    <my-button innerHTML="{{html}}" />
    <my-button for="{{html}}" i18n-for />
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
    i0.ɵsetClassDebugInfo(ManifestDomPropertyShapes, {
      className: "ManifestDomPropertyShapes",
      filePath: "test.ts",
      lineNumber: 54
    });
})();
export class ManifestPropertyShapes {
  readonly = false;
  html = "<strong>content</strong>";
  static ɵfac = function ManifestPropertyShapes_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || ManifestPropertyShapes)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: ManifestPropertyShapes,
    selectors: [["manifest-property-shapes"]],
    decls: 3,
    vars: 4,
    consts: () => {
      let i18n_1;
      if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        /**
         * @suppress {msgDescriptions}
         */
        const MSG_EXTERNAL_6864156469362183835$$TEST_TS_1 =
          /* @ts-ignore */
          goog.getMsg(
            "{$interpolation}",
            { "interpolation": "\uFFFD0\uFFFD" },
            { original_code: { "interpolation": "{{html}}" } }
          );
        i18n_1 = MSG_EXTERNAL_6864156469362183835$$TEST_TS_1;
      } else {
        /* @ts-ignore */
        i18n_1 = $localize`${"\uFFFD0\uFFFD"}:INTERPOLATION:`;
      }
      return [
        ["for", i18n_1],
        ["forceFull", "", 3, "readonly", "innerHTML"],
        ["forceFull", "", 3, "readonly"],
        ["forceFull", "", 3, "innerHTML"],
        ["forceFull", "", 6, "for"]
      ];
    },
    template: function ManifestPropertyShapes_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵelement(0, "my-button", 1)(1, "input", 2);
        i0.ɵɵconditionalCreate(2, ManifestPropertyShapes_Conditional_2_Template, 3, 3);
      }
      if (rf & 2) {
        i0.ɵɵproperty(
          "readonly",
          ctx.readonly,
          null,
          true
        )("innerHTML", ctx.html, i0.ɵɵsanitizeHtml);
        i0.ɵɵadvance();
        i0.ɵɵproperty("readonly", ctx.readonly);
        i0.ɵɵadvance();
        i0.ɵɵconditional(ctx.readonly ? 2 : -1);
      }
    },
    dependencies: [ForceFull],
    encapsulation: 2
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      ManifestPropertyShapes,
      [
        {
          type: Component,
          args: [
            {
              selector: "manifest-property-shapes",
              imports: [ForceFull],
              template: `
    <my-button forceFull [readonly]="readonly" [innerHTML]="html" />
    <input forceFull [readonly]="readonly" />
    @if (readonly) {
      <my-button forceFull innerHTML="{{html}}" />
      <my-button forceFull for="{{html}}" i18n-for />
    }
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
    i0.ɵsetClassDebugInfo(ManifestPropertyShapes, {
      className: "ManifestPropertyShapes",
      filePath: "test.ts",
      lineNumber: 71
    });
})();
