} if (rf & 2) {
  let $tmp_0_0$;
  let $tmp_1_0$;
  let $tmp_2_0$;
  let $tmp_2_1$;
  let $tmp_3_0$;
  let $tmp_3_1$;
  let $tmp_3_2$;
  let $tmp_3_3$;
  i0.ɵɵadvance(1);
  i0.ɵɵtextInterpolate1("Safe Propery with Calls: ", ($tmp_0_0$ = ctx.p()) == null ? null : ($tmp_0_0$ = $tmp_0_0$.a()) == null ? null : ($tmp_0_0$ = $tmp_0_0$.b()) == null ? null : ($tmp_0_0$ = $tmp_0_0$.c()) == null ? null : $tmp_0_0$.d(), "");
  i0.ɵɵadvance(2);
  i0.ɵɵtextInterpolate1("Safe and Unsafe Property with Calls: ", ctx.p == null ? null : ($tmp_1_0$ = ctx.p.a()) == null ? null : ($tmp_1_0$ = $tmp_1_0$.b().c().d()) == null ? null : ($tmp_1_0$ = $tmp_1_0$.e()) == null ? null : $tmp_1_0$.f == null ? null : $tmp_1_0$.f.g.h == null ? null : ($tmp_1_0$ = $tmp_1_0$.f.g.h.i()) == null ? null : ($tmp_1_0$ = $tmp_1_0$.j()) == null ? null : $tmp_1_0$.k().l, "");
  i0.ɵɵadvance(2);
  i0.ɵɵtextInterpolate1("Nested Safe with Calls: ", ($tmp_2_0$ = ctx.f1()) == null ? null : $tmp_2_0$[($tmp_2_1$ = ctx.f2()) == null ? null : $tmp_2_1$.a] == null ? null : $tmp_2_0$[($tmp_2_1$ = $tmp_2_1$) == null ? null : $tmp_2_1$.a].b, "");
  i0.ɵɵadvance(2);
  i0.ɵɵtextInterpolate1("Deep Nested Safe with Calls: ", ($tmp_3_0$ = ctx.f1()) == null ? null : $tmp_3_0$[($tmp_3_1$ = ctx.f2()) == null ? null : ($tmp_3_2$ = $tmp_3_1$.f3()) == null ? null : $tmp_3_2$[($tmp_3_3$ = ctx.f4()) == null ? null : $tmp_3_3$.f5()]] == null ? null : $tmp_3_0$[($tmp_3_1$ = $tmp_3_1$) == null ? null : ($tmp_3_2$ = $tmp_3_2$) == null ? null : $tmp_3_2$[($tmp_3_3$ = $tmp_3_3$) == null ? null : $tmp_3_3$.f5()]].f6(), "");
}
