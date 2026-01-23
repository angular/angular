hostBindings: function MyComponent_HostBindings(rf, ctx) {
  if (rf & 2) {
    $r3$.ɵɵdomProperty("ariaLabel", ctx.label);
    $r3$.ɵɵattribute("aria-disabled", ctx.disabled)("aria-readonly", ctx.readonly);
  }
}