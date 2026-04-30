template: function MyApp_Template(rf, $ctx$) {
  if (rf & 1) {
    $i0$.ɵɵelementStart(0, "span", 0);
    $i0$.ɵɵtext(1);
    $i0$.ɵɵelementEnd();
  }
  if (rf & 2) {
    let $tmp_5_0$;
    $i0$.ɵɵproperty("title", "Your last name is " + (($ctx$.person.getLastName == null ? null : $ctx$.person.getLastName()) ?? "unknown"));
    $i0$.ɵɵadvance();
    $i0$.ɵɵtextInterpolate2(" Hello, ", $ctx$.person.getName == null ? null : $ctx$.person.getName(), "! You are a Balrog: ", ($ctx$.person.getSpecies == null ? null : ($tmp_5_0$ = $ctx$.person.getSpecies()) == null ? null : ($tmp_5_0$ = $tmp_5_0$()) == null ? null : ($tmp_5_0$ = $tmp_5_0$()) == null ? null : ($tmp_5_0$ = $tmp_5_0$()) == null ? null : $tmp_5_0$()) || "unknown", " ");
  }
}
