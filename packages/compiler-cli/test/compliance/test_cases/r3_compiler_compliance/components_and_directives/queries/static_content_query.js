ContentQueryComponent.ɵcmp = /*@__PURE__*/ $r3$.ɵɵdefineComponent({
  type: ContentQueryComponent,
  selectors: [["content-query-component"]],
  contentQueries: function ContentQueryComponent_ContentQueries(rf, ctx, dirIndex) {
    if (rf & 1) {
      $r3$.ɵɵcontentQuery(
          dirIndex, SomeDirective, __QueryFlags.isStatic__|__QueryFlags.descendants__|__QueryFlags.emitDistinctChangesOnly__);
      $r3$.ɵɵcontentQuery(dirIndex, $ref0$, 5);
    }
    if (rf & 2) {
    let $tmp$;
      $r3$.ɵɵqueryRefresh($tmp$ = $r3$.ɵɵloadQuery()) && (ctx.someDir = $tmp$.first);
      $r3$.ɵɵqueryRefresh($tmp$ = $r3$.ɵɵloadQuery()) && (ctx.foo = $tmp$.first);
    }
  },
  ngContentSelectors: $_c1$,
  decls: 2,
  vars: 0,
  template:  function ContentQueryComponent_Template(rf, ctx) {
    if (rf & 1) {
      $r3$.ɵɵprojectionDef();
      $r3$.ɵɵelementStart(0, "div");
      $r3$.ɵɵprojection(1);
      $r3$.ɵɵelementEnd();
    }
  },
  encapsulation: 2
});
