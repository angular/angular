hostAttrs: ["title", "foo title", __AttributeMarker.Classes__, "foo", "baz", __AttributeMarker.Styles__, "width", "200px", "height", "500px"],
hostVars: 6,
hostBindings: function MyComponent_HostBindings(rf, ctx) {
  if (rf & 2) {
    $r3$.ɵɵdomProperty("id", ctx.id)("title", ctx.title);
    $r3$.ɵɵstyleMap(ctx.myStyle);
    $r3$.ɵɵclassMap(ctx.myClass);
  }
}
