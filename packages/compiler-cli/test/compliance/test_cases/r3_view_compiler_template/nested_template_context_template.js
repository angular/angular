function MyComponent_ul_0_li_1_div_1_Template(rf, ctx) {
  if (rf & 1) {
    const $s$ = $i0$.ɵɵgetCurrentView();
    $i0$.ɵɵelementStart(0, "div", 2);
    $i0$.ɵɵlistener("click", function MyComponent_ul_0_li_1_div_1_Template_div_click_0_listener(){
      const $sr$ = $i0$.ɵɵrestoreView($s$);
      const $inner$ = $sr$.$implicit;
      const $middle$ = $i0$.ɵɵnextContext().$implicit;
      const $outer$ = $i0$.ɵɵnextContext().$implicit;
      const $myComp$ = $i0$.ɵɵnextContext();
      return $i0$.ɵɵresetView($myComp$.onClick($outer$, $middle$, $inner$));
    });
    $i0$.ɵɵtext(1);
    $i0$.ɵɵelementEnd();
  }

  if (rf & 2) {
    const $inner1$ = ctx.$implicit;
    const $middle1$ = $i0$.ɵɵnextContext().$implicit;
    const $outer1$ = $i0$.ɵɵnextContext().$implicit;
    const $myComp1$ = $i0$.ɵɵnextContext();
    $i0$.ɵɵproperty("title", $myComp1$.format($outer1$, $middle1$, $inner1$, $myComp1$.component));
    $r3$.ɵɵadvance(1);
    $i0$.ɵɵtextInterpolate1(" ", $myComp1$.format($outer1$, $middle1$, $inner1$, $myComp1$.component), " ");
  }
}

function MyComponent_ul_0_li_1_Template(rf, ctx) {
  if (rf & 1) {
    $i0$.ɵɵelementStart(0, "li");
    $i0$.ɵɵtemplate(1, MyComponent_ul_0_li_1_div_1_Template, 2, 2, "div", 1);
    $i0$.ɵɵelementEnd();
  }
  if (rf & 2) {
    const $myComp2$ = $i0$.ɵɵnextContext(2);
    $r3$.ɵɵadvance(1);
    $i0$.ɵɵproperty("ngForOf", $myComp2$.items);
  }
}

function MyComponent_ul_0_Template(rf, ctx) {
  if (rf & 1) {
    $i0$.ɵɵelementStart(0, "ul");
    $i0$.ɵɵtemplate(1, MyComponent_ul_0_li_1_Template, 2, 1, "li", 0);
    $i0$.ɵɵelementEnd();
  }
  if (rf & 2) {
    const $outer2$ = ctx.$implicit;
    $r3$.ɵɵadvance(1);
    $i0$.ɵɵproperty("ngForOf", $outer2$.items);
  }
}
…
consts: [
  [__AttributeMarker.Template__, "ngFor", "ngForOf"],
  [__AttributeMarker.Bindings__, "title", "click", __AttributeMarker.Template__, "ngFor", "ngForOf"],
  [__AttributeMarker.Bindings__, "title", "click"]
],
template:function MyComponent_Template(rf, ctx){
  if (rf & 1) {
    $i0$.ɵɵtemplate(0, MyComponent_ul_0_Template, 2, 1, "ul", 0);
  }
  if (rf & 2) {
    $i0$.ɵɵproperty("ngForOf", ctx.items);
  }
}
