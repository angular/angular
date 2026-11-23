import { Component, NgModule } from "@angular/core";
import * as i0 from "@angular/core";
export class MyComponent {
  static ɵfac = function MyComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyComponent)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyComponent,
    selectors: [["my-component"]],
    standalone: false,
    decls: 5,
    vars: 0,
    consts: () => {
      let i18n_0;
      if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        /**
         * @suppress {msgDescriptions}
         */
        const MSG_EXTERNAL_8448806415640562150$$FOREIGN_OBJECT_TS_0 =
          /* @ts-ignore */
          goog.getMsg(
            "{$startTagXhtmlDiv} Count: {$startTagXhtmlSpan}5{$closeTagXhtmlSpan}{$closeTagXhtmlDiv}",
            {
              "closeTagXhtmlDiv": "\uFFFD/#3\uFFFD",
              "closeTagXhtmlSpan": "\uFFFD/#4\uFFFD",
              "startTagXhtmlDiv": "\uFFFD#3\uFFFD",
              "startTagXhtmlSpan": "\uFFFD#4\uFFFD"
            },
            {
              original_code: {
                "closeTagXhtmlDiv": "</xhtml:div>",
                "closeTagXhtmlSpan": "</span>",
                "startTagXhtmlDiv": '<xhtml:div xmlns="http://www.w3.org/1999/xhtml">',
                "startTagXhtmlSpan": "<span>"
              }
            }
          );
        i18n_0 = MSG_EXTERNAL_8448806415640562150$$FOREIGN_OBJECT_TS_0;
      } else {
        /* @ts-ignore */
        i18n_0 = $localize`${"\uFFFD#3\uFFFD"}:START_TAG__XHTML_DIV: Count: ${"\uFFFD#4\uFFFD"}:START_TAG__XHTML_SPAN:5${"\uFFFD/#4\uFFFD"}:CLOSE_TAG__XHTML_SPAN:${"\uFFFD/#3\uFFFD"}:CLOSE_TAG__XHTML_DIV:`;
      }
      return [
        i18n_0,
        ["xmlns", "http://www.w3.org/2000/svg"],
        ["xmlns", "http://www.w3.org/1999/xhtml"]
      ];
    },
    template: function MyComponent_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵnamespaceSVG();
        i0.ɵɵelementStart(0, "svg", 1)(1, "foreignObject");
        i0.ɵɵi18nStart(2, 0);
        i0.ɵɵnamespaceHTML();
        i0.ɵɵelementStart(3, "div", 2);
        i0.ɵɵelement(4, "span");
        i0.ɵɵelementEnd();
        i0.ɵɵi18nEnd();
        i0.ɵɵelementEnd()();
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
  <svg xmlns="http://www.w3.org/2000/svg">
    <foreignObject i18n>
      <xhtml:div xmlns="http://www.w3.org/1999/xhtml">
        Count: <span>5</span>
      </xhtml:div>
    </foreignObject>
  </svg>
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
      filePath: "foreign_object.ts",
      lineNumber: 16
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
