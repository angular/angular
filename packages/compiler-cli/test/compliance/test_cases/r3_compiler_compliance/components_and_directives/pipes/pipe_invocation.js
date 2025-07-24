// ...
MyApp.ɵcmp = /*@__PURE__*/ $r3$.ɵɵdefineComponent({
  type: MyApp,
  selectors: [["my-app"]],
  standalone: false,
  decls: 6,
  vars: 27,
  template:  function MyApp_Template(rf, ctx) {
    if (rf & 1) {
      $r3$.ɵɵtext(0);
      $r3$.ɵɵpipe(1, "myPipe");
      $r3$.ɵɵpipe(2, "myPipe");
      $r3$.ɵɵpipe(3, "myPipe");
      $r3$.ɵɵpipe(4, "myPipe");
      $r3$.ɵɵpipe(5, "myPipe");
    }
    if (rf & 2) {
      $r3$.ɵɵtextInterpolate5(
        "0:", i0.ɵɵpipeBind1(1, 5, ctx.name),
        "1:", i0.ɵɵpipeBind2(2, 7, ctx.name, 1),
        "2:", i0.ɵɵpipeBind3(3, 10, ctx.name, 1, 2),
        "3:", i0.ɵɵpipeBind4(4, 14, ctx.name, 1, 2, 3),
        "4:", i0.ɵɵpipeBindV(5, 19, $r3$.ɵɵpureFunction1(25, $c0$, ctx.name))
      );
    }
  },
  dependencies: [MyPipe],
  encapsulation: 2
});
