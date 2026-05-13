} if (rf & 2) {
  i0.ɵɵadvance();
  i0.ɵɵtextInterpolate1("Safe Property: ", ctx.p?.a?.b?.c?.d);
  i0.ɵɵadvance(2);
  i0.ɵɵtextInterpolate1("Safe Keyed: ", ctx.p?.["a"]?.["b"]?.["c"]?.["d"]);
  i0.ɵɵadvance(2);
  i0.ɵɵtextInterpolate1("Mixed Property: ", ctx.p?.a?.b.c.d?.e?.f?.g.h);
  i0.ɵɵadvance(2);
  i0.ɵɵtextInterpolate1("Mixed Property and Keyed: ", ctx.p.a["b"].c.d?.["e"]?.["f"]?.g["h"]["i"]?.j.k);
}