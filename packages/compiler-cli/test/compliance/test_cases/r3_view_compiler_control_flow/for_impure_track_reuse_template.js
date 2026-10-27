import { Component } from "@angular/core";
import * as i0 from "@angular/core";
function _forTrack0($index, $item) {
  /* @ts-ignore */
  return this.trackFn($item, this.message);
}
function MyApp_For_1_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵtext(0);
  }
  if (rf & 2) {
    const item_r1 = ctx.$implicit;
    i0.ɵɵtextInterpolate1(" ", item_r1.name, " ");
  }
}
function MyApp_For_3_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵtext(0);
  }
  if (rf & 2) {
    const otherItem_r2 = ctx.$implicit;
    i0.ɵɵtextInterpolate1(" ", otherItem_r2.name, " ");
  }
}
export class MyApp {
  message = "hello";
  items = [{ name: "one" }, { name: "two" }, { name: "three" }];
  otherItems = [{ name: "four" }, { name: "five" }, { name: "six" }];
  trackFn(item, message) {
    return message + item.name;
  }
  static ɵfac = function MyApp_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyApp)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyApp,
    selectors: [["ng-component"]],
    standalone: false,
    decls: 4,
    vars: 0,
    template: function MyApp_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵrepeaterCreate(0, MyApp_For_1_Template, 1, 1, null, null, _forTrack0, true);
        i0.ɵɵrepeaterCreate(2, MyApp_For_3_Template, 1, 1, null, null, _forTrack0, true);
      }
      if (rf & 2) {
        i0.ɵɵrepeater(ctx.items);
        i0.ɵɵadvance(2);
        i0.ɵɵrepeater(ctx.otherItems);
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
    @for (item of items; track trackFn(item, message)) {
      {{item.name}}
    }

    @for (otherItem of otherItems; track trackFn(otherItem, message)) {
      {{otherItem.name}}
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
      filePath: "for_impure_track_reuse.ts",
      lineNumber: 15
    });
})();
