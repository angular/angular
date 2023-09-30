function MyComponent_div_3_span_2_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵelementStart(0, "span");
    $r3$.ɵɵtext(1);
    $r3$.ɵɵelementEnd();
  }
  if (rf & 2) {
    $r3$.ɵɵnextContext();
    const $bar$ = $r3$.ɵɵreference(4);
    $r3$.ɵɵnextContext();
    const $foo$ = $r3$.ɵɵreference(1);
    const $baz$ = $r3$.ɵɵreference(5);
    $r3$.ɵɵadvance(1);
    $r3$.ɵɵtextInterpolate3("", $foo$, "-", $bar$, "-", $baz$, "");
  }
}
function MyComponent_div_3_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵelementStart(0, "div");
    $r3$.ɵɵtext(1);
    $r3$.ɵɵtemplate(2, MyComponent_div_3_span_2_Template, 2, 3, "span", 1);
    $r3$.ɵɵelement(3, "span", null, 3);
    $r3$.ɵɵelementEnd();
  }
  if (rf & 2) {
    const $bar$ = $r3$.ɵɵreference(4);
    $r3$.ɵɵnextContext();
    const $foo$ = $r3$.ɵɵreference(1);
    $r3$.ɵɵadvance(1);
    $r3$.ɵɵtextInterpolate2(" ", $foo$, "-", $bar$, " ");
  }
}
// ...
MyComponent.ɵcmp = /*@__PURE__*/ $r3$.ɵɵdefineComponent({
  type: MyComponent,
  selectors: [["my-component"]],
  decls: 6,
  vars: 1,
  consts: [["foo", ""], [__AttributeMarker.Template__, "if"], ["baz", ""], ["bar", ""]],
  template:  function MyComponent_Template(rf, ctx) {
    if (rf & 1) {
      $r3$.ɵɵelement(0, "div", null, 0);
      $r3$.ɵɵtext(2);
      $r3$.ɵɵtemplate(3, MyComponent_div_3_Template, 5, 2, "div", 1);
      $r3$.ɵɵelement(4, "div", null, 2);
    }
    if (rf & 2) {
      const $foo$ = $r3$.ɵɵreference(1);
      $r3$.ɵɵadvance(2);
      $r3$.ɵɵtextInterpolate1(" ", $foo$, " ");
    }
  },
  dependencies:[IfDirective],
  encapsulation: 2
});
