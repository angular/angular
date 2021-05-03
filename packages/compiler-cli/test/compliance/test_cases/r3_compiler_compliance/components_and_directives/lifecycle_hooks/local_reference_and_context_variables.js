function MyComponent_div_0_span_3_Template(rf, ctx) {
  if (rf & 1) {
    $i0$.ɵɵelementStart(0, "span");
    $i0$.ɵɵtext(1);
    $i0$.ɵɵelementEnd();
  }
  if (rf & 2) {
    const $item$ = $i0$.ɵɵnextContext().$implicit;
    const $foo$ = $i0$.ɵɵreference(2);
    $r3$.ɵɵadvance(1);
    $i0$.ɵɵtextInterpolate2(" ", $foo$, " - ", $item$, " ");
  }
}

function MyComponent_div_0_Template(rf, ctx) {
  if (rf & 1) {
    $i0$.ɵɵelementStart(0, "div");
    $i0$.ɵɵelement(1, "div", null, 1);
    $i0$.ɵɵtemplate(3, MyComponent_div_0_span_3_Template, 2, 2, "span", 2);
    $i0$.ɵɵelementEnd();
  }
  if (rf & 2) {
    const $app$ = $i0$.ɵɵnextContext();
    $r3$.ɵɵadvance(3);
    $i0$.ɵɵproperty("ngIf", $app$.showing);
  }
}

// ...
consts: [[__AttributeMarker.Template__, "ngFor", "ngForOf"], ["foo", ""], [__AttributeMarker.Template__, "ngIf"]],
template:function MyComponent_Template(rf, ctx){
  if (rf & 1) {
    $i0$.ɵɵtemplate(0, MyComponent_div_0_Template, 4, 1, "div", 0);
  }
  if (rf & 2) {
    $i0$.ɵɵproperty("ngForOf", ctx.items);
  }
}
