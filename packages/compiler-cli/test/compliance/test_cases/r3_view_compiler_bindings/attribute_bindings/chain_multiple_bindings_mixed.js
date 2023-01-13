template: function MyComponent_Template(rf, ctx) {
  …
  if (rf & 2) {
    $r3$.ɵɵattributeInterpolate1("aria-label", "prefix-", 1 + 3, "");
    $r3$.ɵɵproperty("id", 2);
    $r3$.ɵɵattribute("title", 1)("tabindex", 3);
  }
}
