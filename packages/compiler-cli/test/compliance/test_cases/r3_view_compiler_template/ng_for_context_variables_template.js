function MyComponent_span_0_Template(rf, ctx) {
  if (rf & 1) {
    $i0$.ɵɵelementStart(0, "span");
    $i0$.ɵɵtext(1);
    $i0$.ɵɵelementEnd();
  }
  if (rf & 2) {
    const $item$ = ctx.$implicit;
    const $i$ = ctx.index;
    $r3$.ɵɵadvance(1);
    $i0$.ɵɵtextInterpolate2(" ", $i$, " - ", $item$, " ");
  }
}
…
consts: [[__AttributeMarker.Template__, "ngFor", "ngForOf"]],
template:function MyComponent_Template(rf, ctx){
  if (rf & 1) {
    $i0$.ɵɵtemplate(0, MyComponent_span_0_Template, 2, 2, "span", 0);
  }
  if (rf & 2) {
    $i0$.ɵɵproperty("ngForOf", ctx.items);
  }
}
