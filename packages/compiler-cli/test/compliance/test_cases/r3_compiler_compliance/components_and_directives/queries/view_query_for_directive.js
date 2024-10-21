ViewQueryComponent.ɵcmp = /*@__PURE__*/ $r3$.ɵɵdefineComponent({
  type: ViewQueryComponent,
  selectors: [["view-query-component"]],
  viewQuery: function ViewQueryComponent_Query(rf, ctx) {
    if (rf & 1) {
      $r3$.ɵɵviewQuery(SomeDirective, 5);
      $r3$.ɵɵviewQuery(SomeDirective, 5);
    }
    if (rf & 2) {
      let $tmp$;
      $r3$.ɵɵqueryRefresh($tmp$ = $r3$.ɵɵloadQuery()) && (ctx.someDir = $tmp$.first);
      $r3$.ɵɵqueryRefresh($tmp$ = $r3$.ɵɵloadQuery()) && (ctx.someDirs = $tmp$);
    }
  },
  standalone: false,
  decls: 1,
  vars: 0,
  consts: [["someDir",""]],
  template:  function ViewQueryComponent_Template(rf, ctx) {
    if (rf & 1) {
      $r3$.ɵɵelement(0, "div", 0);
    }
  },
  dependencies: () => [SomeDirective],
  encapsulation: 2
});
