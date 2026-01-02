const $_callbackFn0$ = prev => prev + 1;
…
$r3$.ɵɵdefineDirective({
  …
  hostBindings: function TestDir_HostBindings(rf, ctx) {
    if (rf & 1) {
      $r3$.ɵɵlistener("click", function TestDir_click_HostBindingHandler() {
        return ctx.someSignal.update($_callbackFn0$);
      })("mousedown", function TestDir_mousedown_HostBindingHandler() {
        // NOTE: the inline declaration with context access isn't optimized due to #66263.
        return ctx.someSignal.update(() => ctx.componentProp + 1);
      });
    }
  }
  …
});
