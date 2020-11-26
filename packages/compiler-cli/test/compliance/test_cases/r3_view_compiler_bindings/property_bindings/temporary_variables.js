template: function MyComponent_Template(rf, ctx) {
  …
  if (rf & 2) {
    let $tmp0$ = null;
    $r3$.ɵɵproperty("title", ctx.myTitle)("id", ($tmp0$ = $r3$.ɵɵpipeBind1(1, 3, ($tmp0$ = ctx.auth()) == null ? null : $tmp0$.identity())) == null ? null : $tmp0$.id)("tabindex", 1);
  }
}
