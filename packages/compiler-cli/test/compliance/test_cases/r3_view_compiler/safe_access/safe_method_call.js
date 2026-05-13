template: function MyApp_Template(rf, $ctx$) {
  if (rf & 1) {
    // ...
  }
  if (rf & 2) {
    i0.ɵɵproperty("title", ctx.person?.getName(false));
    i0.ɵɵadvance();
    i0.ɵɵproperty("title", ctx.person?.getName(false) || "");
    i0.ɵɵadvance();
    i0.ɵɵproperty("title", ctx.person?.getName(false)?.toLowerCase());
    i0.ɵɵadvance();
    i0.ɵɵproperty("title", ctx.person?.getName(ctx.config.get("title")?.enabled));
    i0.ɵɵadvance();
    i0.ɵɵproperty("title", ctx.person?.getName(ctx.config.get("title")?.enabled ?? true));
  }
}
