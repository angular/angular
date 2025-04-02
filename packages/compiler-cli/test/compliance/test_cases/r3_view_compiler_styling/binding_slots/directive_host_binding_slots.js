hostVars: 6,
hostBindings: function WidthDirective_HostBindings(rf, ctx) {
    if (rf & 2) {
      $r3$.ɵɵdomProperty("id", ctx.id)("title", ctx.title);
      $r3$.ɵɵstyleProp("width", ctx.myWidth);
      $r3$.ɵɵclassProp("foo", ctx.myFooClass);
    }
  }
