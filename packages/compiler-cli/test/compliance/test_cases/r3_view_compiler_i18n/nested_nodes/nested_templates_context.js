import { Component, NgModule } from "@angular/core";
import * as i0 from "@angular/core";
function MyComponent_div_2_div_4_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵi18nStart(0, 0, 2);
    i0.ɵɵelementStart(1, "div");
    i0.ɵɵelement(2, "div");
    i0.ɵɵelementEnd();
    i0.ɵɵi18nEnd();
  }
  if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(2);
    i0.ɵɵi18nExp(ctx_r0.valueC)(ctx_r0.valueD);
    i0.ɵɵi18nApply(0);
  }
}
function MyComponent_div_2_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵi18nStart(0, 0, 1);
    i0.ɵɵelementStart(1, "div")(2, "div");
    i0.ɵɵpipe(3, "uppercase");
    i0.ɵɵtemplate(4, MyComponent_div_2_div_4_Template, 3, 2, "div", 1);
    i0.ɵɵelementEnd()();
    i0.ɵɵi18nEnd();
  }
  if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance(4);
    i0.ɵɵproperty("ngIf", ctx_r0.exists);
    i0.ɵɵi18nExp(ctx_r0.valueA)(i0.ɵɵpipeBind1(3, 3, ctx_r0.valueB));
    i0.ɵɵi18nApply(0);
  }
}
function MyComponent_div_3_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵi18nStart(0, 0, 3);
    i0.ɵɵelementStart(1, "div");
    i0.ɵɵelement(2, "div");
    i0.ɵɵpipe(3, "uppercase");
    i0.ɵɵelementEnd();
    i0.ɵɵi18nEnd();
  }
  if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance(3);
    i0.ɵɵi18nExp(ctx_r0.valueE + ctx_r0.valueF)(i0.ɵɵpipeBind1(3, 2, ctx_r0.valueG));
    i0.ɵɵi18nApply(0);
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
    vars: 2,
    consts: () => {
      let i18n_0;
      if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        /**
         * @suppress {msgDescriptions}
         */
        const MSG_EXTERNAL_4021381850553435020$$NESTED_TEMPLATES_CONTEXT_TS_0 =
          /* @ts-ignore */
          goog.getMsg(
            " Some content {$startTagDiv_2} Some other content {$interpolation} {$startTagDiv} More nested levels with bindings {$interpolation_1} {$startTagDiv_1} Content inside sub-template {$interpolation_2} {$startTagDiv} Bottom level element {$interpolation_3} {$closeTagDiv}{$closeTagDiv}{$closeTagDiv}{$closeTagDiv}{$startTagDiv_3} Some other content {$interpolation_4} {$startTagDiv} More nested levels with bindings {$interpolation_5} {$closeTagDiv}{$closeTagDiv}",
            {
              "closeTagDiv":
                "[\uFFFD/#2:2\uFFFD|\uFFFD/#1:2\uFFFD\uFFFD/*4:2\uFFFD|\uFFFD/#2:1\uFFFD|\uFFFD/#1:1\uFFFD\uFFFD/*2:1\uFFFD|\uFFFD/#2:3\uFFFD|\uFFFD/#1:3\uFFFD\uFFFD/*3:3\uFFFD]",
              "interpolation": "\uFFFD0:1\uFFFD",
              "interpolation_1": "\uFFFD1:1\uFFFD",
              "interpolation_2": "\uFFFD0:2\uFFFD",
              "interpolation_3": "\uFFFD1:2\uFFFD",
              "interpolation_4": "\uFFFD0:3\uFFFD",
              "interpolation_5": "\uFFFD1:3\uFFFD",
              "startTagDiv": "[\uFFFD#2:1\uFFFD|\uFFFD#2:2\uFFFD|\uFFFD#2:3\uFFFD]",
              "startTagDiv_1": "\uFFFD*4:2\uFFFD\uFFFD#1:2\uFFFD",
              "startTagDiv_2": "\uFFFD*2:1\uFFFD\uFFFD#1:1\uFFFD",
              "startTagDiv_3": "\uFFFD*3:3\uFFFD\uFFFD#1:3\uFFFD"
            },
            {
              original_code: {
                "closeTagDiv": "</div>",
                "interpolation": "{{ valueA }}",
                "interpolation_1": "{{ valueB | uppercase }}",
                "interpolation_2": "{{ valueC }}",
                "interpolation_3": "{{ valueD }}",
                "interpolation_4": "{{ valueE + valueF }}",
                "interpolation_5": "{{ valueG | uppercase }}",
                "startTagDiv": "<div>",
                "startTagDiv_1": '<div *ngIf="exists">',
                "startTagDiv_2": '<div *ngIf="visible">',
                "startTagDiv_3": '<div *ngIf="!visible">'
              }
            }
          );
        i18n_0 = MSG_EXTERNAL_4021381850553435020$$NESTED_TEMPLATES_CONTEXT_TS_0;
      } else {
        /* @ts-ignore */
        i18n_0 = $localize` Some content ${"\uFFFD*2:1\uFFFD\uFFFD#1:1\uFFFD"}:START_TAG_DIV_2: Some other content ${"\uFFFD0:1\uFFFD"}:INTERPOLATION: ${"[\uFFFD#2:1\uFFFD|\uFFFD#2:2\uFFFD|\uFFFD#2:3\uFFFD]"}:START_TAG_DIV: More nested levels with bindings ${"\uFFFD1:1\uFFFD"}:INTERPOLATION_1: ${"\uFFFD*4:2\uFFFD\uFFFD#1:2\uFFFD"}:START_TAG_DIV_1: Content inside sub-template ${"\uFFFD0:2\uFFFD"}:INTERPOLATION_2: ${"[\uFFFD#2:1\uFFFD|\uFFFD#2:2\uFFFD|\uFFFD#2:3\uFFFD]"}:START_TAG_DIV: Bottom level element ${"\uFFFD1:2\uFFFD"}:INTERPOLATION_3: ${"[\uFFFD/#2:2\uFFFD|\uFFFD/#1:2\uFFFD\uFFFD/*4:2\uFFFD|\uFFFD/#2:1\uFFFD|\uFFFD/#1:1\uFFFD\uFFFD/*2:1\uFFFD|\uFFFD/#2:3\uFFFD|\uFFFD/#1:3\uFFFD\uFFFD/*3:3\uFFFD]"}:CLOSE_TAG_DIV:${"[\uFFFD/#2:2\uFFFD|\uFFFD/#1:2\uFFFD\uFFFD/*4:2\uFFFD|\uFFFD/#2:1\uFFFD|\uFFFD/#1:1\uFFFD\uFFFD/*2:1\uFFFD|\uFFFD/#2:3\uFFFD|\uFFFD/#1:3\uFFFD\uFFFD/*3:3\uFFFD]"}:CLOSE_TAG_DIV:${"[\uFFFD/#2:2\uFFFD|\uFFFD/#1:2\uFFFD\uFFFD/*4:2\uFFFD|\uFFFD/#2:1\uFFFD|\uFFFD/#1:1\uFFFD\uFFFD/*2:1\uFFFD|\uFFFD/#2:3\uFFFD|\uFFFD/#1:3\uFFFD\uFFFD/*3:3\uFFFD]"}:CLOSE_TAG_DIV:${"[\uFFFD/#2:2\uFFFD|\uFFFD/#1:2\uFFFD\uFFFD/*4:2\uFFFD|\uFFFD/#2:1\uFFFD|\uFFFD/#1:1\uFFFD\uFFFD/*2:1\uFFFD|\uFFFD/#2:3\uFFFD|\uFFFD/#1:3\uFFFD\uFFFD/*3:3\uFFFD]"}:CLOSE_TAG_DIV:${"\uFFFD*3:3\uFFFD\uFFFD#1:3\uFFFD"}:START_TAG_DIV_3: Some other content ${"\uFFFD0:3\uFFFD"}:INTERPOLATION_4: ${"[\uFFFD#2:1\uFFFD|\uFFFD#2:2\uFFFD|\uFFFD#2:3\uFFFD]"}:START_TAG_DIV: More nested levels with bindings ${"\uFFFD1:3\uFFFD"}:INTERPOLATION_5: ${"[\uFFFD/#2:2\uFFFD|\uFFFD/#1:2\uFFFD\uFFFD/*4:2\uFFFD|\uFFFD/#2:1\uFFFD|\uFFFD/#1:1\uFFFD\uFFFD/*2:1\uFFFD|\uFFFD/#2:3\uFFFD|\uFFFD/#1:3\uFFFD\uFFFD/*3:3\uFFFD]"}:CLOSE_TAG_DIV:${"[\uFFFD/#2:2\uFFFD|\uFFFD/#1:2\uFFFD\uFFFD/*4:2\uFFFD|\uFFFD/#2:1\uFFFD|\uFFFD/#1:1\uFFFD\uFFFD/*2:1\uFFFD|\uFFFD/#2:3\uFFFD|\uFFFD/#1:3\uFFFD\uFFFD/*3:3\uFFFD]"}:CLOSE_TAG_DIV:`;
      }
      i18n_0 = i0.ɵɵi18nPostprocess(i18n_0);
      return [i18n_0, [4, "ngIf"]];
    },
    template: function MyComponent_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵelementStart(0, "div");
        i0.ɵɵi18nStart(1, 0);
        i0.ɵɵtemplate(2, MyComponent_div_2_Template, 5, 5, "div", 1)(
          3,
          MyComponent_div_3_Template,
          4,
          4,
          "div",
          1
        );
        i0.ɵɵi18nEnd();
        i0.ɵɵelementEnd();
      }
      if (rf & 2) {
        i0.ɵɵadvance(2);
        i0.ɵɵproperty("ngIf", ctx.visible);
        i0.ɵɵadvance();
        i0.ɵɵproperty("ngIf", !ctx.visible);
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
  <div i18n>
    Some content
    <div *ngIf="visible">
      Some other content {{ valueA }}
      <div>
        More nested levels with bindings {{ valueB | uppercase }}
        <div *ngIf="exists">
          Content inside sub-template {{ valueC }}
          <div>
            Bottom level element {{ valueD }}
          </div>
        </div>
      </div>
    </div>
    <div *ngIf="!visible">
      Some other content {{ valueE + valueF }}
      <div>
        More nested levels with bindings {{ valueG | uppercase }}
      </div>
    </div>
  </div>
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
      filePath: "nested_templates_context.ts",
      lineNumber: 30
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
