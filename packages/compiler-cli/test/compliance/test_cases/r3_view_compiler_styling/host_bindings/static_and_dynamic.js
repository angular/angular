hostAttrs: [__AttributeMarker.Classes__, "foo", "baz", __AttributeMarker.Styles__, "width", "200px", "height", "500px"],
hostVars: 8,
hostBindings: function MyComponent_HostBindings(rf, ctx) {
  if (rf & 2) {
    $r3$.ɵɵstyleMap(ctx.myStyle);
    $r3$.ɵɵclassMap(ctx.myClass);
    $r3$.ɵɵstyleProp("color", ctx.myColorProp);
    $r3$.ɵɵclassProp("foo", ctx.myFooClass);
  }
},
standalone: false,
decls: 0,
vars: 0,
