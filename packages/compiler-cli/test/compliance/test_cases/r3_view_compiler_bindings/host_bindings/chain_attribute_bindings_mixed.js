hostBindings: function MyDirective_HostBindings(rf, ctx) {
  …
  if (rf & 2) {
    $r3$.ɵɵdomProperty("tabindex", 1);
    $r3$.ɵɵattribute("title", "my title")("id", "my-id");
  }
}
