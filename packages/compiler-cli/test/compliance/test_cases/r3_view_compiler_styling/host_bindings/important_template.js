
hostVars: 8,
hostBindings: function MyComponent_HostBindings(rf, ctx) {
  if (rf & 2) {
    $r3$.ɵɵstyleMap(ctx.myStyleExp);
    $r3$.ɵɵclassMap(ctx.myClassExp);
    $r3$.ɵɵstyleProp("width", ctx.myWidthExp);
    $r3$.ɵɵclassProp("foo", ctx.myFooClassExp);
  }
},
