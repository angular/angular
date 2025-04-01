const $e0_attrs$ = ["myRef"];
const $e1_attrs$ = ["myRef1", "myRef2", "myRef3"];
// ...
ContentQueryComponent.ɵcmp = /*@__PURE__*/ $r3$.ɵɵdefineComponent({
  // ...
  contentQueries: function ContentQueryComponent_ContentQueries(rf, ctx, dirIndex) {
    if (rf & 1) {
      $r3$.ɵɵcontentQuery(dirIndex, $e0_attrs$, 5, TemplateRef);
    $r3$.ɵɵcontentQuery(dirIndex, SomeDirective, 5, ElementRef);
    $r3$.ɵɵcontentQuery(dirIndex, $e1_attrs$, 4, ElementRef);
    $r3$.ɵɵcontentQuery(dirIndex, SomeDirective, 4, TemplateRef);
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
