$r3$.ɵɵdefineComponent({
  …
  decls: 3,
  vars: 1,
  …
  template: function MyApp_Template(rf, ctx) {
    if (rf & 1) {
      $r3$.ɵɵtext(0);
      $r3$.ɵɵelement(1, "input", null, 0);
    }
    if (rf & 2) {
      const $name_r1$ = $r3$.ɵɵreference(2);
      const $message_1$ = "Hello, " + $name_r1$.value;
      $r3$.ɵɵtextInterpolate1(" ", $message_1$, " ");
    }
  },
  …
});
