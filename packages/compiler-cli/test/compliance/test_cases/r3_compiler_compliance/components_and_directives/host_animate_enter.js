import { Component } from '@angular/core';
import * as i0 from "@angular/core";

…
export class TestCmp {
  disabled = false;
  …
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: TestCmp,
    selectors: [["test-cmp"]],
    hostBindings: function TestCmp_HostBindings(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵanimateEnter(function TestCmp_HostBindings_animateenter_cb() {
          return ctx.disabled ? undefined : "enter-class";
        });
      }
    },
    decls: 0,
    vars: 0,
    template: function TestCmp_Template(rf, ctx) { },
    encapsulation: 2
  });
}
…
