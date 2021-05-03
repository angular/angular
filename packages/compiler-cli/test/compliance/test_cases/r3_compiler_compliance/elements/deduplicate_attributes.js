consts: [["title", "hi"]],
template: function MyComponent_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵelement(0, "div", 0);
    $r3$.ɵɵelement(1, "span", 0);
  }
  …
}