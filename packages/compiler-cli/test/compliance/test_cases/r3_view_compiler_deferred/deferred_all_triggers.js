const $DepsFn$ = () => [HeavyComponent];
…
export class AppComponent {
  …
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: AppComponent, selectors: [["app-root"]], decls: 9, vars: 0, consts: [["trigger", ""], [1000, 100], [500]], template: function AppComponent_Template(rf, ctx) {
    if (rf & 1) {
      …
      i0.ɵɵdefer(7, 3, $DepsFn$, 4, 5, 6, 1, 2, i0.ɵɵdeferEnableTimerScheduling);
      i0.ɵɵdeferOnInteraction(0);
      i0.ɵɵdeferPrefetchOnIdle();
    }
  }, … });
}
…
