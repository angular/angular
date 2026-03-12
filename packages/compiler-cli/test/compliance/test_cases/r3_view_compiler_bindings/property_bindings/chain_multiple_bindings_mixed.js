template: function MyComponent_Template(rf, ctx) {
  …
  if (rf & 2) {
    $r3$.ɵɵproperty("label", $r3$.ɵɵinterpolate(1 + 3))("title", 1)("tabindex", 3);
    $r3$.ɵɵattribute("id", 2);
  }
}
