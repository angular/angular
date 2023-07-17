template: function MyComponent_Template(rf, ctx) {
  if (rf & 1) {
    …
    i0.ɵɵlistener("click", function MyComponent_Template_div_click_0_listener() {
      return ctx._handleClick({
        a: ctx.a,
        b: 2,
        c: ctx.c
      });
    });
    …
  }
}
