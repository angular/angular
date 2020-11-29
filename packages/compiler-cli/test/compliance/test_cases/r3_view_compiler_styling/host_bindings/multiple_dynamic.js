hostVars: 12,
hostBindings: function MyComponent_HostBindings(rf, ctx) {
  if (rf & 2) {
    $r3$.ɵɵstyleMap(ctx.myStyle);
    $r3$.ɵɵclassMap(ctx.myClasses);
    $r3$.ɵɵstyleProp("height", ctx.myHeightProp, "pt")("width", ctx.myWidthProp);
    $r3$.ɵɵclassProp("bar", ctx.myBarClass)("foo", ctx.myFooClass);
  }
},
decls: 0,
vars: 0,
