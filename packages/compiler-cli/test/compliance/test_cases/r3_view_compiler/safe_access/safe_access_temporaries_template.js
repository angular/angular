} if (rf & 2) {
  i0.ɵɵadvance();
  i0.ɵɵtextInterpolate1("Safe Property with Calls: ", ctx.p()?.a()?.b()?.c()?.d());
  i0.ɵɵadvance(2);
  i0.ɵɵtextInterpolate1("Safe and Unsafe Property with Calls: ", ctx.p?.a()?.b().c().d()?.e()?.f?.g.h?.i()?.j()?.k().l);
  i0.ɵɵadvance(2);
  i0.ɵɵtextInterpolate1("Nested Safe with Calls: ", ctx.f1()?.[ctx.f2()?.a]?.b);
  i0.ɵɵadvance(2);
  i0.ɵɵtextInterpolate1("Deep Nested Safe with Calls: ", ctx.f1()?.[ctx.f2()?.f3()?.[ctx.f4()?.f5()]]?.f6());
}