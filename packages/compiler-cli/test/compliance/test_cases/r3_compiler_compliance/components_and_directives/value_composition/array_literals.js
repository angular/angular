const $e0_ff$ = function ($v$) { return ["Nancy", $v$]; };
// ...
MyApp.ɵcmp = /*@__PURE__*/ $r3$.ɵɵdefineComponent({
  type: MyApp,
  selectors: [["my-app"]],
  decls: 1,
  vars: 3,
  consts: [[__AttributeMarker.Bindings__, "names"]],
  template:  function MyApp_Template(rf, ctx) {
    if (rf & 1) {
      $r3$.ɵɵelement(0, "my-comp", 0);
    }
    if (rf & 2) {
      $r3$.ɵɵproperty("names", $r3$.ɵɵpureFunction1(1, $e0_ff$, ctx.customName));
    }
  },
 dependencies: [MyComp],
 encapsulation: 2
});
