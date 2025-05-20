template: function MyComponent_Template(rf, ctx) {
  …
  if (rf & 2) {
    $r3$.ɵɵpropertyInterpolate("tabindex", 0 + 3);
    $r3$.ɵɵpropertyInterpolate2("aria-label", "hello-", 1 + 3, "-", 2 + 3);
    $r3$.ɵɵproperty("title", 1)("id", 2);
  }
}
