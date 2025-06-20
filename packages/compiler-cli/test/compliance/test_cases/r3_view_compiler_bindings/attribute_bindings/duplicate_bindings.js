consts: [[2, "height", "0"], [1, "cls2"], [3, "tabindex"], [3, "click"]],
template: function MyComponent_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵstaticHtml("<div aria-label=\"hello\" aria-label=\"hi\"></div>");
    i0.ɵɵelementStart(1, "div", 0);
    i0.ɵɵelement(2, "div", 1)(3, "div")(4, "div", 2)(5, "div")(6, "div");
    i0.ɵɵelementStart(7, "div", 3);
    i0.ɵɵlistener("click", function MyComponent_Template_div_click_7_listener($event) { return $event.stopPropagation(); })("click", function MyComponent_Template_div_click_7_listener($event) { return $event.preventDefault(); });
    i0.ɵɵelementEnd()();
  }
  if (rf & 2) {
    i0.ɵɵadvance(3);
    i0.ɵɵattribute("aria-label", ctx.value1)("aria-label", ctx.value2);
    i0.ɵɵadvance();
    i0.ɵɵproperty("tabindex", ctx.value1)("tabindex", ctx.value2);
    i0.ɵɵadvance();
    i0.ɵɵclassMap(ctx.value2);
    i0.ɵɵadvance();
    i0.ɵɵstyleMap(ctx.value2);
  }
}
