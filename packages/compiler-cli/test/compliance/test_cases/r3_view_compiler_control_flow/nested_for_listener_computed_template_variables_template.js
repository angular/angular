function MyApp_For_1_For_2_For_3_Template(rf, ctx) {
  if (rf & 1) {
    const $_r19$ = $r3$.ɵɵgetCurrentView();
    $r3$.ɵɵelementStart(0, "button", 0);
    $r3$.ɵɵlistener("click", function MyApp_For_1_For_2_For_3_Template_button_click_0_listener() {
      const $restoredCtx$ = $r3$.ɵɵrestoreView($_r19$);
      const $index_r14$ = $restoredCtx$.$index;
      const $count_r16$ = $restoredCtx$.$count;
      const $ctx_r18$ = $r3$.ɵɵnextContext(3);
      return $r3$.ɵɵresetView($ctx_r18$.innermostCb($index_r14$ % 2 !== 0, $index_r14$ % 2 === 0, $index_r14$ === 0, $index_r14$ === $count_r16$ - 1));
    });
    $r3$.ɵɵelementEnd();
    $r3$.ɵɵelementStart(1, "button", 0);
    $r3$.ɵɵlistener("click", function MyApp_For_1_For_2_For_3_Template_button_click_1_listener() {
      $r3$.ɵɵrestoreView($_r19$);
      const $ctx_r21$ = $r3$.ɵɵnextContext();
      const $index_2_r9$ = $ctx_r21$.$index;
      const $count_2_r11$ = $ctx_r21$.$count;
      const $ctx_r20$ = $r3$.ɵɵnextContext(2);
      return $r3$.ɵɵresetView($ctx_r20$.innerCb($index_2_r9$ % 2 !== 0, $index_2_r9$ % 2 === 0, $index_2_r9$ === 0, $index_2_r9$ === $count_2_r11$ - 1));
    });
    $r3$.ɵɵelementEnd();
    $r3$.ɵɵelementStart(2, "button", 0);
    $r3$.ɵɵlistener("click", function MyApp_For_1_For_2_For_3_Template_button_click_2_listener() {
      $r3$.ɵɵrestoreView($_r19$);
      const $ctx_r23$ = $r3$.ɵɵnextContext(2);
      const $index_1_r3$ = $ctx_r23$.$index;
      const $count_1_r5$ = $ctx_r23$.$count;
      const $ctx_r22$ = $r3$.ɵɵnextContext();
      return $r3$.ɵɵresetView($ctx_r22$.outerCb($index_1_r3$ % 2 !== 0, $index_1_r3$ % 2 === 0, $index_1_r3$ === 0, $index_1_r3$ === $count_1_r5$ - 1));
    });
    $r3$.ɵɵelementEnd();
  }
}
…
function MyApp_For_1_For_2_Template(rf, ctx) {
  if (rf & 1) {
    const $_r25$ = $r3$.ɵɵgetCurrentView();
    $r3$.ɵɵelementStart(0, "button", 0);
    $r3$.ɵɵlistener("click", function MyApp_For_1_For_2_Template_button_click_0_listener() {
      const $restoredCtx2$ = $r3$.ɵɵrestoreView($_r25$);
      const $index_r8$ = $restoredCtx2$.$index;
      const $count_r10$ = $restoredCtx2$.$count;
      const $ctx_r24$ = $r3$.ɵɵnextContext(2);
      return $r3$.ɵɵresetView($ctx_r24$.innerCb($index_r8$ % 2 !== 0, $index_r8$ % 2 === 0, $index_r8$ === 0, $index_r8$ === $count_r10$ - 1));
    });
    $r3$.ɵɵelementEnd();
    $r3$.ɵɵelementStart(1, "button", 0);
    $r3$.ɵɵlistener("click", function MyApp_For_1_For_2_Template_button_click_1_listener() {
      $r3$.ɵɵrestoreView($_r25$);
      const $ctx_r27$ = $r3$.ɵɵnextContext();
      const $index_1_r3$ = $ctx_r27$.$index;
      const $count_1_r5$ = $ctx_r27$.$count;
      const $ctx_r26$ = $r3$.ɵɵnextContext();
      return $r3$.ɵɵresetView($ctx_r26$.outerCb($index_1_r3$ % 2 !== 0, $index_1_r3$ % 2 === 0, $index_1_r3$ === 0, $index_1_r3$ === $count_1_r5$ - 1));
    });
    $r3$.ɵɵelementEnd();
    $r3$.ɵɵrepeaterCreate(2, MyApp_For_1_For_2_For_3_Template, 3, 0, null, null, $r3$.ɵɵrepeaterTrackByIdentity);
  }
  if (rf & 2) {
    const $ctx_r6$ = $r3$.ɵɵnextContext(2);
    $r3$.ɵɵadvance(2);
    $r3$.ɵɵrepeater($ctx_r6$.items);
  }
}
…
function MyApp_For_1_Template(rf, ctx) {
  if (rf & 1) {
    const $_r29$ = $r3$.ɵɵgetCurrentView();
    $r3$.ɵɵelementStart(0, "button", 0);
    $r3$.ɵɵlistener("click", function MyApp_For_1_Template_button_click_0_listener() {
      const $restoredCtx3$ = $r3$.ɵɵrestoreView($_r29$);
      const $index_r2$ = $restoredCtx3$.$index;
      const $count_r4$ = $restoredCtx3$.$count;
      const $ctx_r28$ = $r3$.ɵɵnextContext();
      return $r3$.ɵɵresetView($ctx_r28$.outerCb($index_r2$ % 2 !== 0, $index_r2$ % 2 === 0, $index_r2$ === 0, $index_r2$ === $count_r4$ - 1));
    });
    $r3$.ɵɵelementEnd();
    $r3$.ɵɵrepeaterCreate(1, MyApp_For_1_For_2_Template, 4, 0, null, null, $r3$.ɵɵrepeaterTrackByIdentity);
  }
  if (rf & 2) {
    const $ctx_r0$ = $r3$.ɵɵnextContext();
    $r3$.ɵɵadvance();
    $r3$.ɵɵrepeater($ctx_r0$.items);
  }
}
…
function MyApp_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵrepeaterCreate(0, MyApp_For_1_Template, 3, 0, null, null, $r3$.ɵɵrepeaterTrackByIdentity);
  }
  if (rf & 2) {
    $r3$.ɵɵrepeater(ctx.items);
  }
}
