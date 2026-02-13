
  …

export class EventModifiers {
  …
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: EventModifiers, selectors: [["my-comp"]], decls: 5, vars: 0, consts: [[3, "click"],[3, "clicked.here", "stop"]], template: function EventModifiers_Template(rf, ctx) { if (rf & 1) {
          i0.ɵɵelementStart(0, "button", 0);
          i0.ɵɵlistener("click", function EventModifiers_Template_button_click_0_listener() { return ctx.onClick(); }, undefined, [i0.ɵɵprevent]);
          i0.ɵɵelementEnd();
          i0.ɵɵelementStart(1, "button", 0);
          i0.ɵɵlistener("click", function EventModifiers_Template_button_click_1_listener() { return ctx.onClick(); }, undefined, [i0.ɵɵstop]);
          i0.ɵɵelementEnd();
          i0.ɵɵelementStart(2, "button", 0);
          i0.ɵɵlistener("click", function EventModifiers_Template_button_click_2_listener() { return ctx.onClick(); }, undefined, [i0.ɵɵdebounce(500)]);
          i0.ɵɵelementEnd();
          i0.ɵɵelementStart(3, "button", 0);
          i0.ɵɵlistener("click", function EventModifiers_Template_button_click_3_listener() { return ctx.onClick(); }, undefined, [i0.ɵɵprevent, i0.ɵɵstop]);
          i0.ɵɵelementEnd();
          i0.ɵɵelementStart(4, "my-comp", 1);
          i0.ɵɵlistener("clicked.here", function EventModifiers_Template_my_comp_clicked_here_4_listener() { return ctx.onClick(); })("stop", function EventModifiers_Template_my_comp_stop_4_listener() { return ctx.onStop(); });
          i0.ɵɵelementEnd();
      } }, dependencies: [EventModifiers, MyComp], encapsulation: 2 });
}
…
export class TwoWayModifiers {
  …
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: TwoWayModifiers, selectors: [["two-way"]], decls: 1, vars: 1, consts: [[3, "ngModelChange", "ngModel"]], template: function TwoWayModifiers_Template(rf, ctx) { if (rf & 1) {
          i0.ɵɵelementStart(0, "input", 0);
          i0.ɵɵtwoWayListener("ngModelChange", function TwoWayModifiers_Template_input_ngModelChange_0_listener($event) { i0.ɵɵtwoWayBindingSet(ctx.name, $event) || (ctx.name = $event); return $event; }, [i0.ɵɵdebounce(200)]);
          i0.ɵɵelementEnd();
      } if (rf & 2) {
          i0.ɵɵtwoWayProperty("ngModel", ctx.name);
      } }, dependencies: [MockNgModel], encapsulation: 2 });
}
…