import { ApplicationRef } from 'angular2/src/core/application_ref';
import { isPresent, NumberWrapper } from 'angular2/src/facade/lang';
import { window } from 'angular2/src/facade/browser';
import { DOM } from 'angular2/src/platform/dom/dom_adapter';
/**
 * Entry point for all Angular debug tools. This object corresponds to the `ng`
 * global variable accessible in the dev console.
 */
export class AngularTools {
    constructor(ref) {
        this.profiler = new AngularProfiler(ref);
    }
}
/**
 * Entry point for all Angular profiling-related debug tools. This object
 * corresponds to the `ng.profiler` in the dev console.
 */
export class AngularProfiler {
    constructor(ref) {
        this.appRef = ref.injector.get(ApplicationRef);
    }
    /**
     * Exercises change detection in a loop and then prints the average amount of
     * time in milliseconds how long a single round of change detection takes for
     * the current state of the UI. It runs a minimum of 5 rounds for a minimum
     * of 500 milliseconds.
     *
     * Optionally, a user may pass a `config` parameter containing a map of
     * options. Supported options are:
     *
     * `record` (boolean) - causes the profiler to record a CPU profile while
     * it exercises the change detector. Example:
     *
     * ```
     * ng.profiler.timeChangeDetection({record: true})
     * ```
     */
    timeChangeDetection(config) {
        var record = isPresent(config) && config['record'];
        var profileName = 'Change Detection';
        // Profiler is not available in Android browsers, nor in IE 9 without dev tools opened
        var isProfilerAvailable = isPresent(window.console.profile);
        if (record && isProfilerAvailable) {
            window.console.profile(profileName);
        }
        var start = DOM.performanceNow();
        var numTicks = 0;
        while (numTicks < 5 || (DOM.performanceNow() - start) < 500) {
            this.appRef.tick();
            numTicks++;
        }
        var end = DOM.performanceNow();
        if (record && isProfilerAvailable) {
            // need to cast to <any> because type checker thinks there's no argument
            // while in fact there is:
            //
            // https://developer.mozilla.org/en-US/docs/Web/API/Console/profileEnd
            window.console.profileEnd(profileName);
        }
        var msPerTick = (end - start) / numTicks;
        window.console.log(`ran ${numTicks} change detection cycles`);
        window.console.log(`${NumberWrapper.toFixed(msPerTick, 2)} ms per check`);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tbW9uX3Rvb2xzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYW5ndWxhcjIvc3JjL3Rvb2xzL2NvbW1vbl90b29scy50cyJdLCJuYW1lcyI6WyJBbmd1bGFyVG9vbHMiLCJBbmd1bGFyVG9vbHMuY29uc3RydWN0b3IiLCJBbmd1bGFyUHJvZmlsZXIiLCJBbmd1bGFyUHJvZmlsZXIuY29uc3RydWN0b3IiLCJBbmd1bGFyUHJvZmlsZXIudGltZUNoYW5nZURldGVjdGlvbiJdLCJtYXBwaW5ncyI6Ik9BQU8sRUFBQyxjQUFjLEVBQUMsTUFBTSxtQ0FBbUM7T0FFekQsRUFBQyxTQUFTLEVBQUUsYUFBYSxFQUFDLE1BQU0sMEJBQTBCO09BQzFELEVBQWMsTUFBTSxFQUFDLE1BQU0sNkJBQTZCO09BQ3hELEVBQUMsR0FBRyxFQUFDLE1BQU0sdUNBQXVDO0FBRXpEOzs7R0FHRztBQUNIO0lBR0VBLFlBQVlBLEdBQWlCQTtRQUFJQyxJQUFJQSxDQUFDQSxRQUFRQSxHQUFHQSxJQUFJQSxlQUFlQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQTtJQUFDQSxDQUFDQTtBQUM5RUQsQ0FBQ0E7QUFFRDs7O0dBR0c7QUFDSDtJQUdFRSxZQUFZQSxHQUFpQkE7UUFDM0JDLElBQUlBLENBQUNBLE1BQU1BLEdBQW1CQSxHQUFJQSxDQUFDQSxRQUFRQSxDQUFDQSxHQUFHQSxDQUFDQSxjQUFjQSxDQUFDQSxDQUFDQTtJQUNsRUEsQ0FBQ0E7SUFFREQ7Ozs7Ozs7Ozs7Ozs7OztPQWVHQTtJQUNIQSxtQkFBbUJBLENBQUNBLE1BQVdBO1FBQzdCRSxJQUFJQSxNQUFNQSxHQUFHQSxTQUFTQSxDQUFDQSxNQUFNQSxDQUFDQSxJQUFJQSxNQUFNQSxDQUFDQSxRQUFRQSxDQUFDQSxDQUFDQTtRQUNuREEsSUFBSUEsV0FBV0EsR0FBR0Esa0JBQWtCQSxDQUFDQTtRQUNyQ0Esc0ZBQXNGQTtRQUN0RkEsSUFBSUEsbUJBQW1CQSxHQUFHQSxTQUFTQSxDQUFDQSxNQUFNQSxDQUFDQSxPQUFPQSxDQUFDQSxPQUFPQSxDQUFDQSxDQUFDQTtRQUM1REEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsTUFBTUEsSUFBSUEsbUJBQW1CQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNsQ0EsTUFBTUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsV0FBV0EsQ0FBQ0EsQ0FBQ0E7UUFDdENBLENBQUNBO1FBQ0RBLElBQUlBLEtBQUtBLEdBQUdBLEdBQUdBLENBQUNBLGNBQWNBLEVBQUVBLENBQUNBO1FBQ2pDQSxJQUFJQSxRQUFRQSxHQUFHQSxDQUFDQSxDQUFDQTtRQUNqQkEsT0FBT0EsUUFBUUEsR0FBR0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsY0FBY0EsRUFBRUEsR0FBR0EsS0FBS0EsQ0FBQ0EsR0FBR0EsR0FBR0EsRUFBRUEsQ0FBQ0E7WUFDNURBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLElBQUlBLEVBQUVBLENBQUNBO1lBQ25CQSxRQUFRQSxFQUFFQSxDQUFDQTtRQUNiQSxDQUFDQTtRQUNEQSxJQUFJQSxHQUFHQSxHQUFHQSxHQUFHQSxDQUFDQSxjQUFjQSxFQUFFQSxDQUFDQTtRQUMvQkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsTUFBTUEsSUFBSUEsbUJBQW1CQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNsQ0Esd0VBQXdFQTtZQUN4RUEsMEJBQTBCQTtZQUMxQkEsRUFBRUE7WUFDRkEsc0VBQXNFQTtZQUNoRUEsTUFBTUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsVUFBV0EsQ0FBQ0EsV0FBV0EsQ0FBQ0EsQ0FBQ0E7UUFDaERBLENBQUNBO1FBQ0RBLElBQUlBLFNBQVNBLEdBQUdBLENBQUNBLEdBQUdBLEdBQUdBLEtBQUtBLENBQUNBLEdBQUdBLFFBQVFBLENBQUNBO1FBQ3pDQSxNQUFNQSxDQUFDQSxPQUFPQSxDQUFDQSxHQUFHQSxDQUFDQSxPQUFPQSxRQUFRQSwwQkFBMEJBLENBQUNBLENBQUNBO1FBQzlEQSxNQUFNQSxDQUFDQSxPQUFPQSxDQUFDQSxHQUFHQSxDQUFDQSxHQUFHQSxhQUFhQSxDQUFDQSxPQUFPQSxDQUFDQSxTQUFTQSxFQUFFQSxDQUFDQSxDQUFDQSxlQUFlQSxDQUFDQSxDQUFDQTtJQUM1RUEsQ0FBQ0E7QUFDSEYsQ0FBQ0E7QUFBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7QXBwbGljYXRpb25SZWZ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2FwcGxpY2F0aW9uX3JlZic7XG5pbXBvcnQge0NvbXBvbmVudFJlZiwgQ29tcG9uZW50UmVmX30gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvbGlua2VyL2R5bmFtaWNfY29tcG9uZW50X2xvYWRlcic7XG5pbXBvcnQge2lzUHJlc2VudCwgTnVtYmVyV3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcbmltcG9ydCB7cGVyZm9ybWFuY2UsIHdpbmRvd30gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9icm93c2VyJztcbmltcG9ydCB7RE9NfSBmcm9tICdhbmd1bGFyMi9zcmMvcGxhdGZvcm0vZG9tL2RvbV9hZGFwdGVyJztcblxuLyoqXG4gKiBFbnRyeSBwb2ludCBmb3IgYWxsIEFuZ3VsYXIgZGVidWcgdG9vbHMuIFRoaXMgb2JqZWN0IGNvcnJlc3BvbmRzIHRvIHRoZSBgbmdgXG4gKiBnbG9iYWwgdmFyaWFibGUgYWNjZXNzaWJsZSBpbiB0aGUgZGV2IGNvbnNvbGUuXG4gKi9cbmV4cG9ydCBjbGFzcyBBbmd1bGFyVG9vbHMge1xuICBwcm9maWxlcjogQW5ndWxhclByb2ZpbGVyO1xuXG4gIGNvbnN0cnVjdG9yKHJlZjogQ29tcG9uZW50UmVmKSB7IHRoaXMucHJvZmlsZXIgPSBuZXcgQW5ndWxhclByb2ZpbGVyKHJlZik7IH1cbn1cblxuLyoqXG4gKiBFbnRyeSBwb2ludCBmb3IgYWxsIEFuZ3VsYXIgcHJvZmlsaW5nLXJlbGF0ZWQgZGVidWcgdG9vbHMuIFRoaXMgb2JqZWN0XG4gKiBjb3JyZXNwb25kcyB0byB0aGUgYG5nLnByb2ZpbGVyYCBpbiB0aGUgZGV2IGNvbnNvbGUuXG4gKi9cbmV4cG9ydCBjbGFzcyBBbmd1bGFyUHJvZmlsZXIge1xuICBhcHBSZWY6IEFwcGxpY2F0aW9uUmVmO1xuXG4gIGNvbnN0cnVjdG9yKHJlZjogQ29tcG9uZW50UmVmKSB7XG4gICAgdGhpcy5hcHBSZWYgPSAoPENvbXBvbmVudFJlZl8+cmVmKS5pbmplY3Rvci5nZXQoQXBwbGljYXRpb25SZWYpO1xuICB9XG5cbiAgLyoqXG4gICAqIEV4ZXJjaXNlcyBjaGFuZ2UgZGV0ZWN0aW9uIGluIGEgbG9vcCBhbmQgdGhlbiBwcmludHMgdGhlIGF2ZXJhZ2UgYW1vdW50IG9mXG4gICAqIHRpbWUgaW4gbWlsbGlzZWNvbmRzIGhvdyBsb25nIGEgc2luZ2xlIHJvdW5kIG9mIGNoYW5nZSBkZXRlY3Rpb24gdGFrZXMgZm9yXG4gICAqIHRoZSBjdXJyZW50IHN0YXRlIG9mIHRoZSBVSS4gSXQgcnVucyBhIG1pbmltdW0gb2YgNSByb3VuZHMgZm9yIGEgbWluaW11bVxuICAgKiBvZiA1MDAgbWlsbGlzZWNvbmRzLlxuICAgKlxuICAgKiBPcHRpb25hbGx5LCBhIHVzZXIgbWF5IHBhc3MgYSBgY29uZmlnYCBwYXJhbWV0ZXIgY29udGFpbmluZyBhIG1hcCBvZlxuICAgKiBvcHRpb25zLiBTdXBwb3J0ZWQgb3B0aW9ucyBhcmU6XG4gICAqXG4gICAqIGByZWNvcmRgIChib29sZWFuKSAtIGNhdXNlcyB0aGUgcHJvZmlsZXIgdG8gcmVjb3JkIGEgQ1BVIHByb2ZpbGUgd2hpbGVcbiAgICogaXQgZXhlcmNpc2VzIHRoZSBjaGFuZ2UgZGV0ZWN0b3IuIEV4YW1wbGU6XG4gICAqXG4gICAqIGBgYFxuICAgKiBuZy5wcm9maWxlci50aW1lQ2hhbmdlRGV0ZWN0aW9uKHtyZWNvcmQ6IHRydWV9KVxuICAgKiBgYGBcbiAgICovXG4gIHRpbWVDaGFuZ2VEZXRlY3Rpb24oY29uZmlnOiBhbnkpIHtcbiAgICB2YXIgcmVjb3JkID0gaXNQcmVzZW50KGNvbmZpZykgJiYgY29uZmlnWydyZWNvcmQnXTtcbiAgICB2YXIgcHJvZmlsZU5hbWUgPSAnQ2hhbmdlIERldGVjdGlvbic7XG4gICAgLy8gUHJvZmlsZXIgaXMgbm90IGF2YWlsYWJsZSBpbiBBbmRyb2lkIGJyb3dzZXJzLCBub3IgaW4gSUUgOSB3aXRob3V0IGRldiB0b29scyBvcGVuZWRcbiAgICB2YXIgaXNQcm9maWxlckF2YWlsYWJsZSA9IGlzUHJlc2VudCh3aW5kb3cuY29uc29sZS5wcm9maWxlKTtcbiAgICBpZiAocmVjb3JkICYmIGlzUHJvZmlsZXJBdmFpbGFibGUpIHtcbiAgICAgIHdpbmRvdy5jb25zb2xlLnByb2ZpbGUocHJvZmlsZU5hbWUpO1xuICAgIH1cbiAgICB2YXIgc3RhcnQgPSBET00ucGVyZm9ybWFuY2VOb3coKTtcbiAgICB2YXIgbnVtVGlja3MgPSAwO1xuICAgIHdoaWxlIChudW1UaWNrcyA8IDUgfHwgKERPTS5wZXJmb3JtYW5jZU5vdygpIC0gc3RhcnQpIDwgNTAwKSB7XG4gICAgICB0aGlzLmFwcFJlZi50aWNrKCk7XG4gICAgICBudW1UaWNrcysrO1xuICAgIH1cbiAgICB2YXIgZW5kID0gRE9NLnBlcmZvcm1hbmNlTm93KCk7XG4gICAgaWYgKHJlY29yZCAmJiBpc1Byb2ZpbGVyQXZhaWxhYmxlKSB7XG4gICAgICAvLyBuZWVkIHRvIGNhc3QgdG8gPGFueT4gYmVjYXVzZSB0eXBlIGNoZWNrZXIgdGhpbmtzIHRoZXJlJ3Mgbm8gYXJndW1lbnRcbiAgICAgIC8vIHdoaWxlIGluIGZhY3QgdGhlcmUgaXM6XG4gICAgICAvL1xuICAgICAgLy8gaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQVBJL0NvbnNvbGUvcHJvZmlsZUVuZFxuICAgICAgKDxhbnk+d2luZG93LmNvbnNvbGUucHJvZmlsZUVuZCkocHJvZmlsZU5hbWUpO1xuICAgIH1cbiAgICB2YXIgbXNQZXJUaWNrID0gKGVuZCAtIHN0YXJ0KSAvIG51bVRpY2tzO1xuICAgIHdpbmRvdy5jb25zb2xlLmxvZyhgcmFuICR7bnVtVGlja3N9IGNoYW5nZSBkZXRlY3Rpb24gY3ljbGVzYCk7XG4gICAgd2luZG93LmNvbnNvbGUubG9nKGAke051bWJlcldyYXBwZXIudG9GaXhlZChtc1BlclRpY2ssIDIpfSBtcyBwZXIgY2hlY2tgKTtcbiAgfVxufVxuIl19