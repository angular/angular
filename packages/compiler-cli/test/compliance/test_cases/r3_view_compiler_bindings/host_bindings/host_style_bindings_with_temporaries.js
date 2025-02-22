hostBindings: function HostBindingDir_HostBindings(rf, ctx) {
  if (rf & 2) {
    $r3$.ɵɵstyleProp("font-size", ctx.value ?? "15px")
                    ("font-weight", ctx.value ?? "bold");
  }
}
