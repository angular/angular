hostBindings: function HostBindingLinkDir_HostBindings(rf, ctx) {
  if (rf & 2) {
    $r3$.ɵɵdomProperty("innerHTML", ctx.evil, $r3$.ɵɵsanitizeHtml)("href", ctx.evil, $r3$.ɵɵsanitizeUrl);
    $r3$.ɵɵattribute("style", ctx.evil, $r3$.ɵɵsanitizeStyle);
  }
}
…
hostBindings: function HostBindingImageDir_HostBindings(rf, ctx) {
  if (rf & 2) {
    $r3$.ɵɵdomProperty("innerHTML", ctx.evil, $r3$.ɵɵsanitizeHtml)("src", ctx.evil, $r3$.ɵɵsanitizeUrl);
    $r3$.ɵɵattribute("style", ctx.evil, $r3$.ɵɵsanitizeStyle);
  }
}
…
hostBindings: function HostBindingIframeDir_HostBindings(rf, ctx) {
  if (rf & 2) {
    $r3$.ɵɵdomProperty("innerHTML", ctx.evil, $r3$.ɵɵsanitizeHtml)("src", ctx.evil, $r3$.ɵɵsanitizeResourceUrl)("sandbox", ctx.evil, $r3$.ɵɵvalidateAttribute);
    $r3$.ɵɵattribute("style", ctx.evil, $r3$.ɵɵsanitizeStyle)("attributeName", ctx.nonEvil);
  }
}
…
hostBindings: function HostBindingSvgAnimateDir_HostBindings(rf, ctx) {
  if (rf & 2) {
    i0.ɵɵattribute("attributeName", ctx.evil, i0.ɵɵvalidateAttribute);
  }
} 
