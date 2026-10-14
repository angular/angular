import { Component } from "@angular/core";
import * as i0 from "@angular/core";
function _forTrack0($index, $item) {
  /* @ts-ignore */
  return $item?.name?.[0]?.toUpperCase() ?? this.foo;
}
function _forTrack1($index, $item) {
  /* @ts-ignore */
  return $item.name ?? $index ?? this.foo;
}
function MyApp_For_1_Template(rf, ctx) {}
function MyApp_For_3_Template(rf, ctx) {}
export class MyApp {
  constructor() {
    this.items = [];
  }
}
MyApp.ɵfac = function MyApp_Factory(__ngFactoryType__) {
  return new (__ngFactoryType__ || MyApp)();
};
MyApp.ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
  type: MyApp,
  selectors: [["ng-component"]],
  decls: 4,
  vars: 0,
  template: function MyApp_Template(rf, ctx) {
    if (rf & 1) {
      i0.ɵɵrepeaterCreate(0, MyApp_For_1_Template, 0, 0, null, null, _forTrack0, true);
      i0.ɵɵrepeaterCreate(2, MyApp_For_3_Template, 0, 0, null, null, _forTrack1, true);
    }
    if (rf & 2) {
      i0.ɵɵrepeater(ctx.items);
      i0.ɵɵadvance(2);
      i0.ɵɵrepeater(ctx.items);
    }
  },
  encapsulation: 2
});
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
    @for (item of items; track item?.name?.[0]?.toUpperCase() ?? foo) {}
    @for (item of items; track item.name ?? $index ?? foo) {}
  `
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
      filePath: "for_track_by_temporary_variables.ts",
      lineNumber: 9
    });
})();
