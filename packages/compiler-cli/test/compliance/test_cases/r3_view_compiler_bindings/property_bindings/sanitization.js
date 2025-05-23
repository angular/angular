template: function MyComponent_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵelement(0, "div", 0)(1, "link", 1)(2, "div")(3, "img", 2)(4, "iframe", 3)(5, "a", 1)(6, "div");
  }
  if (rf & 2) {
    $r3$.ɵɵproperty("innerHtml", ctx.evil, $r3$.ɵɵsanitizeHtml);
    $r3$.ɵɵadvance();
    $r3$.ɵɵproperty("href", ctx.evil, $r3$.ɵɵsanitizeResourceUrl);
    $r3$.ɵɵadvance();
    $r3$.ɵɵattribute("style", ctx.evil, $r3$.ɵɵsanitizeStyle);
    $r3$.ɵɵadvance();
    $r3$.ɵɵproperty("src", ctx.evil, $r3$.ɵɵsanitizeUrl);
    $r3$.ɵɵadvance();
    $r3$.ɵɵproperty("sandbox", ctx.evil, $r3$.ɵɵvalidateIframeAttribute);
    $r3$.ɵɵadvance();
    $r3$.ɵɵproperty("href", $r3$.ɵɵinterpolate2("", ctx.evil, "", ctx.evil), $r3$.ɵɵsanitizeUrl);
    $r3$.ɵɵadvance();
    $r3$.ɵɵattribute("style", $r3$.ɵɵinterpolate2("", ctx.evil, "", ctx.evil), $r3$.ɵɵsanitizeStyle);
  }
}
