SignalCmp.ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
  type: SignalCmp,
  selectors: [["ng-component"]],
  standalone: true,
  signals: true,
  features: [i0.ɵɵStandaloneFeature],
  decls: 1,
  vars: 0,
  template: function SignalCmp_Template(rf, ctx) {
    if (rf & 1) {
      i0.ɵɵelement(0, "other-cmp");
    }
  },
  dependencies: [OtherCmp],
  encapsulation: 2
});