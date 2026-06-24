const $e0_ff$ = ($v0$, $v1$, $v2$, $v3$, $v4$, $v5$, $v6$, $v7$, $v8$) => ["start-", $v0$, $v1$, $v2$, $v3$, $v4$, "-middle-", $v5$, $v6$, $v7$, $v8$, "-end"];
// ...
MyApp.ɵcmp = /*@__PURE__*/ $r3$.ɵɵdefineComponent({
  type: MyApp,
  selectors: [["my-app"]],
  standalone: false,
  decls: 1,
  vars: 11,
  consts: [[__AttributeMarker.Bindings__, "names"]],
  template:  function MyApp_Template(rf, ctx) {
    if (rf & 1) {
      $r3$.ɵɵelement(0, "my-comp", 0);
    }
    if (rf & 2) {
      $r3$.ɵɵproperty("names",
          $r3$.ɵɵpureFunctionV(1, $e0_ff$, [ctx.n0, ctx.n1, ctx.n2, ctx.n3, ctx.n4, ctx.n5, ctx.n6, ctx.n7, ctx.n8]));
    }
  },
  dependencies: [MyComp],
  encapsulation: 2
});
