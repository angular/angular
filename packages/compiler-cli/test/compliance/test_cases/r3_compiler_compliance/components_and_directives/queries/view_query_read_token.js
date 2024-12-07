const $e0_attrs$ = ["myRef"];
const $e1_attrs$ = ["myRef1", "myRef2", "myRef3"];
// ...
ViewQueryComponent.ɵcmp = /*@__PURE__*/ $r3$.ɵɵdefineComponent({
  // ...
  viewQuery: function ViewQueryComponent_Query(rf, ctx) {
    if (rf & 1) {
      $r3$.ɵɵviewQuery($e0_attrs$, 5, TemplateRef);
      $r3$.ɵɵviewQuery(SomeDirective, 5, ElementRef);
      $r3$.ɵɵviewQuery($e1_attrs$, 5, ElementRef);
      $r3$.ɵɵviewQuery(SomeDirective, 5, TemplateRef);
    }
    if (rf & 2) {
      let $tmp$;
      $r3$.ɵɵqueryRefresh($tmp$ = $r3$.ɵɵloadQuery()) && (ctx.myRef = $tmp$.first);
      $r3$.ɵɵqueryRefresh($tmp$ = $r3$.ɵɵloadQuery()) && (ctx.someDir = $tmp$.first);
      $r3$.ɵɵqueryRefresh($tmp$ = $r3$.ɵɵloadQuery()) && (ctx.myRefs = $tmp$);
      $r3$.ɵɵqueryRefresh($tmp$ = $r3$.ɵɵloadQuery()) && (ctx.someDirs = $tmp$);
    }
  },
  // ...
});
