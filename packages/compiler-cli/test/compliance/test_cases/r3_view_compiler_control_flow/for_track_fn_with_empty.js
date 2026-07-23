const $track$ = ($index, $item) => $item.id;
…
export class AppComponent {
  …
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: AppComponent, selectors: [["app-root"]], decls: 3, vars: 1, template: function AppComponent_Template(rf, ctx) {
    if (rf & 1) {
      i0.ɵɵrepeaterCreate(0, AppComponent_For_1_Template, 2, 2, "div", null, $track$, false, AppComponent_ForEmpty_2_Template, 2, 0, "div");
    }
    if (rf & 2) {
      i0.ɵɵrepeater(ctx.items);
    }
  }, encapsulation: 2 });
}
…
