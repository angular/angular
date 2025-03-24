const MyApp_Defer_1_DepsFn = () => [import("./deferred_with_duplicate_external_dep_lazy").then(m => m.DuplicateLazyDep)];
// NOTE: in linked tests there is one more loader here, because linked compilation doesn't have the ability to de-dupe identical functions.
…
const MyApp_Defer_7_DepsFn = () => [import("./deferred_with_duplicate_external_dep_other").then(m => m.OtherLazyDep)];

…

$r3$.ɵɵdefineComponent({
  …
  template: function MyApp_Template(rf, ctx) {
    if (rf & 1) {
      $r3$.ɵɵtemplate(0, MyApp_Defer_0_Template, 1, 0);
      $r3$.ɵɵdefer(1, 0, MyApp_Defer_1_DepsFn);
      $r3$.ɵɵdeferOnIdle();
      $r3$.ɵɵtemplate(3, MyApp_Defer_3_Template, 1, 0);
      // NOTE: does not check the function name, because linked compilation doesn't have the ability to de-dupe identical functions.
      $r3$.ɵɵdefer(4, 3, …);
      $r3$.ɵɵdeferOnIdle();
      $r3$.ɵɵtemplate(6, MyApp_Defer_6_Template, 1, 0);
      $r3$.ɵɵdefer(7, 6, MyApp_Defer_7_DepsFn);
      $r3$.ɵɵdeferOnIdle();
    }
  },
  encapsulation: 2
});

…

(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && $r3$.ɵsetClassMetadataAsync(MyApp, () => [
    import("./deferred_with_duplicate_external_dep_lazy").then(m => m.DuplicateLazyDep),
    import("./deferred_with_duplicate_external_dep_other").then(m => m.OtherLazyDep)
  ], (DuplicateLazyDep, OtherLazyDep) => {
      $r3$.ɵsetClassMetadata(MyApp, [{
        type: Component,
        args: [{
        template: …,
        // NOTE: there's a ... after the `imports`, because linked compilation produces a trailing comma while full compilation doesn't.
        imports: [DuplicateLazyDep, OtherLazyDep]…
      }]
    }], null, null);
  });
})();
