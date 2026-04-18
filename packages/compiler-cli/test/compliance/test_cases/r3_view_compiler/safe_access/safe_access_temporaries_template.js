} if (rf & 2) {
  let $tmp_0$;
  let $tmp_1$;
  let $tmp_2$;
  let $tmp_3$;
  i0.ɵɵadvance();
  i0.ɵɵtextInterpolate1("Safe Property with Calls: ", ($tmp_0$ = ctx.p()) == null ? null : ($tmp_0$ = $tmp_0$.a()) == null ? null : ($tmp_0$ = $tmp_0$.b()) == null ? null : ($tmp_0$ = $tmp_0$.c()) == null ? null : $tmp_0$.d());
  i0.ɵɵadvance(2);
  i0.ɵɵtextInterpolate1("Safe and Unsafe Property with Calls: ", ctx.p == null ? null : ($tmp_0$ = ctx.p.a()) == null ? null : ($tmp_0$ = $tmp_0$.b().c().d()) == null ? null : ($tmp_0$ = $tmp_0$.e()) == null ? null : $tmp_0$.f == null ? null : $tmp_0$.f.g.h == null ? null : ($tmp_0$ = $tmp_0$.f.g.h.i()) == null ? null : ($tmp_0$ = $tmp_0$.j()) == null ? null : $tmp_0$.k().l);
  i0.ɵɵadvance(2);
  i0.ɵɵtextInterpolate1("Nested Safe with Calls: ", ($tmp_0$ = ctx.f1()) == null ? null : $tmp_0$[($tmp_1$ = ctx.f2()) == null ? null : $tmp_1$.a] == null ? null : $tmp_0$[($tmp_1$ = $tmp_1$) == null ? null : $tmp_1$.a].b);
  i0.ɵɵadvance(2);
  i0.ɵɵtextInterpolate1("Deep Nested Safe with Calls: ", ($tmp_0$ = ctx.f1()) == null ? null : $tmp_0$[($tmp_1$ = ctx.f2()) == null ? null : ($tmp_2$ = $tmp_1$.f3()) == null ? null : $tmp_2$[($tmp_3$ = ctx.f4()) == null ? null : $tmp_3$.f5()]] == null ? null : $tmp_0$[($tmp_1$ = $tmp_1$) == null ? null : ($tmp_2$ = $tmp_2$) == null ? null : $tmp_2$[($tmp_3$ = $tmp_3$) == null ? null : $tmp_3$.f5()]].f6());
}
