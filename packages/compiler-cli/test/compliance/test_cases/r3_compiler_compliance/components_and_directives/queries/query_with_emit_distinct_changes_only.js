const $e0_attrs$ = ["myRef"];
// ...
ContentQueryComponent.ɵcmp = /*@__PURE__*/ $r3$.ɵɵdefineComponent({
  // ...
  contentQueries: function ContentQueryComponent_ContentQueries(rf, ctx, dirIndex) {
    if (rf & 1) {
      $r3$.ɵɵcontentQuery(dirIndex, $e0_attrs$, __QueryFlags.emitDistinctChangesOnly__);
      $r3$.ɵɵcontentQuery(dirIndex, $e0_attrs$, __QueryFlags.none__);
    }
    if (rf & 2) {
      let $tmp$;
      $r3$.ɵɵqueryRefresh($tmp$ = $r3$.ɵɵloadQuery()) && (ctx.myRefs = $tmp$);
      $r3$.ɵɵqueryRefresh($tmp$ = $r3$.ɵɵloadQuery()) && (ctx.oldMyRefs = $tmp$);
    }
  },
  // ...
  viewQuery: function ContentQueryComponent_Query(rf, ctx) {
    if (rf & 1) {
      $r3$.ɵɵviewQuery(SomeDirective, __QueryFlags.emitDistinctChangesOnly__|__QueryFlags.descendants__);
      $r3$.ɵɵviewQuery(SomeDirective, __QueryFlags.descendants__);
    }
    if (rf & 2) {
      let $tmp$;
      $r3$.ɵɵqueryRefresh($tmp$ = $r3$.ɵɵloadQuery()) && (ctx.someDirs = $tmp$);
      $r3$.ɵɵqueryRefresh($tmp$ = $r3$.ɵɵloadQuery()) && (ctx.oldSomeDirs = $tmp$);
    }
  },
  //...
});
