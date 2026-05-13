template: function MyApp_Template(rf, $ctx$) {
  if (rf & 1) {
    // ...
  }
  if (rf & 2) {
    let $tmp_0_0$;
    let $tmp_1_0$;
    let $tmp_2_0$;
    $i0$.ɵɵproperty("title", $ctx$.person == null ? null : $ctx$.person.getName(false));
    $i0$.ɵɵadvance();
    $i0$.ɵɵproperty("title", ($ctx$.person == null ? null : $ctx$.person.getName(false)) || "");
    $i0$.ɵɵadvance();
    $i0$.ɵɵproperty("title", $ctx$.person == null ? null : ($tmp_0_0$ = $ctx$.person.getName(false)) == null ? null : $tmp_0_0$.toLowerCase());
    $i0$.ɵɵadvance();
    $i0$.ɵɵproperty("title", $ctx$.person == null ? null : $ctx$.person.getName(($tmp_1_0$ = $ctx$.config.get("title")) == null ? null : $tmp_1_0$.enabled));
    $i0$.ɵɵadvance();
    i0.ɵɵproperty("title", ctx.person == null ? null : ctx.person.getName(((tmp_4_0 = ctx.config.get("title")) == null ? null : tmp_4_0.enabled) ?? true));
  }
}
