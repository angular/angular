const $c0$ = function ($a0$) {
  return [$a0$, 1, 2, 3, 4, 5];
};
// ...
MyApp.ɵcmp = /*@__PURE__*/ $r3$.ɵɵdefineComponent({
  type: MyApp,
  selectors: [["my-app"]],
  decls: 7,
  vars: 20,
  template:  function MyApp_Template(rf, ctx) {
    if (rf & 1) {
      $r3$.ɵɵtext(0);
      $r3$.ɵɵpipe(1, "myPurePipe");
      $r3$.ɵɵpipe(2, "myPipe");
      $r3$.ɵɵelementStart(3, "p");
      $r3$.ɵɵtext(4);
      $r3$.ɵɵpipe(5, "myPipe");
      $r3$.ɵɵpipe(6, "myPipe");
      $r3$.ɵɵelementEnd();
    }
    if (rf & 2) {
      $r3$.ɵɵtextInterpolate($r3$.ɵɵpipeBind2(1, 3, $r3$.ɵɵpipeBind2(2, 6, ctx.name, ctx.size), ctx.size));
      $r3$.ɵɵadvance(4);
      $r3$.ɵɵtextInterpolate2("", $r3$.ɵɵpipeBindV(5, 9, $r3$.ɵɵpureFunction1(18, $c0$, ctx.name)), " ", ctx.name ? 1 : $r3$.ɵɵpipeBind1(6, 16, 2), "");
    }
  },
  dependencies: [MyPipe, MyPurePipe],
  encapsulation: 2
});
