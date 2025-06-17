import {EagerDep} from './deferred_with_external_deps_eager';
import {LoadingDep} from './deferred_with_external_deps_loading';
import * as $r3$ from "@angular/core";

const $MyApp_Defer_4_DepsFn$ = () => [import("./deferred_with_external_deps_lazy").then(m => m.LazyDep)];

function MyApp_Defer_2_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵelement(0, "lazy-dep");
  }
}

function MyApp_DeferLoading_3_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵelement(0, "loading-dep");
  }
}
…
MyApp.ɵcmp = /*@__PURE__*/ $r3$.ɵɵdefineComponent({
  …
  template: function MyApp_Template(rf, ctx) {
    if (rf & 1) {
      $r3$.ɵɵelementStart(0, "div");
      $r3$.ɵɵelement(1, "eager-dep");
      $r3$.ɵɵdomTemplate(2, MyApp_Defer_2_Template, 1, 0)(3, MyApp_DeferLoading_3_Template, 1, 0);
      $r3$.ɵɵdefer(4, 2, $MyApp_Defer_4_DepsFn$, 3);
      $r3$.ɵɵdeferOnIdle();
      $r3$.ɵɵelementEnd();
    }
  },
  dependencies: [EagerDep, LoadingDep],
  …
});

…

(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && $r3$.ɵsetClassMetadataAsync(MyApp, () => [import("./deferred_with_external_deps_lazy").then(m => m.LazyDep)], LazyDep => {
    $r3$.ɵsetClassMetadata(MyApp, [{
      type: Component,
      args: [{
        template: …,
        imports: [EagerDep, LazyDep, LoadingDep]…
      }]
    }], null, null);
  });
})();
