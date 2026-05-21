export class TestCmp {
  // ...
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: TestCmp,
    selectors: [["main"]],
    decls: 1,
    vars: 0,
    template: function TestCmp_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵforeignComponent(0, frameworkImport(FancyButton), { class: "btn-cls", "unsafe-attr": "value", label: ctx.title, "unsafe-input": ctx.title });
      }
    },
    encapsulation: 2
  });
}
