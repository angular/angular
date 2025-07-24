const $c1$ = [[["span", "title", "tofirst"]], [["span", "title", "tosecond"]]];
// ...
ComplexComponent.ɵcmp = /*@__PURE__*/ $r3$.ɵɵdefineComponent({
  type: ComplexComponent,
  selectors: [["complex"]],
  standalone: false,
  ngContentSelectors: $c2$,
  decls: 4,
  vars: 0,
  consts: [["id","first"], ["id","second"]],
  template:  function ComplexComponent_Template(rf, ctx) {
    if (rf & 1) {
      $r3$.ɵɵprojectionDef($c1$);
      $r3$.ɵɵelementStart(0, "div", 0);
      $r3$.ɵɵprojection(1);
      $r3$.ɵɵelementEnd();
      $r3$.ɵɵelementStart(2, "div", 1);
      $r3$.ɵɵprojection(3, 1);
      $r3$.ɵɵelementEnd();
    }
  },
  encapsulation: 2
});
