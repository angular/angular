const $arrowFn0$ = (ctx, view) => (a, b) => a / b;
const $arrowFn1$ = (ctx, view) => (a, b) => a / b + ctx.componentProp;
…
$r3$.ɵɵdefineDirective({
  …
  hostVars: 4,
  hostBindings: function TestDir_HostBindings(rf, ctx) {
    if (rf & 2) {
      $r3$.ɵɵattribute("no-context", $r3$.ɵɵarrowFunction(2, $arrowFn0$, ctx)(5, 10))(
        "with-context", $r3$.ɵɵarrowFunction(3, $arrowFn1$, ctx)(6, 12));
    }
  }
  …
});
