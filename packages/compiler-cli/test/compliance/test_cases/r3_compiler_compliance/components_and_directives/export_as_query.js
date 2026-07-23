const $c0$ = ["ref"];
…
export class FooDirective {
  …
  static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: FooDirective, selectors: [["", "foo", ""]], exportAs: ["foo"] });
}
…
export class AppComponent {
  …
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: AppComponent, selectors: [["app-root"]], viewQuery: function AppComponent_Query(rf, ctx) {
    if (rf & 1) {
      i0.ɵɵviewQuery($c0$, 5);
    }
    if (rf & 2) {
      let $t$;
      i0.ɵɵqueryRefresh($t$ = i0.ɵɵloadQuery()) && (ctx.ref = $t$.first);
    }
  }, … dependencies: [FooDirective], encapsulation: 2 });
}
…
