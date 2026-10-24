import { Component, NgModule } from "@angular/core";
import * as i0 from "@angular/core";
function MyComponent_0_ng_template_0_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵi18n(0, 0);
  }
}
function MyComponent_0_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵtemplate(0, MyComponent_0_ng_template_0_Template, 1, 0, "ng-template");
  }
}
function MyComponent_ng_container_1_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵelementContainerStart(0);
    i0.ɵɵi18n(1, 1);
    i0.ɵɵelementContainerEnd();
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
    decls: 2,
    vars: 2,
    consts: () => {
      let i18n_0;
      if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        /**
         * @suppress {msgDescriptions}
         */
        const MSG_EXTERNAL_3308216566145348998$$STRUCTURAL_DIRECTIVES_TS_0 =
          /* @ts-ignore */
          goog.getMsg("Content A");
        i18n_0 = MSG_EXTERNAL_3308216566145348998$$STRUCTURAL_DIRECTIVES_TS_0;
      } else {
        /* @ts-ignore */
        i18n_0 = $localize`Content A`;
      }
      let i18n_1;
      if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        /**
         * @suppress {msgDescriptions}
         */
        const MSG_EXTERNAL_8349021389088127654$$STRUCTURAL_DIRECTIVES_TS_1 =
          /* @ts-ignore */
          goog.getMsg("Content B");
        i18n_1 = MSG_EXTERNAL_8349021389088127654$$STRUCTURAL_DIRECTIVES_TS_1;
      } else {
        /* @ts-ignore */
        i18n_1 = $localize`Content B`;
      }
      return [i18n_0, i18n_1, [4, "ngIf"]];
    },
    template: function MyComponent_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵtemplate(0, MyComponent_0_Template, 1, 0, null, 2)(
          1,
          MyComponent_ng_container_1_Template,
          2,
          0,
          "ng-container",
          2
        );
      }
      if (rf & 2) {
        i0.ɵɵproperty("ngIf", ctx.someFlag);
        i0.ɵɵadvance();
        i0.ɵɵproperty("ngIf", ctx.someFlag);
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
  <ng-template *ngIf="someFlag" i18n>Content A</ng-template>
  <ng-container *ngIf="someFlag" i18n>Content B</ng-container>
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
      filePath: "structural_directives.ts",
      lineNumber: 11
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
