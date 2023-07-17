
consts: [[__AttributeMarker.Bindings__, "for"]]

// ...

function MyComponent_Template(rf, ctx) {
  if (rf & 1) {
      $i0$.ɵɵelement(0, "label", 0);
  }
  if (rf & 2) {
      $i0$.ɵɵproperty("for", ctx.forValue);
  }
}