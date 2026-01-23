function MyApp_For_1_For_2_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵtext(0);
  }
  if (rf & 2) {
    const ɵ$index_3_r1 = ctx.$index;
    $r3$.ɵɵnextContext();
    const $outerFirst_1$ = $r3$.ɵɵreadContextLet(0);
    const $innerFirst_2$ = ɵ$index_3_r1 === 0;
    $r3$.ɵɵtextInterpolate1(" ", $outerFirst_1$ || $innerFirst_2$, " ");
  }
}

…

function MyApp_For_1_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵdeclareLet(0);
    $r3$.ɵɵrepeaterCreate(1, MyApp_For_1_For_2_Template, 1, 1, null, null, $r3$.ɵɵrepeaterTrackByIdentity);
  }
  if (rf & 2) {
    const $item_r4$ = ctx.$implicit;
    const ɵ$index_1_r5 = ctx.$index;
    $r3$.ɵɵstoreLet(ɵ$index_1_r5 === 0);
    $r3$.ɵɵadvance();
    $r3$.ɵɵrepeater($item_r4$.children);
  }
}

…

$r3$.ɵɵdefineComponent({
  …
  decls: 2,
  vars: 0,
  template: function MyApp_Template(rf, ctx) {
    if (rf & 1) {
      $r3$.ɵɵrepeaterCreate(0, MyApp_For_1_Template, 3, 1, null, null, $r3$.ɵɵrepeaterTrackByIdentity);
    }
    if (rf & 2) {
      $r3$.ɵɵrepeater(ctx.items);
    }
  },
  …
});
