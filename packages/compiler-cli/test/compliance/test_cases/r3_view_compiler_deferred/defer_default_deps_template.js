const $TestCmp_Defer_1_DepsFn$ = () => [import("./defer_default_deps_ext").then(m => m.default), LocalDep];

function TestCmp_Defer_0_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵelement(0, "cmp-a")(1, "local-dep");
  }
}

export class LocalDep {}

…

function TestCmp_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵdomTemplate(0, TestCmp_Defer_0_Template, 2, 0);
    $r3$.ɵɵdefer(1, 0, $TestCmp_Defer_1_DepsFn$);
    $r3$.ɵɵdeferOnIdle();
  }
}

…

(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && $r3$.ɵsetClassMetadataAsync(TestCmp, () => [import("./defer_default_deps_ext").then(m => m.default)], CmpA => {
    $r3$.ɵsetClassMetadata(TestCmp, [{
      type: Component,
      args: [{
        selector: 'test-cmp',
        imports: [CmpA, LocalDep],
        template: …
      }]
    }], null, null);
  });
})();
