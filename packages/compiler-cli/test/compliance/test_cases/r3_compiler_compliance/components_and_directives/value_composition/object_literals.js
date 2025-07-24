const $e0_ff$ = $v$ => ({"duration": 500, animation: $v$});
// ...
MyApp.ɵcmp = /*@__PURE__*/ $r3$.ɵɵdefineComponent({
  type: MyApp,
  selectors: [["my-app"]],
  standalone: false,
  decls: 1,
  vars: 3,
  consts: [[__AttributeMarker.Bindings__, "config"]],
  template:  function MyApp_Template(rf, ctx) {
    if (rf & 1) {
      $r3$.ɵɵelement(0, "object-comp", 0);
    }
    if (rf & 2) {
      $r3$.ɵɵproperty("config", $r3$.ɵɵpureFunction1(1, $e0_ff$, ctx.name));
    }
  },
  dependencies: [ObjectComp],
  encapsulation: 2
});
