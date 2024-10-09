$r3$.ɵɵdefineComponent({
  …
  decls: 4,
  vars: 1,
  …
  template: function MyApp_Template(rf, ctx) {
    if (rf & 1) {
      $r3$.ɵɵdeclareLet(0);
      $r3$.ɵɵtext(1);
      $r3$.ɵɵelement(2, "input", null, 0);
    }
    if (rf & 2) {
      const $name_r1$ = $r3$.ɵɵreference(3);
      const $message_1$ = "Hello, " + $name_r1$.value;
      $r3$.ɵɵadvance();
      $r3$.ɵɵtextInterpolate1(" ", $message_1$, " ");
    }
  },
  …
});
