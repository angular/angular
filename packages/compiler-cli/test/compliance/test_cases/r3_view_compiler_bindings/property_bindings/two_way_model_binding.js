…
export class AppComponent {
  …
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: AppComponent, selectors: [["app-root"]], decls: 1, vars: 1, consts: [["toggle", "", 3, "checkedChange", "checked"]], template: function AppComponent_Template(rf, ctx) {
    if (rf & 1) {
      i0.ɵɵelementStart(0, "div", 0);
      i0.ɵɵtwoWayListener("checkedChange", function AppComponent_Template_div_checkedChange_0_listener($event) { i0.ɵɵtwoWayBindingSet(ctx.isChecked, $event) || (ctx.isChecked = $event); return $event; });
      i0.ɵɵelementEnd();
    }
    if (rf & 2) {
      i0.ɵɵtwoWayProperty("checked", ctx.isChecked);
    }
  }, dependencies: [ToggleDirective], encapsulation: 2 });
}
…
