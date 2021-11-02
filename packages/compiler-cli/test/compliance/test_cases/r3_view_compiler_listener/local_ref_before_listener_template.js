…
MyComponent.ɵcmp = /*@__PURE__*/ $r3$.ɵɵdefineComponent({
  type: MyComponent,
  selectors: [["my-component"]],
  decls: 4,
  vars: 0,
  consts: [[__AttributeMarker.Bindings__, "click"], ["user", ""]],
  template:  function MyComponent_Template(rf, ctx) {
    if (rf & 1) {
      const $s$ = $r3$.ɵɵgetCurrentView();
      $r3$.ɵɵelementStart(0, "button", 0);
        $r3$.ɵɵlistener("click", function MyComponent_Template_button_click_0_listener() {
           $r3$.ɵɵrestoreView($s$);
           const $user$ = $r3$.ɵɵreference(3);
           return ctx.onClick($user$.value);
        });
        $r3$.ɵɵtext(1, "Save");
      $r3$.ɵɵelementEnd();
      $r3$.ɵɵelement(2, "input", null, 1);
    }
  },
  encapsulation: 2
});
