import { Component } from "@angular/core";
import * as i0 from "@angular/core";
function MyApp_For_3_For_2_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵtext(0);
  }
  if (rf & 2) {
    const $count_r1 = ctx.$count;
    const ɵ$count_4_r2 = i0.ɵɵnextContext().$count;
    i0.ɵɵtextInterpolate2(" Outer: ", ɵ$count_4_r2, " Inner: ", $count_r1, " ");
  }
}
function MyApp_For_3_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵtext(0);
    i0.ɵɵrepeaterCreate(
      1,
      MyApp_For_3_For_2_Template,
      1,
      2,
      null,
      null,
      i0.ɵɵrepeaterTrackByIdentity
    );
  }
  if (rf & 2) {
    const item_r3 = ctx.$implicit;
    i0.ɵɵtextInterpolate1(" ", item_r3.name, " ");
    i0.ɵɵadvance();
    i0.ɵɵrepeater(item_r3.subItems);
  }
}
export class MyApp {
  message = "hello";
  items = [
    { name: "one", subItems: ["sub one", "sub two", "sub three"] },
    { name: "two", subItems: ["sub one", "sub two", "sub three"] },
    { name: "three", subItems: ["sub one", "sub two", "sub three"] }
  ];
  static ɵfac = function MyApp_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyApp)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyApp,
    selectors: [["ng-component"]],
    standalone: false,
    decls: 4,
    vars: 1,
    template: function MyApp_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵelementStart(0, "div");
        i0.ɵɵtext(1);
        i0.ɵɵrepeaterCreate(
          2,
          MyApp_For_3_Template,
          3,
          1,
          null,
          null,
          i0.ɵɵrepeaterTrackByIdentity
        );
        i0.ɵɵelementEnd();
      }
      if (rf & 2) {
        i0.ɵɵadvance();
        i0.ɵɵtextInterpolate1(" ", ctx.message, " ");
        i0.ɵɵadvance();
        i0.ɵɵrepeater(ctx.items);
      }
    },
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
    <div>
      {{message}}
      @for (item of items; track item; let outerCount = $count) {
        {{item.name}}
        @for (subitem of item.subItems; track subitem) {
          Outer: {{outerCount}}
          Inner: {{$count}}
        }
      }
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
    i0.ɵsetClassDebugInfo(MyApp, {
      className: "MyApp",
      filePath: "nested_for_template_variables.ts",
      lineNumber: 18
    });
})();
