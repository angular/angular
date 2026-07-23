…
export class HostStuffDirective {
  …
  static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: HostStuffDirective, selectors: [["", "hostStuff", ""]], hostVars: 4, hostBindings: function HostStuffDirective_HostBindings(rf, ctx) {
    if (rf & 1) {
      i0.ɵɵlistener("mouseenter", function HostStuffDirective_mouseenter_HostBindingHandler() { return ctx.onEnter(); })("click", function HostStuffDirective_click_HostBindingHandler($event) { return ctx.onClick($event); })("resize", function HostStuffDirective_resize_HostBindingHandler() { return ctx.onResize(); }, i0.ɵɵresolveWindow);
    }
    if (rf & 2) {
      i0.ɵɵattribute("role", "button")("aria-label", ctx.ariaLabel);
      i0.ɵɵclassProp("is-active", ctx.isActive);
    }
  } });
}
…
