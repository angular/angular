import { Component, Directive, Input } from "@angular/core";
import * as i0 from "@angular/core";
function MyApp_For_1_ng_template_0_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵtext(0);
  }
  if (rf & 2) {
    const item_r1 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵtextInterpolate(item_r1);
  }
}
function MyApp_For_1_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵtemplate(0, MyApp_For_1_ng_template_0_Template, 1, 1, "ng-template", 0);
  }
  if (rf & 2) {
    i0.ɵɵproperty("binding", 3);
  }
}
function MyApp_ForEmpty_2_ng_template_0_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵtext(0, "Empty!");
  }
}
function MyApp_ForEmpty_2_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵtemplate(0, MyApp_ForEmpty_2_ng_template_0_Template, 1, 0, "ng-template", 1);
  }
  if (rf & 2) {
    i0.ɵɵproperty("binding", 3);
  }
}
export class Binding {
  binding = 0;
  static ɵfac = function Binding_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || Binding)();
  };
  static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: Binding,
    selectors: [["", "binding", ""]],
    inputs: { binding: "binding" }
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      Binding,
      [
        {
          type: Directive,
          args: [{ selector: "[binding]" }]
        }
      ],
      null,
      {
        binding: [
          {
            type: Input
          }
        ]
      }
    );
})();
export class MyApp {
  items = [1, 2, 3];
  static ɵfac = function MyApp_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyApp)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyApp,
    selectors: [["ng-component"]],
    decls: 3,
    vars: 1,
    consts: [
      ["foo", "1", "bar", "2", 3, "binding"],
      ["empty-foo", "1", "empty-bar", "2", 3, "binding"]
    ],
    template: function MyApp_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵrepeaterCreate(
          0,
          MyApp_For_1_Template,
          1,
          1,
          null,
          0,
          i0.ɵɵrepeaterTrackByIdentity,
          false,
          MyApp_ForEmpty_2_Template,
          1,
          1,
          null,
          1
        );
      }
      if (rf & 2) {
        i0.ɵɵrepeater(ctx.items);
      }
    },
    dependencies: [Binding],
    encapsulation: 2
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      MyApp,
      [
        {
          type: Component,
          args: [
            {
              template: `
    @for (item of items; track item) {
      <ng-template foo="1" bar="2" [binding]="3">{{item}}</ng-template>
    } @empty {
      <ng-template empty-foo="1" empty-bar="2" [binding]="3">Empty!</ng-template>
    }
  `,
              imports: [Binding]
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
    i0.ɵsetClassDebugInfo(MyApp, {
      className: "MyApp",
      filePath: "for_template_root_node.ts",
      lineNumber: 18
    });
})();
