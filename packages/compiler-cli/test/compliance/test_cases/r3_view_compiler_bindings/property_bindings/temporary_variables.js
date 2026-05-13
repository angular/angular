template: function MyComponent_Template(rf, ctx) {
  …
  if (rf & 2) {
    i0.ɵɵproperty("title", ctx.myTitle)("id", i0.ɵɵpipeBind1(1, 3, ctx.auth().identity())?.id)("tabindex", 1);  }
}
