ViewQueryComponent.ɵcmp = /*@__PURE__*/ $r3$.ɵɵdefineComponent({
  type: ViewQueryComponent,
  selectors: [["view-query-component"]],
  viewQuery: function ViewQueryComponent_Query(rf, ctx) {
    if (rf & 1) {
      $r3$.ɵɵviewQuery(SomeDirective, __QueryFlags.descendants__|__QueryFlags.emitDistinctChangesOnly__);
      $r3$.ɵɵviewQuery(SomeDirective, __QueryFlags.descendants__|__QueryFlags.emitDistinctChangesOnly__);
    }
    if (rf & 2) {
      let $tmp$;
      $r3$.ɵɵqueryRefresh($tmp$ = $r3$.ɵɵloadQuery()) && (ctx.someDir = $tmp$.first);
      $r3$.ɵɵqueryRefresh($tmp$ = $r3$.ɵɵloadQuery()) && (ctx.someDirList = $tmp$);
    }
  },
  // ...
});
