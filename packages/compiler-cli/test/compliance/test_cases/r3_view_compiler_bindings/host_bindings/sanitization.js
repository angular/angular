hostBindings: function HostBindingLinkDir_HostBindings(rf, ctx) {
  if (rf & 2) {
    $r3$.ɵɵdomProperty("innerHTML", ctx.evil, $r3$.ɵɵsanitizeHtml)("href", ctx.evil, $r3$.ɵɵsanitizeUrlOrResourceUrl);
    $r3$.ɵɵattribute("style", ctx.evil, $r3$.ɵɵsanitizeStyle);
  }
}
…
hostBindings: function HostBindingImageDir_HostBindings(rf, ctx) {
  if (rf & 2) {
    i0.ɵɵdomProperty("innerHTML", ctx.evil, i0.ɵɵsanitizeHtml)("src", ctx.nonEvil, i0.ɵɵsanitizeUrlOrResourceUrl);
    i0.ɵɵattribute("style", ctx.evil, i0.ɵɵsanitizeStyle);
  }
}
…
hostBindings: function HostBindingIframeDir_HostBindings(rf, ctx) {
  if (rf & 2) {
    $r3$.ɵɵdomProperty("innerHTML", ctx.evil, $r3$.ɵɵsanitizeHtml)("src", ctx.evil, i0.ɵɵsanitizeUrlOrResourceUrl)("sandbox", ctx.evil, $r3$.ɵɵvalidateAttribute);
    $r3$.ɵɵattribute("style", ctx.evil, $r3$.ɵɵsanitizeStyle)("attributeName", ctx.nonEvil, i0.ɵɵvalidateAttribute);
  }
}
…
hostBindings: function HostBindingSvgAnimateDir_HostBindings(rf, ctx) {
  if (rf & 2) {
    i0.ɵɵattribute("attributeName", ctx.evil, i0.ɵɵvalidateAttribute);
  }
} 
…
hostBindings: function HostBindingCustomSrcdocDir_HostBindings(rf, ctx) {
  if (rf & 2) {
    i0.ɵɵattribute("srcdoc", ctx.evil, i0.ɵɵsanitizeHtml);
  }
}
…
hostBindings: function HostBindingCustomSrcDir_HostBindings(rf, ctx) {
  if (rf & 2) {
    i0.ɵɵattribute("src", ctx.evil, i0.ɵɵsanitizeUrlOrResourceUrl);
  }
}
…
hostBindings: function HostBindingCustomDataDir_HostBindings(rf, ctx) {
  if (rf & 2) {
    i0.ɵɵattribute("data", ctx.evil, i0.ɵɵsanitizeUrlOrResourceUrl);
  }
}
