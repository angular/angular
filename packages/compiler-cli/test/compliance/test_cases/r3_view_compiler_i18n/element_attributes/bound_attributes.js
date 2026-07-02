consts: [[3, "title"]],
template: function MyComponent_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵelement(0, "div", 0);
  }
  if (rf & 2) {
    $r3$.ɵɵproperty("title", ctx.title);
    $r3$.ɵɵattribute("label", ctx.label);
  }
}
