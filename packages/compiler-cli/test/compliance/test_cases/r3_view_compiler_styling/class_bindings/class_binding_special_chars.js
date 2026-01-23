$r3$.ɵɵdefineComponent({
  …
  decls: 1,
  vars: 6,
  template: function MyComponent_Template(rf, ctx) {
    if (rf & 1) {
      $r3$.ɵɵdomElement(0, "div");
    }
    if (rf & 2) {
      $r3$.ɵɵclassProp("text-primary/80", ctx.expr)("data-active:text-green-300/80", ctx.expr)("data-[size='large']:p-8", ctx.expr);
    }
  },
  …
});
