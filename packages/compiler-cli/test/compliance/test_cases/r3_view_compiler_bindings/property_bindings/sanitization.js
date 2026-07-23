template: function MyComponent_Template(rf, ctx) {
  …
  if (rf & 2) {
    $r3$.ɵɵdomProperty("innerHTML", ctx.evil, $r3$.ɵɵsanitizeHtml);
    $r3$.ɵɵadvance();
    $r3$.ɵɵdomProperty("href", ctx.evil, $r3$.ɵɵsanitizeResourceUrl);
    $r3$.ɵɵadvance();
    $r3$.ɵɵattribute("style", ctx.evil, $r3$.ɵɵsanitizeStyle);
    $r3$.ɵɵadvance();
    $r3$.ɵɵdomProperty("src", ctx.nonEvil, $r3$.ɵɵsanitizeUrl);
    $r3$.ɵɵadvance();
    $r3$.ɵɵdomProperty("sandbox", ctx.evil, $r3$.ɵɵvalidateAttribute);
    $r3$.ɵɵadvance();
    $r3$.ɵɵdomProperty("href", $r3$.ɵɵinterpolate2("", ctx.evil, "", ctx.evil), $r3$.ɵɵsanitizeUrl);
    $r3$.ɵɵadvance();
    $r3$.ɵɵattribute("style", $r3$.ɵɵinterpolate2("", ctx.evil, "", ctx.evil), $r3$.ɵɵsanitizeStyle);
    $r3$.ɵɵadvance();
    $r3$.ɵɵtwoWayProperty("innerHTML", ctx.evil, $r3$.ɵɵsanitizeHtml);
    $r3$.ɵɵadvance();
    $r3$.ɵɵtwoWayProperty("innerHTML", ctx.evil, $r3$.ɵɵsanitizeHtml);
    $r3$.ɵɵadvance();
    $r3$.ɵɵtwoWayProperty("srcdoc", ctx.evil, $r3$.ɵɵsanitizeHtml);
    $r3$.ɵɵadvance();
    $r3$.ɵɵtwoWayProperty("srcdoc", ctx.evil, $r3$.ɵɵsanitizeHtml);
    $r3$.ɵɵadvance();
    $r3$.ɵɵtwoWayProperty("src", ctx.evil, $r3$.ɵɵsanitizeUrl);
    $r3$.ɵɵadvance();
    $r3$.ɵɵtwoWayProperty("src", ctx.evil, $r3$.ɵɵsanitizeResourceUrl);
    $r3$.ɵɵadvance();
    $r3$.ɵɵtwoWayProperty("data", ctx.evil, $r3$.ɵɵsanitizeResourceUrl);
    $r3$.ɵɵadvance();
    $r3$.ɵɵtwoWayProperty("href", ctx.evil, $r3$.ɵɵsanitizeResourceUrl);
    $r3$.ɵɵadvance();
    $r3$.ɵɵtwoWayProperty("sandbox", ctx.evil, $r3$.ɵɵvalidateAttribute);
  }
}
