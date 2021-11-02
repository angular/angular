function MyComponent_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵelement(0, "div");
  }
  if (rf & 2) {
    $r3$.ɵɵstyleProp("height", ctx.myHeightExp);
    $r3$.ɵɵclassProp("bar", ctx.myBarClassExp);
  }
},
