…

(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && $r3$.ɵsetClassMetadataAsync(MyApp, () => [
    /* @ts-ignore */
    import("./defer_aliased_deps_a").then(m => m.Dep),
    /* @ts-ignore */
    import("./defer_aliased_deps_b").then(m => m.Dep)
  ], (AliasedDepA, AliasedDepB) => {
    $r3$.ɵsetClassMetadata(MyApp, [{
      type: Component,
      args: [{
        template: …,
        imports: [AliasedDepA, AliasedDepB]…
      }]
    }], null, null);
  });
})();
