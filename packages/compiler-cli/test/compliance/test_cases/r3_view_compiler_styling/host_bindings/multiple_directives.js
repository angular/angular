// ...
hostVars: 2,
hostBindings: function ClassDirective_HostBindings(rf, ctx) {
  if (rf & 2) {
    $r3$.ɵɵclassMap(ctx.myClassMap);
  }
}
// ...
hostVars: 4,
hostBindings: function WidthDirective_HostBindings(rf, ctx) {
  if (rf & 2) {
    $r3$.ɵɵstyleProp("width", ctx.myWidth);
    $r3$.ɵɵclassProp("foo", ctx.myFooClass);
  }
}
// ...
hostVars: 4,
hostBindings: function HeightDirective_HostBindings(rf, ctx) {
  if (rf & 2) {
    $r3$.ɵɵstyleProp("height", ctx.myHeight);
    $r3$.ɵɵclassProp("bar", ctx.myBarClass);
  }
}
// ...
