function MyApp_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵtemplate(0, MyApp_ng_template_0_Template, 0, 0, "ng-template");
    $r3$.ɵɵrepeaterCreate(1, MyApp_For_2_Template, 1, 1, null, null, $r3$.ɵɵrepeaterTrackByIdentity, false, MyApp_ForEmpty_3_Template, 1, 0);
    $r3$.ɵɵtemplate(4, MyApp_ng_template_4_Template, 0, 0, "ng-template");
  }
  if (rf & 2) {
    $r3$.ɵɵadvance();
    $r3$.ɵɵrepeater(ctx.items);
  }
}
