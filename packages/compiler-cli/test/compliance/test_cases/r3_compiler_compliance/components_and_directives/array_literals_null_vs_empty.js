const $c0$ = { foo: null };
const $c1$ = [];
const $c2$ = $a0$ => ({ foo: $a0$ });

export class MyApp {
  // ...
  static ɵcmp = /*@__PURE__*/ $r3$.ɵɵdefineComponent({
    // ...
    template:  function MyApp_Template(rf, ctx) {
      if (rf & 1) {
        $r3$.ɵɵelement(0, "div", 0)(1, "div", 0);
      }
      if (rf & 2) {
        $r3$.ɵɵproperty("dir", $c0$);
        $r3$.ɵɵadvance();
        $r3$.ɵɵproperty("dir", $r3$.ɵɵpureFunction1(2, $c2$, $c1$));
      }
    },
    // ...
  });
}
