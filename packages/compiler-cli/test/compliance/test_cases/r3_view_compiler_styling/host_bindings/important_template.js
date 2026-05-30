
hostVars: 6,
hostBindings: function MyComponent_HostBindings(rf, ctx) {
  if (rf & 2) {
    $r3$.ɵɵstyleProp("width", ctx.myWidthExp);
    $r3$.ɵɵclassProp("baz", ctx.myClassExp)("foo", ctx.myFooClassExp);
  }
},
