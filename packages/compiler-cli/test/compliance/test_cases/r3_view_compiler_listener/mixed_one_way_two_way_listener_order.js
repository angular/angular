if (rf & 1) {
  $r3$.ɵɵelementStart(0, "div", 0);
  $r3$.ɵɵtwoWayListener("aChange", function App_Template_div_aChange_0_listener($event) {
    $r3$.ɵɵtwoWayBindingSet(ctx.value, $event) || (ctx.value = $event);
    return $event;
  });
  $r3$.ɵɵlistener("b", function App_Template_div_b_0_listener() {
    return ctx.noop();
  });
  $r3$.ɵɵtwoWayListener("cChange", function App_Template_div_cChange_0_listener($event) {
    $r3$.ɵɵtwoWayBindingSet(ctx.value, $event) || (ctx.value = $event);
    return $event;
  });
  $r3$.ɵɵlistener("d", function App_Template_div_d_0_listener() {
    return ctx.noop();
  });
  $r3$.ɵɵelementEnd();
}
