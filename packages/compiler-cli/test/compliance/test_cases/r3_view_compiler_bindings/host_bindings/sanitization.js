hostBindings: function HostBindingDir_HostBindings(rf, ctx) {
  if (rf & 2) {
    i0.ɵɵdomProperty("innerHTML", ctx.evil, i0.ɵɵsanitizeHtml)("href", ctx.evil, i0.ɵɵsanitizeUrlOrResourceUrl)("src", ctx.evil, i0.ɵɵsanitizeUrlOrResourceUrl)("sandbox", ctx.evil, i0.ɵɵvalidateAttribute);
    i0.ɵɵattribute("style", ctx.evil, i0.ɵɵsanitizeStyle)("attributeName", ctx.nonEvil, i0.ɵɵvalidateAttribute);
  } 
}
…
hostBindings: function HostBindingDir2_HostBindings(rf, ctx) {
  if (rf & 2) {
    i0.ɵɵdomProperty("innerHTML", ctx.evil, i0.ɵɵsanitizeHtml)("href", ctx.evil, i0.ɵɵsanitizeUrl)("src", ctx.evil)("sandbox", ctx.evil);
    i0.ɵɵattribute("style", ctx.evil, i0.ɵɵsanitizeStyle);
  } 
}
…
hostBindings: function HostBindingSvgAnimateDir_HostBindings(rf, ctx) {
  if (rf & 2) {
    i0.ɵɵattribute("attributeName", ctx.evil, i0.ɵɵvalidateAttribute);
  }
} 