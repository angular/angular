$r3$.ɵɵdefineComponent({
  …
  decls: 7,
  vars: 3,
  …
  template: function MyApp_Template(rf, ctx) {
    if (rf & 1) {
      const $_r1$ = $r3$.ɵɵgetCurrentView();
      $r3$.ɵɵtext(0);
      $r3$.ɵɵdeclareLet(1)(2)(3)(4);
      $r3$.ɵɵtext(5);
      $r3$.ɵɵelementStart(6, "button", 0);
      $r3$.ɵɵlistener("click", function MyApp_Template_button_click_6_listener() {
        $r3$.ɵɵrestoreView($_r1$);
        const $three_1$ = $r3$.ɵɵreadContextLet(3);
        return $r3$.ɵɵresetView(ctx.callback($three_1$));
      });
      $r3$.ɵɵelementEnd();
    }
    if (rf & 2) {
      $r3$.ɵɵtextInterpolate1(" ", ctx.value, " ");
      const $one_2$ = ctx.value + 1;
      const $two_3$ = $one_2$ + 1;
      $r3$.ɵɵadvance(3);
      const $three_5$ = $r3$.ɵɵstoreLet($two_3$ + 1);
      $three_5$ + 1;
      $r3$.ɵɵadvance(2);
      $r3$.ɵɵtextInterpolate1(" ", ctx.value, " ");
    }
  },
  …
});
