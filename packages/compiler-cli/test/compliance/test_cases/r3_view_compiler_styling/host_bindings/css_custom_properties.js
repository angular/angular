// NOTE: It *does* mangle the camel case property in the consts array. This was pre-existing TDB behavior, but should be fixed. 
hostAttrs: [2, "--camel-case", "foo", "--kebab-case", "foo"],
…
hostBindings: function MyDirective_HostBindings(rf, ctx) {
  if (rf & 2) {
    i0.ɵɵstyleProp("--camelCase", ctx.value)("--kebab-case", ctx.value);
  } 
}
