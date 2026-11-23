import { Component } from "@angular/core";
import * as i0 from "@angular/core";
function MyApp_For_2_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵtext(0);
  }
  if (rf & 2) {
    const $index_r1 = ctx.$index;
    const ɵ$index_2_r2 = ctx.$index;
    const $count_r3 = ctx.$count;
    const ɵ$count_2_r4 = ctx.$count;
    i0.ɵɵtextInterpolate4(
      " ",
      $index_r1,
      " ",
      $count_r3,
      " ",
      ɵ$index_2_r2 === 0,
      " ",
      ɵ$index_2_r2 === ɵ$count_2_r4 - 1,
      " "
    );
  }
}
export class MyApp {
  message = "hello";
  items = [];
  // These variables are defined so that the template type checker doesn't raise an error.
  $index;
  $count;
  $first;
  $last;
  static ɵfac = function MyApp_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyApp)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyApp,
    selectors: [["ng-component"]],
    standalone: false,
    decls: 4,
    vars: 8,
    template: function MyApp_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵtext(0);
        i0.ɵɵrepeaterCreate(
          1,
          MyApp_For_2_Template,
          1,
          4,
          null,
          null,
          i0.ɵɵrepeaterTrackByIdentity
        );
        i0.ɵɵtext(3);
      }
      if (rf & 2) {
        i0.ɵɵtextInterpolate4(
          " ",
          ctx.$index,
          " ",
          ctx.$count,
          " ",
          ctx.$first,
          " ",
          ctx.$last,
          " "
        );
        i0.ɵɵadvance();
        i0.ɵɵrepeater(ctx.items);
        i0.ɵɵadvance(2);
        i0.ɵɵtextInterpolate4(
          " ",
          ctx.$index,
          " ",
          ctx.$count,
          " ",
          ctx.$first,
          " ",
          ctx.$last,
          " "
        );
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
    {{$index}} {{$count}} {{$first}} {{$last}}

    @for (item of items; track item) {
      {{$index}} {{$count}} {{$first}} {{$last}}
    }

    {{$index}} {{$count}} {{$first}} {{$last}}
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
      filePath: "for_template_variables_scope.ts",
      lineNumber: 15
    });
})();
