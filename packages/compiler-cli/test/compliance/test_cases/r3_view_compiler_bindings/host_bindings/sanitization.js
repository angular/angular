hostBindings: function HostBindingDir_HostBindings(rf, ctx) {
  if (rf & 2) {
    $r3$.ɵɵdomProperty("innerHTML", ctx.evil, $r3$.ɵɵsanitizeHtml)("href", ctx.evil, $r3$.ɵɵsanitizeUrlOrResourceUrl)("src", ctx.evil, $r3$.ɵɵsanitizeUrlOrResourceUrl)("sandbox", ctx.evil, $r3$.ɵɵvalidateIframeAttribute);
    $r3$.ɵɵattribute("style", ctx.evil, $r3$.ɵɵsanitizeStyle);
  } 
}
…
hostBindings: function HostBindingDir2_HostBindings(rf, ctx) {
  if (rf & 2) {
    $r3$.ɵɵdomProperty("innerHTML", ctx.evil, $r3$.ɵɵsanitizeHtml)("href", ctx.evil, $r3$.ɵɵsanitizeUrl)("src", ctx.evil)("sandbox", ctx.evil, $r3$.ɵɵvalidateIframeAttribute);
    $r3$.ɵɵattribute("style", ctx.evil, $r3$.ɵɵsanitizeStyle);
  } 
}
