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
    $r3$.ɵɵdomProperty("innerHTML", ctx.evil, $r3$.ɵɵsanitizeHtml)("src", ctx.evil, $r3$.ɵɵsanitizeResourceUrl)("sandbox", ctx.evil, $r3$.ɵɵvalidateIframeAttribute);
    $r3$.ɵɵattribute("style", ctx.evil, $r3$.ɵɵsanitizeStyle);
  }
}
