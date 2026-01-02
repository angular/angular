const $_callbackFn0$ = (a, b) => a / b;
…
$r3$.ɵɵdefineDirective({
  …
  hostVars: 2,
  hostBindings: function TestDir_HostBindings(rf, ctx) {
    if (rf & 2) {
      $r3$.ɵɵattribute("no-context", $_callbackFn0$(5, 10))(
        // NOTE: the inline declaration with context access isn't optimized due to #66263.
        "with-context", ((a, b) => a / b + ctx.componentProp)(6, 12));
    }
  }
  …
});
