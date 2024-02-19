template: function MyComponent_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵelement(0, "div", 0)(1, "link", 1)(2, "div")(3, "img", 2)(4, "iframe", 3)(5, "a", 1)(6, "div");
  }
  if (rf & 2) {
    i0.ɵɵproperty("innerHtml", ctx.evil, i0.ɵɵsanitizeHtml);
    i0.ɵɵadvance();
    i0.ɵɵproperty("href", ctx.evil, i0.ɵɵsanitizeResourceUrl);
    i0.ɵɵadvance();
    i0.ɵɵattribute("style", ctx.evil, i0.ɵɵsanitizeStyle);
    i0.ɵɵadvance();
    i0.ɵɵproperty("src", ctx.evil, i0.ɵɵsanitizeUrl);
    i0.ɵɵadvance();
    i0.ɵɵproperty("sandbox", ctx.evil, i0.ɵɵvalidateIframeAttribute);
    i0.ɵɵadvance();
    i0.ɵɵpropertyInterpolate2("href", "", ctx.evil, "", ctx.evil, "", i0.ɵɵsanitizeUrl);
    i0.ɵɵadvance();
    i0.ɵɵattributeInterpolate2("style", "", ctx.evil, "", ctx.evil, "", i0.ɵɵsanitizeStyle);
  }
}
