template: function MyComponent_Template(rf, ctx) {
  …
  if (rf & 2) {
    $r3$.ɵɵproperty("tabindex", $r3$.ɵɵinterpolate(0 + 3))("aria-label", $r3$.ɵɵinterpolate2("hello-", 1 + 3, "-", 2 + 3))("title", 1)("id", 2);
  }
}
