const $arrowFn0$ = (ctx, view) => () => {
  const $ctx_r0$ = $r3$.ɵɵrestoreView(view);
  const $index_r2 = $ctx_r0$.$index;
  const ɵ$index_2_r3 = $ctx_r0$.$index;
  const ɵ$index_1_r4 = $r3$.ɵɵnextContext().$index;
  return $r3$.ɵɵresetView(ɵ$index_1_r4 % 2 === 0 || ɵ$index_2_r3 % 2 === 0 || $index_r2);
};
…
function TestComp_For_1_For_1_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵtext(0);
  }
  if (rf & 2) {
    $r3$.ɵɵtextInterpolate1(" ", $r3$.ɵɵarrowFunction(1, $arrowFn0$, ctx)(), " ");
  }
}
…
function TestComp_For_1_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵrepeaterCreate(0, TestComp_For_1_For_1_Template, 1, 2, null, null, $r3$.ɵɵrepeaterTrackByIndex);
  }
  if (rf & 2) {
    const item_r5 = ctx.$implicit;
    $r3$.ɵɵrepeater(item_r5.subItems);
  }
}
…
$r3$.ɵɵdefineComponent({
  …
  decls: 2,
  vars: 0,
  template: function TestComp_Template(rf, ctx) {
    if (rf & 1) {
      $r3$.ɵɵrepeaterCreate(0, TestComp_For_1_Template, 2, 0, null, null, $r3$.ɵɵrepeaterTrackByIndex);
    }
    if (rf & 2) {
      $r3$.ɵɵrepeater(ctx.items);
    }
  },
  …
});
