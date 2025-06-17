$r3$.ɵɵdefineComponent({
  …
  decls: 4,
  vars: 3,
  …
  template: function MyApp_Template(rf, ctx) {
    if (rf & 1) {
      const $_r1$ = $r3$.ɵɵgetCurrentView();
      $r3$.ɵɵtext(0);
      $r3$.ɵɵdeclareLet(1);
      $r3$.ɵɵtext(2);
      $r3$.ɵɵdomElementStart(3, "button", 0);
      $r3$.ɵɵdomListener("click", function MyApp_Template_button_click_3_listener() {
        $r3$.ɵɵrestoreView($_r1$);
        const $three_1$ = $r3$.ɵɵreadContextLet(1);
        return $r3$.ɵɵresetView(ctx.callback($three_1$));
      });
      $r3$.ɵɵdomElementEnd();
    }
    if (rf & 2) {
      $r3$.ɵɵtextInterpolate1(" ", ctx.value, " ");
      const $one_2$ = ctx.value + 1;
      const $two_3$ = $one_2$ + 1;
      $r3$.ɵɵadvance();
      const $three_5$ = $r3$.ɵɵstoreLet($two_3$ + 1);
      $three_5$ + 1;
      $r3$.ɵɵadvance();
      $r3$.ɵɵtextInterpolate1(" ", ctx.value, " ");
    }
  },
  …
});
