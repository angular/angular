// ...
MyComponent.ɵcmp = /*@__PURE__*/ $r3$.ɵɵdefineComponent({
  // ...
  decls: 1,
  vars: 1,
  template: function MyComponent_Template(rf, ctx) {
    if (rf & 1) {
      $r3$.ɵɵelementStart(0, "div");
      $r3$.ɵɵlistener("@myAnimation.start", function MyComponent_Template_div_animation_myAnimation_start_0_listener($event) { return ctx.onStart($event); })("@myAnimation.done", function MyComponent_Template_div_animation_myAnimation_done_0_listener($event) { return ctx.onDone($event); });
      $r3$.ɵɵelementEnd();
    } if (rf & 2) {
      $r3$.ɵɵproperty("@myAnimation", ctx.exp);
    }
  },
  encapsulation: 2,
  // ...
});
