hostVars: 10,
hostBindings: function MyDir_HostBindings(rf, ctx) {
  if (rf & 2) {
    $r3$.ɵɵdomProperty("title", ctx.title);
    $r3$.ɵɵsyntheticHostProperty("@anim",
      $r3$.ɵɵpureFunction2(7, _c1, ctx._animValue,
      $r3$.ɵɵpureFunction2(4, _c0, ctx._animParam1, ctx._animParam2)));
    $r3$.ɵɵclassProp("foo", ctx.foo);
  }
}
