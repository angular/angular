export class MyComponent {
  // ...
  static ɵcmp = /* @__PURE__ */i0.ɵɵdefineComponent({
    type: MyComponent,
    selectors: [["ng-component"]],
    decls: 2,
    vars: 4,
    consts: [["type", "radio", "id", "radio", 3, "formField", "value"], ["type", "radio", "id", "radio", 3, "value", "formField"]],
    template: function MyComponent_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵelement(0, "input", 0);
        i0.ɵɵcontrolCreate();
        i0.ɵɵelement(1, "input", 1);
        i0.ɵɵcontrolCreate();
      }
      if (rf & 2) {
        i0.ɵɵproperty("formField", ctx.value)("value", "foo");
        i0.ɵɵcontrol();
        i0.ɵɵadvance();
        i0.ɵɵproperty("value", "foo")("formField", ctx.value);
        i0.ɵɵcontrol();
      }
    },
    dependencies: [FormField],
    encapsulation: 2
  });
}