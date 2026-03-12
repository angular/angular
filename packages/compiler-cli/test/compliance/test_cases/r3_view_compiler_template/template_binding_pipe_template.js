function MyComponent_div_0_Template(rf, ctx) {
  if (rf & 1) {
    $i0$.ɵɵelement(0, "div");
  }
}

…
consts: [[__AttributeMarker.Template__, "ngIf"]],
template: function MyComponent_Template(rf, ctx) {
  if (rf & 1) {
    $i0$.ɵɵtemplate(0, MyComponent_div_0_Template, 1, 0, "div", 0);
    $i0$.ɵɵpipe(1, "pipe");
  } if (rf & 2) {
    $i0$.ɵɵproperty("ngIf", $i0$.ɵɵpipeBind1(1, 1, ctx.val));
  }
}
