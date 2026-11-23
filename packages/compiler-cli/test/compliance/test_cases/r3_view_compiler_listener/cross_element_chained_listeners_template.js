import { Component, EventEmitter, NgModule, Output } from "@angular/core";
import * as i0 from "@angular/core";
export class SomeComp {
  update = new EventEmitter();
  delete = new EventEmitter();
  static ɵfac = function SomeComp_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || SomeComp)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: SomeComp,
    selectors: [["some-comp"]],
    outputs: { update: "update", delete: "delete" },
    standalone: false,
    decls: 0,
    vars: 0,
    template: function SomeComp_Template(rf, ctx) {},
    encapsulation: 2
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      SomeComp,
      [
        {
          type: Component,
          args: [
            {
              selector: "some-comp",
              template: "",
              standalone: false
            }
          ]
        }
      ],
      null,
      {
        update: [
          {
            type: Output
          }
        ],
        delete: [
          {
            type: Output
          }
        ]
      }
    );
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassDebugInfo(SomeComp, {
      className: "SomeComp",
      filePath: "cross_element_chained_listeners.ts",
      lineNumber: 8
    });
})();
export class MyComponent {
  click() {}
  change() {}
  delete() {}
  update() {}
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
      [3, "click", "change"],
      [3, "update", "delete"]
    ],
    template: function MyComponent_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵelementStart(0, "div", 0);
        i0.ɵɵlistener("click", function MyComponent_Template_div_click_0_listener() {
          return ctx.click();
        })("change", function MyComponent_Template_div_change_0_listener() {
          return ctx.change();
        });
        i0.ɵɵelementEnd();
        i0.ɵɵelementStart(1, "some-comp", 1);
        i0.ɵɵlistener("update", function MyComponent_Template_some_comp_update_1_listener() {
          return ctx.update();
        })("delete", function MyComponent_Template_some_comp_delete_1_listener() {
          return ctx.delete();
        });
        i0.ɵɵelementEnd();
      }
    },
    dependencies: [SomeComp],
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
      <div (click)="click()" (change)="change()"></div>
      <some-comp (update)="update()" (delete)="delete()"></some-comp>
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
      filePath: "cross_element_chained_listeners.ts",
      lineNumber: 21
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
          args: [{ declarations: [MyComponent, SomeComp] }]
        }
      ],
      null,
      null
    );
})();
(function () {
  (typeof ngJitMode === "undefined" || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(MyModule, { declarations: [MyComponent, SomeComp] });
})();
