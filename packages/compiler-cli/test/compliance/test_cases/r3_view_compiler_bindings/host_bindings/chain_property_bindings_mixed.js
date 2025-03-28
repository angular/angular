hostBindings: function MyDirective_HostBindings(rf, ctx) {
  …
  if (rf & 2) {
    $r3$.ɵɵdomProperty("title", "my title")("id", "my-id");
    $r3$.ɵɵattribute("tabindex", 1);
  }
}
