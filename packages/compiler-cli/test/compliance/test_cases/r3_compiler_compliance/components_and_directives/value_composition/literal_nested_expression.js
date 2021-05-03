const $c0$ = function () { return {opacity: 0, duration: 0}; };
const $e0_ff$ = function ($v$) { return {opacity: 1, duration: $v$}; };
const $e0_ff_1$ = function ($v1$, $v2$) { return [$v1$, $v2$]; };
const $e0_ff_2$ = function ($v1$, $v2$) { return {animation: $v1$, actions: $v2$}; };
// ...
MyApp.ɵcmp = /*@__PURE__*/ $r3$.ɵɵdefineComponent({
  type: MyApp,
  selectors: [["my-app"]],
  decls: 1,
  vars: 10,
  consts: [[__AttributeMarker.Bindings__, "config"]],
  template:  function MyApp_Template(rf, ctx) {
    if (rf & 1) {
      $r3$.ɵɵelement(0, "nested-comp", 0);
    }
    if (rf & 2) {
      $r3$.ɵɵproperty("config",
        $r3$.ɵɵpureFunction2(7, $e0_ff_2$, ctx.name, $r3$.ɵɵpureFunction2(4, $e0_ff_1$, $r3$.ɵɵpureFunction0(1, $c0$), $r3$.ɵɵpureFunction1(2, $e0_ff$, ctx.duration))));
    }
  },
  directives: [NestedComp],
  encapsulation: 2
});
