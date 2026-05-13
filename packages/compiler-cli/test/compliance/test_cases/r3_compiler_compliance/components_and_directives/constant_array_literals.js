const $c0$ = [];
const $c1$ = [0, 1, 2];
// ...
export class MyApp {
  // ...
  static ɵcmp = /*@__PURE__*/ $r3$.ɵɵdefineComponent({
    // ...
    template:  function MyApp_Template(rf, ctx) {
      if (rf & 1) {
        $r3$.ɵɵelement(0, "some-comp", 0);
      }
      if (rf & 2) {
        $r3$.ɵɵproperty("prop", $r3$.ɵɵcloneArray(2, $c0$))("otherProp", $r3$.ɵɵcloneArray(3, $c1$));
      }
    },
    // ...
  });
}
