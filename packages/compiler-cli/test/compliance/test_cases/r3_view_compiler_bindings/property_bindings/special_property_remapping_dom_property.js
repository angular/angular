
consts: [[__AttributeMarker.Bindings__, "for"]]

…

function MyComponent_Template(rf, ctx) {
  if (rf & 1) {
      $i0$.ɵɵdomElement(0, "label", 0);
  }
  if (rf & 2) {
      $i0$.ɵɵdomProperty("htmlFor", ctx.forValue);
  }
}
