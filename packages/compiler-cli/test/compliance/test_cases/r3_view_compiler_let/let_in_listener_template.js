$r3$.ɵɵdefineComponent({
  …
  decls: 3,
  vars: 2,
  …
  template: function MyApp_Template(rf, ctx) {
    if (rf & 1) {
      const $_r1$ = $r3$.ɵɵgetCurrentView();
      $r3$.ɵɵdeclareLet(0)(1);
      $r3$.ɵɵdomElementStart(2, "button", 0);
      $r3$.ɵɵdomListener("click", function MyApp_Template_button_click_2_listener() {
        $r3$.ɵɵrestoreView($_r1$);
        const $one_1$ = $r3$.ɵɵreadContextLet(0);
        const $two_2$ = $r3$.ɵɵreadContextLet(1);
        return $r3$.ɵɵresetView(ctx.callback($one_1$, $two_2$));
      });
      $r3$.ɵɵdomElementEnd();
    }
    if (rf & 2) {
      const $one_r1$ = $r3$.ɵɵstoreLet(ctx.value + 1);
      $r3$.ɵɵadvance();
      $r3$.ɵɵstoreLet($one_r1$ + 1);
    }
  },
  …
});
