import { Component } from "@angular/core";
import * as i0 from "@angular/core";
function _forTrack0($index, $item) {
  /* @ts-ignore */
  return this.trackByGrandparent($item, $index);
}
function _forTrack1($index, $item) {
  /* @ts-ignore */
  return this.trackByParent($item, $index);
}
function _forTrack2($index, $item) {
  /* @ts-ignore */
  return this.trackByChild($item, $index);
}
function MyApp_For_1_For_1_For_1_Template(rf, ctx) {}
function MyApp_For_1_For_1_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵrepeaterCreate(0, MyApp_For_1_For_1_For_1_Template, 0, 0, null, null, _forTrack2, true);
  }
  if (rf & 2) {
    const parent_r1 = ctx.$implicit;
    i0.ɵɵrepeater(parent_r1.items);
  }
}
function MyApp_For_1_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵrepeaterCreate(0, MyApp_For_1_For_1_Template, 2, 0, null, null, _forTrack1, true);
  }
  if (rf & 2) {
    const grandparent_r2 = ctx.$implicit;
    i0.ɵɵrepeater(grandparent_r2.items);
  }
}
export class MyApp {
  items = [];
  trackByGrandparent = (item, index) => index;
  trackByParent = (item, index) => index;
  trackByChild = (item, index) => index;
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
        i0.ɵɵrepeaterCreate(0, MyApp_For_1_Template, 2, 0, null, null, _forTrack0, true);
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
    @for (grandparent of items; track trackByGrandparent(grandparent, $index)) {
      @for (parent of grandparent.items; track trackByParent(parent, $index)) {
        @for (child of parent.items; track trackByChild(child, $index)) {

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
      filePath: "nested_for_tracking_function.ts",
      lineNumber: 15
    });
})();
