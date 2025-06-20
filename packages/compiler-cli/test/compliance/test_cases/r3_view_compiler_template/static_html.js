function MyComponent_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵstaticHtml("<div>Conditionally rendered div</div>");
} }
…
decls: 3,
vars: 0,
template: function MyComponent_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵstaticHtml("<div><div class=\"foo-bar\">foo</div> <div>bar</div> </div>");
    i0.ɵɵstaticHtml("<div>second div</div>");
    i0.ɵɵconditionalCreate(2, MyComponent_Conditional_2_Template, 2, 0, "div");
  }
}
