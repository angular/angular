function MyApp_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵdomElementStart(0, "div");
    $r3$.ɵɵtext(1);
    $r3$.ɵɵrepeaterCreate(2, MyApp_For_3_Template, 1, 1, null, null, $r3$.ɵɵrepeaterTrackByIdentity);
    $r3$.ɵɵpipe(4, "test");
    $r3$.ɵɵdomElementEnd();
  }
  if (rf & 2) {
    $r3$.ɵɵadvance();
    $r3$.ɵɵtextInterpolate1(" ", ctx.message, " ");
    $r3$.ɵɵadvance();
    $r3$.ɵɵrepeater($r3$.ɵɵpipeBind1(4, 1, ctx.items));
  }
}
