import { Component, NgModule } from "@angular/core";
import { ForOfDirective } from "./for_of";
import * as i0 from "@angular/core";
function MyComponent_li_1_li_4_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵelementStart(0, "li");
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
  }
  if (rf & 2) {
    const info_r1 = ctx.$implicit;
    const item_r2 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate2(" ", item_r2.name, ": ", info_r1.description, " ");
  }
}
function MyComponent_li_1_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵelementStart(0, "li")(1, "div");
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "ul");
    i0.ɵɵtemplate(4, MyComponent_li_1_li_4_Template, 2, 2, "li", 0);
    i0.ɵɵelementEnd()();
  }
  if (rf & 2) {
    const item_r2 = ctx.$implicit;
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(item_r2.name);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("forOf", item_r2.infos);
  }
}
export class MyComponent {
  items = [
    { name: "one", infos: [{ description: "11" }, { description: "12" }] },
    { name: "two", infos: [{ description: "21" }, { description: "22" }] }
  ];
  static ɵfac = function MyComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyComponent)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyComponent,
    selectors: [["my-component"]],
    standalone: false,
    decls: 2,
    vars: 1,
    consts: [[4, "for", "forOf"]],
    template: function MyComponent_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵelementStart(0, "ul");
        i0.ɵɵtemplate(1, MyComponent_li_1_Template, 5, 2, "li", 0);
        i0.ɵɵelementEnd();
      }
      if (rf & 2) {
        i0.ɵɵadvance();
        i0.ɵɵproperty("forOf", ctx.items);
      }
    },
    dependencies: () => [ForOfDirective],
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
  <ul>
    <li *for="let item of items">
      <div>{{item.name}}</div>
      <ul>
        <li *for="let info of item.infos">
          {{item.name}}: {{info.description}}
        </li>
      </ul>
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
      filePath: "parent_template_variable.ts",
      lineNumber: 19
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
          args: [{ declarations: [MyComponent, ForOfDirective] }]
        }
      ],
      null,
      null
    );
})();
(function () {
  (typeof ngJitMode === "undefined" || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(MyModule, { declarations: [MyComponent, ForOfDirective] });
})();
