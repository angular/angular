hostBindings: function HostBindingDir_HostBindings(rf, ctx) {
  if (rf & 2) {
    $r3$.ɵɵclassProp("a", ctx.value ?? "class-a")
                    ("b", ctx.value ?? "class-b");
  }
}
