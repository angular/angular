import { Component, NgModule } from "@angular/core";
import * as i0 from "@angular/core";
function MyComponent_div_2_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵi18nStart(0, 0, 1);
    i0.ɵɵelement(1, "div");
    i0.ɵɵi18nEnd();
  }
}
function MyComponent_div_3_div_2_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵi18nStart(0, 0, 3);
    i0.ɵɵelement(1, "div");
    i0.ɵɵi18nEnd();
  }
}
function MyComponent_div_3_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵi18nStart(0, 0, 2);
    i0.ɵɵelementStart(1, "div");
    i0.ɵɵtemplate(2, MyComponent_div_3_div_2_Template, 2, 0, "div", 1);
    i0.ɵɵelementEnd();
    i0.ɵɵi18nEnd();
  }
  if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("ngIf", ctx_r0.someFlag);
  }
}
function MyComponent_img_4_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵi18nStart(0, 0, 4);
    i0.ɵɵelement(1, "img");
    i0.ɵɵi18nEnd();
  }
}
function MyComponent_img_5_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵi18nStart(0, 0, 5);
    i0.ɵɵelement(1, "img");
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
    decls: 6,
    vars: 4,
    consts: () => {
      let i18n_0;
      if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        /**
         * @suppress {msgDescriptions}
         */
        const MSG_EXTERNAL_7491232361816524177$$STRUCTURAL_DIRECTIVES_SAME_PLACEHOLDER_TS_0 =
          /* @ts-ignore */
          goog.getMsg(
            "{$startTagDiv}Content{$closeTagDiv}{$startTagDiv}{$startTagDiv}Content{$closeTagDiv}{$closeTagDiv}{$tagImg}{$tagImg}",
            {
              "closeTagDiv":
                "[\uFFFD/#1:1\uFFFD\uFFFD/*2:1\uFFFD|\uFFFD/#1:3\uFFFD\uFFFD/*2:3\uFFFD|\uFFFD/#1:2\uFFFD\uFFFD/*3:2\uFFFD]",
              "startTagDiv":
                "[\uFFFD*2:1\uFFFD\uFFFD#1:1\uFFFD|\uFFFD*3:2\uFFFD\uFFFD#1:2\uFFFD|\uFFFD*2:3\uFFFD\uFFFD#1:3\uFFFD]",
              "tagImg":
                "[\uFFFD*4:4\uFFFD\uFFFD/*4:4\uFFFD\uFFFD#1:4\uFFFD\uFFFD/#1:4\uFFFD\uFFFD*4:4\uFFFD\uFFFD/*4:4\uFFFD|\uFFFD*5:5\uFFFD\uFFFD/*5:5\uFFFD\uFFFD#1:5\uFFFD\uFFFD/#1:5\uFFFD\uFFFD*5:5\uFFFD\uFFFD/*5:5\uFFFD]"
            },
            {
              original_code: {
                "closeTagDiv": "</div>",
                "startTagDiv": '<div *ngIf="someFlag">',
                "tagImg": '<img *ngIf="someOtherFlag" />'
              }
            }
          );
        i18n_0 = MSG_EXTERNAL_7491232361816524177$$STRUCTURAL_DIRECTIVES_SAME_PLACEHOLDER_TS_0;
      } else {
        /* @ts-ignore */
        i18n_0 = $localize`${"[\uFFFD*2:1\uFFFD\uFFFD#1:1\uFFFD|\uFFFD*3:2\uFFFD\uFFFD#1:2\uFFFD|\uFFFD*2:3\uFFFD\uFFFD#1:3\uFFFD]"}:START_TAG_DIV:Content${"[\uFFFD/#1:1\uFFFD\uFFFD/*2:1\uFFFD|\uFFFD/#1:3\uFFFD\uFFFD/*2:3\uFFFD|\uFFFD/#1:2\uFFFD\uFFFD/*3:2\uFFFD]"}:CLOSE_TAG_DIV:${"[\uFFFD*2:1\uFFFD\uFFFD#1:1\uFFFD|\uFFFD*3:2\uFFFD\uFFFD#1:2\uFFFD|\uFFFD*2:3\uFFFD\uFFFD#1:3\uFFFD]"}:START_TAG_DIV:${"[\uFFFD*2:1\uFFFD\uFFFD#1:1\uFFFD|\uFFFD*3:2\uFFFD\uFFFD#1:2\uFFFD|\uFFFD*2:3\uFFFD\uFFFD#1:3\uFFFD]"}:START_TAG_DIV:Content${"[\uFFFD/#1:1\uFFFD\uFFFD/*2:1\uFFFD|\uFFFD/#1:3\uFFFD\uFFFD/*2:3\uFFFD|\uFFFD/#1:2\uFFFD\uFFFD/*3:2\uFFFD]"}:CLOSE_TAG_DIV:${"[\uFFFD/#1:1\uFFFD\uFFFD/*2:1\uFFFD|\uFFFD/#1:3\uFFFD\uFFFD/*2:3\uFFFD|\uFFFD/#1:2\uFFFD\uFFFD/*3:2\uFFFD]"}:CLOSE_TAG_DIV:${"[\uFFFD*4:4\uFFFD\uFFFD/*4:4\uFFFD\uFFFD#1:4\uFFFD\uFFFD/#1:4\uFFFD\uFFFD*4:4\uFFFD\uFFFD/*4:4\uFFFD|\uFFFD*5:5\uFFFD\uFFFD/*5:5\uFFFD\uFFFD#1:5\uFFFD\uFFFD/#1:5\uFFFD\uFFFD*5:5\uFFFD\uFFFD/*5:5\uFFFD]"}:TAG_IMG:${"[\uFFFD*4:4\uFFFD\uFFFD/*4:4\uFFFD\uFFFD#1:4\uFFFD\uFFFD/#1:4\uFFFD\uFFFD*4:4\uFFFD\uFFFD/*4:4\uFFFD|\uFFFD*5:5\uFFFD\uFFFD/*5:5\uFFFD\uFFFD#1:5\uFFFD\uFFFD/#1:5\uFFFD\uFFFD*5:5\uFFFD\uFFFD/*5:5\uFFFD]"}:TAG_IMG:`;
      }
      i18n_0 = i0.ɵɵi18nPostprocess(i18n_0);
      return [i18n_0, [4, "ngIf"]];
    },
    template: function MyComponent_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵelementStart(0, "div");
        i0.ɵɵi18nStart(1, 0);
        i0.ɵɵtemplate(2, MyComponent_div_2_Template, 2, 0, "div", 1)(
          3,
          MyComponent_div_3_Template,
          3,
          1,
          "div",
          1
        )(4, MyComponent_img_4_Template, 2, 0, "img", 1)(
          5,
          MyComponent_img_5_Template,
          2,
          0,
          "img",
          1
        );
        i0.ɵɵi18nEnd();
        i0.ɵɵelementEnd();
      }
      if (rf & 2) {
        i0.ɵɵadvance(2);
        i0.ɵɵproperty("ngIf", ctx.someFlag);
        i0.ɵɵadvance();
        i0.ɵɵproperty("ngIf", ctx.someFlag);
        i0.ɵɵadvance();
        i0.ɵɵproperty("ngIf", ctx.someOtherFlag);
        i0.ɵɵadvance();
        i0.ɵɵproperty("ngIf", ctx.someOtherFlag);
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
    <div *ngIf="someFlag">Content</div>
    <div *ngIf="someFlag">
      <div *ngIf="someFlag">Content</div>
    </div>

    <img *ngIf="someOtherFlag" />
    <img *ngIf="someOtherFlag" />
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
      filePath: "structural_directives_same_placeholder.ts",
      lineNumber: 18
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
