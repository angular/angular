import { Component, NgModule } from "@angular/core";
import * as i0 from "@angular/core";
function MyComponent_ng_template_0_Template(rf, ctx) {
  if (rf & 1) {
    const _r1 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 1);
    i0.ɵɵlistener("click", function MyComponent_ng_template_0_Template_button_click_0_listener() {
      i0.ɵɵrestoreView(_r1);
      const ctx_r1 = i0.ɵɵnextContext();
      return i0.ɵɵresetView((ctx_r1["mes" + "sage"] = "hello"));
    });
    i0.ɵɵtext(1, "Click me");
    i0.ɵɵelementEnd();
  }
}
export class MyComponent {
  message = "";
  static ɵfac = function MyComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyComponent)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyComponent,
    selectors: [["my-component"]],
    standalone: false,
    decls: 2,
    vars: 0,
    consts: [
      ["template", ""],
      [3, "click"]
    ],
    template: function MyComponent_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵtemplate(
          0,
          MyComponent_ng_template_0_Template,
          2,
          0,
          "ng-template",
          null,
          0,
          i0.ɵɵtemplateRefExtractor
        );
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
    <ng-template #template>
      <button (click)="$any(this)['mes' + 'sage'] = 'hello'">Click me</button>
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
      filePath: "implicit_receiver_keyed_write_inside_template.ts",
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
