…
export class HostStylingDirective {
  …
  static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: HostStylingDirective, selectors: [["", "hostStyling", ""]], hostVars: 8, hostBindings: function HostStylingDirective_HostBindings(rf, ctx) {
    if (rf & 2) {
      i0.ɵɵstyleMap(ctx.cssStyle);
      i0.ɵɵclassMap(ctx.cssClass);
      i0.ɵɵstyleProp("width", ctx.width, "px");
      i0.ɵɵclassProp("active", ctx.isActive);
    }
  }, inputs: { cssClass: "cssClass", cssStyle: "cssStyle", width: "width", isActive: "isActive" } });
}
…
