export class MyComponent {
  // ...
  static ɵcmp = /*@__PURE__*/ $r3$.ɵɵdefineComponent({
    type: MyComponent,
    selectors: [["my-comp"]],
    standalone: false,
    decls: 1,
    vars: 1,
    template:  function MyComponent_Template(rf, ctx) {
      if (rf & 1) {
        $r3$.ɵɵtext(0);
      }
      if (rf & 2) {
        $r3$.ɵɵtextInterpolate1("$", ctx.price);
      }
    },
    encapsulation: 2
  });
}

