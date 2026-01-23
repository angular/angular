$r3$.ɵɵdefineDirective({
  …
  hostBindings: function TestDir_HostBindings(rf, ctx) {
    if (rf & 1) {
      $r3$.ɵɵlistener("click", function TestDir_click_HostBindingHandler() {
        return ctx.someSignal.update(prev => prev + 1);
      })("mousedown", function TestDir_mousedown_HostBindingHandler() {
        return ctx.someSignal.update(() => ctx.componentProp + 1);
      });
    }
  }
  …
});
