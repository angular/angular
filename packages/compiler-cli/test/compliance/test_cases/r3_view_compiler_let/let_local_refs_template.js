$r3$.ɵɵdefineComponent({
  …
  decls: 6,
  vars: 1,
  …
  template: function MyApp_Template(rf, ctx) {
    if (rf & 1) {
      $r3$.ɵɵelement(0, "input", null, 0)(2, "input", null, 1);
      $r3$.ɵɵdeclareLet(4);
      $r3$.ɵɵtext(5);
    }
    if (rf & 2) {
      const $name_r1$ = $r3$.ɵɵreference(1);
      const $lastName_r2$ = $r3$.ɵɵreference(3);
      const $fullName_2$ = $name_r1$.value + " " + $lastName_r2$.value;
      $r3$.ɵɵadvance(5);
      $r3$.ɵɵtextInterpolate1(" Hello, ", $fullName_2$, " ");
    }
  },
  …
});
