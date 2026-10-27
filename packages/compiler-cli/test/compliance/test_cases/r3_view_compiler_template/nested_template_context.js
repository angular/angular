import { Component, NgModule } from "@angular/core";
import * as i0 from "@angular/core";
function MyComponent_ul_0_li_1_div_1_Template(rf, ctx) {
  if (rf & 1) {
    const _r1 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 2);
    i0.ɵɵlistener("click", function MyComponent_ul_0_li_1_div_1_Template_div_click_0_listener() {
      const inner_r2 = i0.ɵɵrestoreView(_r1).$implicit;
      const middle_r3 = i0.ɵɵnextContext().$implicit;
      const outer_r4 = i0.ɵɵnextContext().$implicit;
      const ctx_r4 = i0.ɵɵnextContext();
      return i0.ɵɵresetView(ctx_r4.onClick(outer_r4, middle_r3, inner_r2));
    });
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
  }
  if (rf & 2) {
    const inner_r2 = ctx.$implicit;
    const middle_r3 = i0.ɵɵnextContext().$implicit;
    const outer_r4 = i0.ɵɵnextContext().$implicit;
    const ctx_r4 = i0.ɵɵnextContext();
    i0.ɵɵproperty("title", ctx_r4.format(outer_r4, middle_r3, inner_r2, ctx_r4.component));
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", ctx_r4.format(outer_r4, middle_r3, inner_r2, ctx_r4.component), " ");
  }
}
function MyComponent_ul_0_li_1_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵelementStart(0, "li");
    i0.ɵɵtemplate(1, MyComponent_ul_0_li_1_div_1_Template, 2, 2, "div", 1);
    i0.ɵɵelementEnd();
  }
  if (rf & 2) {
    const ctx_r4 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngForOf", ctx_r4.items);
  }
}
function MyComponent_ul_0_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵelementStart(0, "ul");
    i0.ɵɵtemplate(1, MyComponent_ul_0_li_1_Template, 2, 1, "li", 0);
    i0.ɵɵelementEnd();
  }
  if (rf & 2) {
    const outer_r4 = ctx.$implicit;
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngForOf", outer_r4.items);
  }
}
export class MyComponent {
  component = this;
  format(outer, middle, inner) {}
  onClick(outer, middle, inner) {}
  static ɵfac = function MyComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyComponent)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyComponent,
    selectors: [["my-component"]],
    standalone: false,
    decls: 1,
    vars: 1,
    consts: [
      [4, "ngFor", "ngForOf"],
      [3, "title", "click", 4, "ngFor", "ngForOf"],
      [3, "click", "title"]
    ],
    template: function MyComponent_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵtemplate(0, MyComponent_ul_0_Template, 2, 1, "ul", 0);
      }
      if (rf & 2) {
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
    <ul *ngFor="let outer of items">
      <li *ngFor="let middle of outer.items">
        <div *ngFor="let inner of items"
             (click)="onClick(outer, middle, inner)"
             [title]="format(outer, middle, inner, component)"
             >
          {{format(outer, middle, inner, component)}}
        </div>
      </li>
    </ul>`,
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
      filePath: "nested_template_context.ts",
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
