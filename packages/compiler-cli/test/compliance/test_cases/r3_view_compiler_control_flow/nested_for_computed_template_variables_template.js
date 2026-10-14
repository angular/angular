import { Component } from "@angular/core";
import * as i0 from "@angular/core";
function MyApp_For_1_For_2_For_4_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵtext(0);
    i0.ɵɵelement(1, "br");
    i0.ɵɵtext(2);
    i0.ɵɵelement(3, "br");
    i0.ɵɵtext(4);
  }
  if (rf & 2) {
    const ɵ$index_8_r1 = ctx.$index;
    const ɵ$count_8_r2 = ctx.$count;
    const ctx_r2 = i0.ɵɵnextContext();
    const ɵ$index_3_r4 = ctx_r2.$index;
    const ɵ$count_3_r5 = ctx_r2.$count;
    const ctx_r5 = i0.ɵɵnextContext();
    const ɵ$index_1_r7 = ctx_r5.$index;
    const ɵ$count_1_r8 = ctx_r5.$count;
    i0.ɵɵtextInterpolate4(
      " Innermost vars: ",
      ɵ$index_8_r1 % 2 !== 0,
      " ",
      ɵ$index_8_r1 % 2 === 0,
      " ",
      ɵ$index_8_r1 === 0,
      " ",
      ɵ$index_8_r1 === ɵ$count_8_r2 - 1,
      " "
    );
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate4(
      " Inner vars: ",
      ɵ$index_3_r4 % 2 !== 0,
      " ",
      ɵ$index_3_r4 % 2 === 0,
      " ",
      ɵ$index_3_r4 === 0,
      " ",
      ɵ$index_3_r4 === ɵ$count_3_r5 - 1,
      " "
    );
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate4(
      " Outer vars: ",
      ɵ$index_1_r7 % 2 !== 0,
      " ",
      ɵ$index_1_r7 % 2 === 0,
      " ",
      ɵ$index_1_r7 === 0,
      " ",
      ɵ$index_1_r7 === ɵ$count_1_r8 - 1,
      " "
    );
  }
}
function MyApp_For_1_For_2_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵtext(0);
    i0.ɵɵelement(1, "br");
    i0.ɵɵtext(2);
    i0.ɵɵrepeaterCreate(
      3,
      MyApp_For_1_For_2_For_4_Template,
      5,
      12,
      null,
      null,
      i0.ɵɵrepeaterTrackByIdentity
    );
  }
  if (rf & 2) {
    const ɵ$index_3_r4 = ctx.$index;
    const ɵ$count_3_r5 = ctx.$count;
    const ctx_r5 = i0.ɵɵnextContext();
    const ɵ$index_1_r7 = ctx_r5.$index;
    const ɵ$count_1_r8 = ctx_r5.$count;
    const ctx_r8 = i0.ɵɵnextContext();
    i0.ɵɵtextInterpolate4(
      " Inner vars: ",
      ɵ$index_3_r4 % 2 !== 0,
      " ",
      ɵ$index_3_r4 % 2 === 0,
      " ",
      ɵ$index_3_r4 === 0,
      " ",
      ɵ$index_3_r4 === ɵ$count_3_r5 - 1,
      " "
    );
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate4(
      " Outer vars: ",
      ɵ$index_1_r7 % 2 !== 0,
      " ",
      ɵ$index_1_r7 % 2 === 0,
      " ",
      ɵ$index_1_r7 === 0,
      " ",
      ɵ$index_1_r7 === ɵ$count_1_r8 - 1,
      " "
    );
    i0.ɵɵadvance();
    i0.ɵɵrepeater(ctx_r8.items);
  }
}
function MyApp_For_1_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵtext(0);
    i0.ɵɵrepeaterCreate(
      1,
      MyApp_For_1_For_2_Template,
      5,
      8,
      null,
      null,
      i0.ɵɵrepeaterTrackByIdentity
    );
  }
  if (rf & 2) {
    const ɵ$index_1_r7 = ctx.$index;
    const ɵ$count_1_r8 = ctx.$count;
    const ctx_r8 = i0.ɵɵnextContext();
    i0.ɵɵtextInterpolate4(
      " Outer vars: ",
      ɵ$index_1_r7 % 2 !== 0,
      " ",
      ɵ$index_1_r7 % 2 === 0,
      " ",
      ɵ$index_1_r7 === 0,
      " ",
      ɵ$index_1_r7 === ɵ$count_1_r8 - 1,
      " "
    );
    i0.ɵɵadvance();
    i0.ɵɵrepeater(ctx_r8.items);
  }
}
export class MyApp {
  items = [];
  static ɵfac = function MyApp_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyApp)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyApp,
    selectors: [["ng-component"]],
    standalone: false,
    decls: 2,
    vars: 0,
    template: function MyApp_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵrepeaterCreate(
          0,
          MyApp_For_1_Template,
          3,
          4,
          null,
          null,
          i0.ɵɵrepeaterTrackByIdentity
        );
      }
      if (rf & 2) {
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
    @for (outer of items; track outer; let outerOdd = $odd, outerEven = $even, outerFirst = $first, outerLast = $last) {
      Outer vars: {{outerOdd}} {{outerEven}} {{outerFirst}} {{outerLast}}
      @for (inner of items; track inner; let innerOdd = $odd, innerEven = $even, innerFirst = $first, innerLast = $last) {
        Inner vars: {{innerOdd}} {{innerEven}} {{innerFirst}} {{innerLast}}
        <br>
        Outer vars: {{outerOdd}} {{outerEven}} {{outerFirst}} {{outerLast}}
        @for (innermost of items; track innermost; let innermostOdd = $odd, innermostEven = $even, innermostFirst = $first, innermostLast = $last) {
          Innermost vars: {{innermostOdd}} {{innermostEven}} {{innermostFirst}} {{innermostLast}}
          <br>
          Inner vars: {{innerOdd}} {{innerEven}} {{innerFirst}} {{innerLast}}
          <br>
          Outer vars: {{outerOdd}} {{outerEven}} {{outerFirst}} {{outerLast}}
        }
      }
    }
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
      filePath: "nested_for_computed_template_variables.ts",
      lineNumber: 23
    });
})();
