export class DomOnlyCmp {
  // ...
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    // ...
    template: function DomOnlyCmp_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵelementStart(0, "div")(1, "span");
        i0.ɵɵtext(2, "hi");
        i0.ɵɵelementEnd()();
      }
    },
    // ...
  });
}
