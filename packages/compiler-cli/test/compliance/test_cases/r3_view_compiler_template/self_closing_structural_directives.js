import { Component } from "@angular/core";
import * as i0 from "@angular/core";
const _c0 = ["*"];
const _c1 = ["*ngIf", "flag"];
function MyComponent_img_2_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵi18nStart(0, 0, 1);
    i0.ɵɵelement(1, "img");
    i0.ɵɵi18nEnd();
  }
}
function MyComponent_other_component_3_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵi18nStart(0, 0, 2);
    i0.ɵɵelement(1, "other-component");
    i0.ɵɵi18nEnd();
  }
}
function MyComponent_4_ng_template_1_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵi18n(0, 0, 4);
  }
}
function MyComponent_4_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵi18nStart(0, 0, 3);
    i0.ɵɵtemplate(1, MyComponent_4_ng_template_1_Template, 1, 0, "ng-template");
    i0.ɵɵi18nEnd();
  }
}
function MyComponent_ng_container_5_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵi18nStart(0, 0, 5);
    i0.ɵɵelementContainer(1);
    i0.ɵɵi18nEnd();
  }
}
function MyComponent_ng_content_6_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵi18nStart(0, 0, 6);
    i0.ɵɵprojection(1, 0, _c1);
    i0.ɵɵi18nEnd();
  }
}
export class OtherComponent {
  static ɵfac = function OtherComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || OtherComponent)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: OtherComponent,
    selectors: [["other-component"]],
    decls: 0,
    vars: 0,
    template: function OtherComponent_Template(rf, ctx) {},
    encapsulation: 2
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      OtherComponent,
      [
        {
          type: Component,
          args: [
            {
              selector: "other-component",
              template: ""
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
    i0.ɵsetClassDebugInfo(OtherComponent, {
      className: "OtherComponent",
      filePath: "self_closing_structural_directives.ts",
      lineNumber: 7
    });
})();
export class MyComponent {
  static ɵfac = function MyComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyComponent)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyComponent,
    selectors: [["my-component"]],
    ngContentSelectors: _c0,
    decls: 7,
    vars: 5,
    consts: () => {
      let i18n_0;
      if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        /**
         * @suppress {msgDescriptions}
         */
        const MSG_EXTERNAL_9160312708998185306$$SELF_CLOSING_STRUCTURAL_DIRECTIVES_TS_0 =
          /* @ts-ignore */
          goog.getMsg(
            "{$tagImg}{$startTagOtherComponent}{$closeTagOtherComponent}{$startTagNgTemplate}{$closeTagNgTemplate}{$startTagNgContainer}{$closeTagNgContainer}{$startTagNgContent}{$closeTagNgContent}",
            {
              "closeTagNgContainer": "\uFFFD/#1:5\uFFFD\uFFFD/*5:5\uFFFD",
              "closeTagNgContent": "\uFFFD/#1:6\uFFFD\uFFFD/*6:6\uFFFD",
              "closeTagNgTemplate": "[\uFFFD/*1:4\uFFFD|\uFFFD/*4:3\uFFFD]",
              "closeTagOtherComponent": "\uFFFD/#1:2\uFFFD\uFFFD/*3:2\uFFFD",
              "startTagNgContainer": "\uFFFD*5:5\uFFFD\uFFFD#1:5\uFFFD",
              "startTagNgContent": "\uFFFD*6:6\uFFFD\uFFFD#1:6\uFFFD",
              "startTagNgTemplate": "[\uFFFD*4:3\uFFFD|\uFFFD*1:4\uFFFD]",
              "startTagOtherComponent": "\uFFFD*3:2\uFFFD\uFFFD#1:2\uFFFD",
              "tagImg":
                "\uFFFD*2:1\uFFFD\uFFFD/*2:1\uFFFD\uFFFD#1:1\uFFFD\uFFFD/#1:1\uFFFD\uFFFD*2:1\uFFFD\uFFFD/*2:1\uFFFD"
            },
            {
              original_code: {
                "closeTagNgContainer": '<ng-container *ngIf="flag" />',
                "closeTagNgContent": '<ng-content *ngIf="flag" />',
                "closeTagNgTemplate": '<ng-template *ngIf="flag" />',
                "closeTagOtherComponent": '<other-component *ngIf="flag" />',
                "startTagNgContainer": '<ng-container *ngIf="flag" />',
                "startTagNgContent": '<ng-content *ngIf="flag" />',
                "startTagNgTemplate": '<ng-template *ngIf="flag" />',
                "startTagOtherComponent": '<other-component *ngIf="flag" />',
                "tagImg": '<img *ngIf="flag" />'
              }
            }
          );
        i18n_0 = MSG_EXTERNAL_9160312708998185306$$SELF_CLOSING_STRUCTURAL_DIRECTIVES_TS_0;
      } else {
        /* @ts-ignore */
        i18n_0 = $localize`${"\uFFFD*2:1\uFFFD\uFFFD/*2:1\uFFFD\uFFFD#1:1\uFFFD\uFFFD/#1:1\uFFFD\uFFFD*2:1\uFFFD\uFFFD/*2:1\uFFFD"}:TAG_IMG:${"\uFFFD*3:2\uFFFD\uFFFD#1:2\uFFFD"}:START_TAG_OTHER_COMPONENT:${"\uFFFD/#1:2\uFFFD\uFFFD/*3:2\uFFFD"}:CLOSE_TAG_OTHER_COMPONENT:${"[\uFFFD*4:3\uFFFD|\uFFFD*1:4\uFFFD]"}:START_TAG_NG_TEMPLATE:${"[\uFFFD/*1:4\uFFFD|\uFFFD/*4:3\uFFFD]"}:CLOSE_TAG_NG_TEMPLATE:${"\uFFFD*5:5\uFFFD\uFFFD#1:5\uFFFD"}:START_TAG_NG_CONTAINER:${"\uFFFD/#1:5\uFFFD\uFFFD/*5:5\uFFFD"}:CLOSE_TAG_NG_CONTAINER:${"\uFFFD*6:6\uFFFD\uFFFD#1:6\uFFFD"}:START_TAG_NG_CONTENT:${"\uFFFD/#1:6\uFFFD\uFFFD/*6:6\uFFFD"}:CLOSE_TAG_NG_CONTENT:`;
      }
      i18n_0 = i0.ɵɵi18nPostprocess(i18n_0);
      return [i18n_0, [4, "ngIf"]];
    },
    template: function MyComponent_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵprojectionDef();
        i0.ɵɵelementStart(0, "div");
        i0.ɵɵi18nStart(1, 0);
        i0.ɵɵtemplate(2, MyComponent_img_2_Template, 2, 0, "img", 1)(
          3,
          MyComponent_other_component_3_Template,
          2,
          0,
          "other-component",
          1
        )(4, MyComponent_4_Template, 2, 0, null, 1)(
          5,
          MyComponent_ng_container_5_Template,
          2,
          0,
          "ng-container",
          1
        )(6, MyComponent_ng_content_6_Template, 2, 0, "ng-content", 1);
        i0.ɵɵi18nEnd();
        i0.ɵɵelementEnd();
      }
      if (rf & 2) {
        i0.ɵɵadvance(2);
        i0.ɵɵproperty("ngIf", ctx.flag);
        i0.ɵɵadvance();
        i0.ɵɵproperty("ngIf", ctx.flag);
        i0.ɵɵadvance();
        i0.ɵɵproperty("ngIf", ctx.flag);
        i0.ɵɵadvance();
        i0.ɵɵproperty("ngIf", ctx.flag);
        i0.ɵɵadvance();
        i0.ɵɵproperty("ngIf", ctx.flag);
      }
    },
    dependencies: [OtherComponent],
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
              imports: [OtherComponent],
              template: `
  <div i18n>
    <img *ngIf="flag" />
    <other-component *ngIf="flag" />
    <ng-template *ngIf="flag" />
    <ng-container *ngIf="flag" />
    <ng-content *ngIf="flag" />
  </div>
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
      filePath: "self_closing_structural_directives.ts",
      lineNumber: 22
    });
})();
