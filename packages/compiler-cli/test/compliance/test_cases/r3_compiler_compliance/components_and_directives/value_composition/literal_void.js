const $c0$ = () => [void 0, 1];
const $c1$ = () => ({ a: void 0, b: 2 });
// ...
export class VoidComp {
  // ...
  static ɵcmp = /*@__PURE__*/ $r3$.ɵɵdefineComponent({
    type: VoidComp,
    selectors: [["ng-component"]],
    decls: 1,
    vars: 4,
    template: function VoidComp_Template(rf, ctx) {
      if (rf & 1) {
        $r3$.ɵɵtext(0);
      }
      if (rf & 2) {
        const $array_r1$ = $r3$.ɵɵpureFunction0(2, $c0$);
        const $object_r2$ = $r3$.ɵɵpureFunction0(3, $c1$);
        $r3$.ɵɵtextInterpolate2(" ", $array_r1$, " ", $object_r2$, " ");
      }
    },
    encapsulation: 2
  });
}
