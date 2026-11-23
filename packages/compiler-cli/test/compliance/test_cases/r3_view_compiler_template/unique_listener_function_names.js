import { Component, NgModule } from "@angular/core";
import * as i0 from "@angular/core";
function MyComponent_div_0_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵelementStart(0, "div")(1, "p", 1);
    i0.ɵɵlistener("click", function MyComponent_div_0_Template_p_click_1_listener($event) {
      return $event;
    });
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "p", 1);
    i0.ɵɵlistener("click", function MyComponent_div_0_Template_p_click_3_listener($event) {
      return $event;
    });
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd()();
  }
  if (rf & 2) {
    const item_r1 = ctx.$implicit;
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(item_r1);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(item_r1);
  }
}
function MyComponent_div_1_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵelementStart(0, "div")(1, "p", 1);
    i0.ɵɵlistener("click", function MyComponent_div_1_Template_p_click_1_listener($event) {
      return $event;
    });
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd()();
  }
  if (rf & 2) {
    const item_r2 = ctx.$implicit;
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(item_r2);
  }
}
export class MyComponent {
  items = [4, 2];
  static ɵfac = function MyComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyComponent)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyComponent,
    selectors: [["my-component"]],
    standalone: false,
    decls: 2,
    vars: 2,
    consts: [
      [4, "ngFor", "ngForOf"],
      [3, "click"]
    ],
    template: function MyComponent_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵtemplate(0, MyComponent_div_0_Template, 5, 2, "div", 0)(
          1,
          MyComponent_div_1_Template,
          3,
          1,
          "div",
          0
        );
      }
      if (rf & 2) {
        i0.ɵɵproperty("ngForOf", ctx.items);
        i0.ɵɵadvance();
        i0.ɵɵproperty("ngForOf", ctx.items);
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
    <div *ngFor="let item of items">
      <p (click)="$event">{{ item }}</p>
      <p (click)="$event">{{ item }}</p>
    </div>
    <div *ngFor="let item of items">
      <p (click)="$event">{{ item }}</p>
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
      filePath: "unique_listener_function_names.ts",
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
