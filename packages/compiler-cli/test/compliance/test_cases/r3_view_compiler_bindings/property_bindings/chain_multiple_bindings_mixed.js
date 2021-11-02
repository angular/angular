template: function MyComponent_Template(rf, ctx) {
  …
  if (rf & 2) {
    $r3$.ɵɵpropertyInterpolate("aria-label", 1 + 3);
    $r3$.ɵɵproperty("title", 1)("tabindex", 3);
    $r3$.ɵɵattribute("id", 2);
  }
}
