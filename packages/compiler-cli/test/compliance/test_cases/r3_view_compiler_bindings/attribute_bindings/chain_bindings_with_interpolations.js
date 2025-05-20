template: function MyComponent_Template(rf, ctx) {
  …
  if (rf & 2) {
    $r3$.ɵɵattributeInterpolate1("tabindex", "prefix-", 0 + 3);
    $r3$.ɵɵattributeInterpolate2("aria-label", "hello-", 1 + 3, "-", 2 + 3);
    $r3$.ɵɵattribute("title", 1)("id", 2);
  }
}
