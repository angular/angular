// NOTE: AttributeMarker.Bindings = 3
consts: [[3, "id"]],
template: function MyComponent_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵelement(0, "div", 0);
  }
  if (rf & 2) {
    $r3$.ɵɵproperty("id", ctx.id);
  }
}
