consts: [["allow", "camera 'none'"]],
template: function MyComponent_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵelement(0, "iframe", 0);
  } if (rf & 2) {
    i0.ɵɵattribute("fetchpriority", "low", i0.ɵɵvalidateIframeAttribute)("allowfullscreen", ctx.fullscreen, i0.ɵɵvalidateIframeAttribute);
  }
}
