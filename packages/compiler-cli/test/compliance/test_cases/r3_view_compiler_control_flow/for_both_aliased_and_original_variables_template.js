import { Component } from "@angular/core";
import * as i0 from "@angular/core";
function MyApp_For_3_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵtext(0);
    i0.ɵɵelement(1, "hr");
    i0.ɵɵtext(2);
  }
  if (rf & 2) {
    const $index_r1 = ctx.$index;
    const ɵ$index_4_r2 = ctx.$index;
    const $count_r3 = ctx.$count;
    const ɵ$count_4_r4 = ctx.$count;
    i0.ɵɵtextInterpolate6(
      " Original index: ",
      $index_r1,
      " Original first: ",
      ɵ$index_4_r2 === 0,
      " Original last: ",
      ɵ$index_4_r2 === ɵ$count_4_r4 - 1,
      " Original even: ",
      ɵ$index_4_r2 % 2 === 0,
      " Original odd: ",
      ɵ$index_4_r2 % 2 !== 0,
      " Original count: ",
      $count_r3,
      " "
    );
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate6(
      " Aliased index: ",
      ɵ$index_4_r2,
      " Aliased first: ",
      ɵ$index_4_r2 === 0,
      " Aliased last: ",
      ɵ$index_4_r2 === ɵ$count_4_r4 - 1,
      " Aliased even: ",
      ɵ$index_4_r2 % 2 === 0,
      " Aliased odd: ",
      ɵ$index_4_r2 % 2 !== 0,
      " Aliased count: ",
      ɵ$count_4_r4,
      " "
    );
  }
}
export class MyApp {
  message = "hello";
  items = [];
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
          12,
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
      @for (item of items; track item; let idx = $index, f = $first; let l = $last, ev = $even, o = $odd; let co = $count) {
        Original index: {{$index}}
        Original first: {{$first}}
        Original last: {{$last}}
        Original even: {{$even}}
        Original odd: {{$odd}}
        Original count: {{$count}}
        <hr>
        Aliased index: {{idx}}
        Aliased first: {{f}}
        Aliased last: {{l}}
        Aliased even: {{ev}}
        Aliased odd: {{o}}
        Aliased count: {{co}}
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
      filePath: "for_both_aliased_and_original_variables.ts",
      lineNumber: 26
    });
})();
