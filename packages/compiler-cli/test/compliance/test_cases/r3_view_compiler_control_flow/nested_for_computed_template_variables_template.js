function MyApp_For_1_For_2_For_4_Template(rf, ctx) {
  …
  if (rf & 2) {
    const $index_r14$ = ctx.$index;
    const $count_r16$ = ctx.$count;
    const $ctx_r18$ = $r3$.ɵɵnextContext();
    const $index_2_r9$ = $ctx_r18$.$index;
    const $count_2_r11$ = $ctx_r18$.$count;
    const $ctx_r19$ = $r3$.ɵɵnextContext();
    const $index_2_r3$ = $ctx_r19$.$index;
    const $count_2_r5$ = $ctx_r19$.$count;
    $r3$.ɵɵtextInterpolate4(" Innermost vars: ", $index_r14$ % 2 !== 0, " ", $index_r14$ % 2 === 0, " ", $index_r14$ === 0, " ", $index_r14$ === $count_r16$ - 1, " ");
    $r3$.ɵɵadvance(2);
    $r3$.ɵɵtextInterpolate4(" Inner vars: ", $index_2_r9$ % 2 !== 0, " ", $index_2_r9$ % 2 === 0, " ", $index_2_r9$ === 0, " ", $index_2_r9$ === $count_2_r11$ - 1, " ");
    $r3$.ɵɵadvance(2);
    $r3$.ɵɵtextInterpolate4(" Outer vars: ", $index_2_r3$ % 2 !== 0, " ", $index_2_r3$ % 2 === 0, " ", $index_2_r3$ === 0, " ", $index_2_r3$ === $count_2_r5$ - 1, " ");
  }
}

function MyApp_For_1_For_2_Template(rf, ctx) {
  …
  if (rf & 2) {
    const $index_r8$ = ctx.$index;
    const $count_r10$ = ctx.$count;
    const $ctx_r20$ = $r3$.ɵɵnextContext();
    const $index_1_r3$ = $ctx_r20$.$index;
    const $count_1_r5$ = $ctx_r20$.$count;
    const $ctx_r6$ = $r3$.ɵɵnextContext();
    $r3$.ɵɵtextInterpolate4(" Inner vars: ", $index_r8$ % 2 !== 0, " ", $index_r8$ % 2 === 0, " ", $index_r8$ === 0, " ", $index_r8$ === $count_r10$ - 1, " ");
    $r3$.ɵɵadvance(2);
    $r3$.ɵɵtextInterpolate4(" Outer vars: ", $index_1_r3$ % 2 !== 0, " ", $index_1_r3$ % 2 === 0, " ", $index_1_r3$ === 0, " ", $index_1_r3$ === $count_1_r5$ - 1, " ");
    $r3$.ɵɵadvance();
    $r3$.ɵɵrepeater($ctx_r6$.items);
  }
}
…
function MyApp_For_1_Template(rf, ctx) {
  …
  if (rf & 2) {
    const $index_r2$ = ctx.$index;
    const $count_r4$ = ctx.$count;
    const $ctx_r0$ = $r3$.ɵɵnextContext();
    $r3$.ɵɵtextInterpolate4(" Outer vars: ", $index_r2$ % 2 !== 0, " ", $index_r2$ % 2 === 0, " ", $index_r2$ === 0, " ", $index_r2$ === $count_r4$ - 1, " ");
    $r3$.ɵɵadvance();
    $r3$.ɵɵrepeater($ctx_r0$.items);
  }
}
…
function MyApp_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵrepeaterCreate(0, MyApp_For_1_Template, 3, 4, null, null, $r3$.ɵɵrepeaterTrackByIdentity);
  }
  if (rf & 2) {
    $r3$.ɵɵrepeater(ctx.items);
  }
}
