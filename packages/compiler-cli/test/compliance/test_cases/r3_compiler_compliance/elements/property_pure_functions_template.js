template: function MyComponent_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵelement(0, "div", 0);
    $r3$.ɵɵpipe(1, "pipe");
  }
  if (rf & 2) {
    $r3$.ɵɵproperty("ternary", ctx.cond ? $r3$.ɵɵpureFunction1(8, $c0$, ctx.a): $r3$.ɵɵpureFunction0(10, $c1$))("pipe", $r3$.ɵɵpipeBind3(1, 4, ctx.value, 1, 2))("and", ctx.cond && $r3$.ɵɵpureFunction1(11, $c0$, ctx.b))("or", ctx.cond || $r3$.ɵɵpureFunction1(13, $c0$, ctx.c));
  }
}
