…

(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && $r3$.ɵsetClassMetadataAsync(MyApp, () => [
    /* @ts-ignore */
    import("./defer_aliased_deps_a").then(m => m.Dep)
  ], AliasedDep => {
    $r3$.ɵsetClassMetadata(MyApp, [{
      type: Component,
      args: [{
        template: …,
        imports: [AliasedDep]…
      }]
    }], null, null);
  });
})();
