consts: [["aria-label", "hello", "aria-label", "hi"], [2, "height", "0"], [1, "cls2"], [3, "tabindex"], [3, "click"]],
template: function MyComponent_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵdomElement(0, "div", 0);
    $r3$.ɵɵdomElementStart(1, "div", 1);
    $r3$.ɵɵdomElement(2, "div", 2)(3, "div")(4, "div", 3)(5, "div")(6, "div");
    $r3$.ɵɵdomElementStart(7, "div", 4);
    $r3$.ɵɵdomListener("click", function MyComponent_Template_div_click_7_listener($event) { return $event.stopPropagation(); })("click", function MyComponent_Template_div_click_7_listener($event) { return $event.preventDefault(); });
    $r3$.ɵɵdomElementEnd()();
  }
  if (rf & 2) {
    $r3$.ɵɵadvance(3);
    $r3$.ɵɵattribute("aria-label", ctx.value1)("aria-label", ctx.value2);
    $r3$.ɵɵadvance();
    $r3$.ɵɵdomProperty("tabindex", ctx.value1)("tabindex", ctx.value2);
    $r3$.ɵɵadvance();
    $r3$.ɵɵclassMap(ctx.value2);
    $r3$.ɵɵadvance();
    $r3$.ɵɵstyleMap(ctx.value2);
  }
}
