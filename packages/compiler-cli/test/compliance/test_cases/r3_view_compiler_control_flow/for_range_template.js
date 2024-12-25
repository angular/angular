function MyApp_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵrepeaterCreate(0, MyApp_For_1_Template, 1, 1, null, null, i0.ɵɵrepeaterTrackByIndex);
    i0.ɵɵrepeaterCreate(2, MyApp_For_3_Template, 1, 1, null, null, i0.ɵɵrepeaterTrackByIndex);
    i0.ɵɵrepeaterCreate(4, MyApp_For_5_Template, 1, 1, null, null, i0.ɵɵrepeaterTrackByIndex);
    i0.ɵɵrepeaterCreate(6, MyApp_For_7_Template, 1, 1, null, null, i0.ɵɵrepeaterTrackByIndex);
  }
  if (rf & 2) {
    i0.ɵɵrepeater(i0.ɵɵrepeaterRangeGenerator(1,5));
    i0.ɵɵadvance(2);
    i0.ɵɵrepeater(i0.ɵɵrepeaterRangeGenerator(2,8,2));
    i0.ɵɵadvance(2);
    i0.ɵɵrepeater(i0.ɵɵrepeaterRangeGenerator(ctx.fromNumber, ctx.toNumber, ctx.step));
    i0.ɵɵadvance(2);
    i0.ɵɵrepeater(i0.ɵɵrepeaterRangeGenerator(ctx.fromNumber + 1, ctx.toNumber + 1, ctx.step + 1));
  }
}
