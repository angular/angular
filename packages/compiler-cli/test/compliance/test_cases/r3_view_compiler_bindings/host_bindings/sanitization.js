hostBindings: function HostBindingDir_HostBindings(rf, ctx) {
  if (rf & 2) {
    i0.ɵɵhostProperty("innerHtml", ctx.evil, i0.ɵɵsanitizeHtml)("href", ctx.evil, i0.ɵɵsanitizeUrlOrResourceUrl)("src", ctx.evil, i0.ɵɵsanitizeUrlOrResourceUrl)("sandbox", ctx.evil, i0.ɵɵvalidateIframeAttribute);
    i0.ɵɵattribute("style", ctx.evil, i0.ɵɵsanitizeStyle);
  } 
}
…
hostBindings: function HostBindingDir2_HostBindings(rf, ctx) {
  if (rf & 2) {
    i0.ɵɵhostProperty("innerHtml", ctx.evil, i0.ɵɵsanitizeHtml)("href", ctx.evil, i0.ɵɵsanitizeUrl)("src", ctx.evil)("sandbox", ctx.evil, i0.ɵɵvalidateIframeAttribute);
    i0.ɵɵattribute("style", ctx.evil, i0.ɵɵsanitizeStyle);
  } 
}
