MyAnimDir.ɵdir = /*@__PURE__*/ $r3$.ɵɵdefineDirective({
  // ...
  hostVars: 1,
  hostBindings: function MyAnimDir_HostBindings(rf, ctx) {
    if (rf & 1) {
      $r3$.ɵɵsyntheticHostListener("@myAnim.start", function MyAnimDir_animation_myAnim_start_HostBindingHandler() { return ctx.onStart(); })("@myAnim.done", function MyAnimDir_animation_myAnim_done_HostBindingHandler() { return ctx.onDone(); });
    }
    if (rf & 2) {
      $r3$.ɵɵsyntheticHostProperty("@myAnim", ctx.myAnimState);
    }
  }
  // ...
});
