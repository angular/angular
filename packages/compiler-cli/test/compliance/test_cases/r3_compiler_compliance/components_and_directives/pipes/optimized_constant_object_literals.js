const $c0$ = { name: "Angular" };

// ...
export class MyApp {
  // ...
  static ɵcmp = /*@__PURE__*/ $r3$.ɵɵdefineComponent({
    // ...
    template: function MyApp_Template(rf, ctx) {
      if (rf & 1) {
        $r3$.ɵɵtext(0);
        $r3$.ɵɵpipe(1, "myPipe");
      }
      if (rf & 2) {
        $r3$.ɵɵtextInterpolate($r3$.ɵɵpipeBind1(1, 1, $r3$.ɵɵcloneObject(3, $c0$)));
      }
    },
    // ...
  });
}
