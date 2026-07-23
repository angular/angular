…
export class AmbiguousUrlDirective {
  …
  static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: AmbiguousUrlDirective, selectors: [["", "ambiguousUrl", ""]], hostVars: 2, hostBindings: function AmbiguousUrlDirective_HostBindings(rf, ctx) {
    if (rf & 2) {
      i0.ɵɵattribute("src", ctx.value, i0.ɵɵsanitizeUrlOrResourceUrl)("href", ctx.value, i0.ɵɵsanitizeUrlOrResourceUrl);
    }
  } });
}
…
