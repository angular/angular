function MyComponent_div_0_div_1_div_1_Template(rf, ctx) {
  if (rf & 1) {
    $i0$.ɵɵelementStart(0, "div");
    $i0$.ɵɵtext(1);
    $i0$.ɵɵelementEnd();
  }
  if (rf & 2) {
    const $middle$ = $i0$.ɵɵnextContext().$implicit;
    const $myComp$ = $i0$.ɵɵnextContext(2);
    $r3$.ɵɵadvance(1);
    $i0$.ɵɵtextInterpolate2(" ", $middle$.value, " - ", $myComp$.name, " ");
  }
}

function MyComponent_div_0_div_1_Template(rf, ctx) {
  if (rf & 1) {
    $i0$.ɵɵelementStart(0, "div");
    $i0$.ɵɵtemplate(1, MyComponent_div_0_div_1_div_1_Template, 2, 2, "div", 0);
    $i0$.ɵɵelementEnd();
  }
  if (rf & 2) {
    const $middle$ = ctx.$implicit;
    $r3$.ɵɵadvance(1);
    $i0$.ɵɵproperty("ngForOf", $middle$.items);
  }
}

function MyComponent_div_0_Template(rf, ctx) {
  if (rf & 1) {
    $i0$.ɵɵelementStart(0, "div");
    $i0$.ɵɵtemplate(1, MyComponent_div_0_div_1_Template, 2, 1, "div", 0);
    $i0$.ɵɵelementEnd();
  }
  if (rf & 2) {
    const $outer$ = ctx.$implicit;
    $r3$.ɵɵadvance(1);
    $i0$.ɵɵproperty("ngForOf", $outer$.items);
  }
}
…
consts: [[__AttributeMarker.Template__, "ngFor", "ngForOf"]],
template: function MyComponent_Template(rf, ctx){
  if (rf & 1) {
    $i0$.ɵɵtemplate(0, MyComponent_div_0_Template, 2, 1, "div", 0);
  }
  if (rf & 2) {
    $i0$.ɵɵproperty("ngForOf", ctx.items);
  }
}
