'use strict';var application_ref_1 = require('angular2/src/core/application_ref');
var lang_1 = require('angular2/src/facade/lang');
var browser_1 = require('angular2/src/facade/browser');
var dom_adapter_1 = require('angular2/src/platform/dom/dom_adapter');
/**
 * Entry point for all Angular debug tools. This object corresponds to the `ng`
 * global variable accessible in the dev console.
 */
var AngularTools = (function () {
    function AngularTools(ref) {
        this.profiler = new AngularProfiler(ref);
    }
    return AngularTools;
})();
exports.AngularTools = AngularTools;
/**
 * Entry point for all Angular profiling-related debug tools. This object
 * corresponds to the `ng.profiler` in the dev console.
 */
var AngularProfiler = (function () {
    function AngularProfiler(ref) {
        this.appRef = ref.injector.get(application_ref_1.ApplicationRef);
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
    AngularProfiler.prototype.timeChangeDetection = function (config) {
        var record = lang_1.isPresent(config) && config['record'];
        var profileName = 'Change Detection';
        // Profiler is not available in Android browsers, nor in IE 9 without dev tools opened
        var isProfilerAvailable = lang_1.isPresent(browser_1.window.console.profile);
        if (record && isProfilerAvailable) {
            browser_1.window.console.profile(profileName);
        }
        var start = dom_adapter_1.DOM.performanceNow();
        var numTicks = 0;
        while (numTicks < 5 || (dom_adapter_1.DOM.performanceNow() - start) < 500) {
            this.appRef.tick();
            numTicks++;
        }
        var end = dom_adapter_1.DOM.performanceNow();
        if (record && isProfilerAvailable) {
            // need to cast to <any> because type checker thinks there's no argument
            // while in fact there is:
            //
            // https://developer.mozilla.org/en-US/docs/Web/API/Console/profileEnd
            browser_1.window.console.profileEnd(profileName);
        }
        var msPerTick = (end - start) / numTicks;
        browser_1.window.console.log("ran " + numTicks + " change detection cycles");
        browser_1.window.console.log(lang_1.NumberWrapper.toFixed(msPerTick, 2) + " ms per check");
    };
    return AngularProfiler;
})();
exports.AngularProfiler = AngularProfiler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tbW9uX3Rvb2xzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYW5ndWxhcjIvc3JjL3BsYXRmb3JtL2Jyb3dzZXIvdG9vbHMvY29tbW9uX3Rvb2xzLnRzIl0sIm5hbWVzIjpbIkFuZ3VsYXJUb29scyIsIkFuZ3VsYXJUb29scy5jb25zdHJ1Y3RvciIsIkFuZ3VsYXJQcm9maWxlciIsIkFuZ3VsYXJQcm9maWxlci5jb25zdHJ1Y3RvciIsIkFuZ3VsYXJQcm9maWxlci50aW1lQ2hhbmdlRGV0ZWN0aW9uIl0sIm1hcHBpbmdzIjoiQUFBQSxnQ0FBNkIsbUNBQW1DLENBQUMsQ0FBQTtBQUVqRSxxQkFBdUMsMEJBQTBCLENBQUMsQ0FBQTtBQUNsRSx3QkFBcUIsNkJBQTZCLENBQUMsQ0FBQTtBQUNuRCw0QkFBa0IsdUNBQXVDLENBQUMsQ0FBQTtBQUUxRDs7O0dBR0c7QUFDSDtJQUdFQSxzQkFBWUEsR0FBaUJBO1FBQUlDLElBQUlBLENBQUNBLFFBQVFBLEdBQUdBLElBQUlBLGVBQWVBLENBQUNBLEdBQUdBLENBQUNBLENBQUNBO0lBQUNBLENBQUNBO0lBQzlFRCxtQkFBQ0E7QUFBREEsQ0FBQ0EsQUFKRCxJQUlDO0FBSlksb0JBQVksZUFJeEIsQ0FBQTtBQUVEOzs7R0FHRztBQUNIO0lBR0VFLHlCQUFZQSxHQUFpQkE7UUFDM0JDLElBQUlBLENBQUNBLE1BQU1BLEdBQW1CQSxHQUFJQSxDQUFDQSxRQUFRQSxDQUFDQSxHQUFHQSxDQUFDQSxnQ0FBY0EsQ0FBQ0EsQ0FBQ0E7SUFDbEVBLENBQUNBO0lBRUREOzs7Ozs7Ozs7Ozs7Ozs7T0FlR0E7SUFDSEEsNkNBQW1CQSxHQUFuQkEsVUFBb0JBLE1BQVdBO1FBQzdCRSxJQUFJQSxNQUFNQSxHQUFHQSxnQkFBU0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsSUFBSUEsTUFBTUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsQ0FBQ0E7UUFDbkRBLElBQUlBLFdBQVdBLEdBQUdBLGtCQUFrQkEsQ0FBQ0E7UUFDckNBLHNGQUFzRkE7UUFDdEZBLElBQUlBLG1CQUFtQkEsR0FBR0EsZ0JBQVNBLENBQUNBLGdCQUFNQSxDQUFDQSxPQUFPQSxDQUFDQSxPQUFPQSxDQUFDQSxDQUFDQTtRQUM1REEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsTUFBTUEsSUFBSUEsbUJBQW1CQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNsQ0EsZ0JBQU1BLENBQUNBLE9BQU9BLENBQUNBLE9BQU9BLENBQUNBLFdBQVdBLENBQUNBLENBQUNBO1FBQ3RDQSxDQUFDQTtRQUNEQSxJQUFJQSxLQUFLQSxHQUFHQSxpQkFBR0EsQ0FBQ0EsY0FBY0EsRUFBRUEsQ0FBQ0E7UUFDakNBLElBQUlBLFFBQVFBLEdBQUdBLENBQUNBLENBQUNBO1FBQ2pCQSxPQUFPQSxRQUFRQSxHQUFHQSxDQUFDQSxJQUFJQSxDQUFDQSxpQkFBR0EsQ0FBQ0EsY0FBY0EsRUFBRUEsR0FBR0EsS0FBS0EsQ0FBQ0EsR0FBR0EsR0FBR0EsRUFBRUEsQ0FBQ0E7WUFDNURBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLElBQUlBLEVBQUVBLENBQUNBO1lBQ25CQSxRQUFRQSxFQUFFQSxDQUFDQTtRQUNiQSxDQUFDQTtRQUNEQSxJQUFJQSxHQUFHQSxHQUFHQSxpQkFBR0EsQ0FBQ0EsY0FBY0EsRUFBRUEsQ0FBQ0E7UUFDL0JBLEVBQUVBLENBQUNBLENBQUNBLE1BQU1BLElBQUlBLG1CQUFtQkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDbENBLHdFQUF3RUE7WUFDeEVBLDBCQUEwQkE7WUFDMUJBLEVBQUVBO1lBQ0ZBLHNFQUFzRUE7WUFDaEVBLGdCQUFNQSxDQUFDQSxPQUFPQSxDQUFDQSxVQUFXQSxDQUFDQSxXQUFXQSxDQUFDQSxDQUFDQTtRQUNoREEsQ0FBQ0E7UUFDREEsSUFBSUEsU0FBU0EsR0FBR0EsQ0FBQ0EsR0FBR0EsR0FBR0EsS0FBS0EsQ0FBQ0EsR0FBR0EsUUFBUUEsQ0FBQ0E7UUFDekNBLGdCQUFNQSxDQUFDQSxPQUFPQSxDQUFDQSxHQUFHQSxDQUFDQSxTQUFPQSxRQUFRQSw2QkFBMEJBLENBQUNBLENBQUNBO1FBQzlEQSxnQkFBTUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsR0FBR0EsQ0FBSUEsb0JBQWFBLENBQUNBLE9BQU9BLENBQUNBLFNBQVNBLEVBQUVBLENBQUNBLENBQUNBLGtCQUFlQSxDQUFDQSxDQUFDQTtJQUM1RUEsQ0FBQ0E7SUFDSEYsc0JBQUNBO0FBQURBLENBQUNBLEFBakRELElBaURDO0FBakRZLHVCQUFlLGtCQWlEM0IsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7QXBwbGljYXRpb25SZWZ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2FwcGxpY2F0aW9uX3JlZic7XG5pbXBvcnQge0NvbXBvbmVudFJlZiwgQ29tcG9uZW50UmVmX30gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvbGlua2VyL2R5bmFtaWNfY29tcG9uZW50X2xvYWRlcic7XG5pbXBvcnQge2lzUHJlc2VudCwgTnVtYmVyV3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcbmltcG9ydCB7d2luZG93fSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2Jyb3dzZXInO1xuaW1wb3J0IHtET019IGZyb20gJ2FuZ3VsYXIyL3NyYy9wbGF0Zm9ybS9kb20vZG9tX2FkYXB0ZXInO1xuXG4vKipcbiAqIEVudHJ5IHBvaW50IGZvciBhbGwgQW5ndWxhciBkZWJ1ZyB0b29scy4gVGhpcyBvYmplY3QgY29ycmVzcG9uZHMgdG8gdGhlIGBuZ2BcbiAqIGdsb2JhbCB2YXJpYWJsZSBhY2Nlc3NpYmxlIGluIHRoZSBkZXYgY29uc29sZS5cbiAqL1xuZXhwb3J0IGNsYXNzIEFuZ3VsYXJUb29scyB7XG4gIHByb2ZpbGVyOiBBbmd1bGFyUHJvZmlsZXI7XG5cbiAgY29uc3RydWN0b3IocmVmOiBDb21wb25lbnRSZWYpIHsgdGhpcy5wcm9maWxlciA9IG5ldyBBbmd1bGFyUHJvZmlsZXIocmVmKTsgfVxufVxuXG4vKipcbiAqIEVudHJ5IHBvaW50IGZvciBhbGwgQW5ndWxhciBwcm9maWxpbmctcmVsYXRlZCBkZWJ1ZyB0b29scy4gVGhpcyBvYmplY3RcbiAqIGNvcnJlc3BvbmRzIHRvIHRoZSBgbmcucHJvZmlsZXJgIGluIHRoZSBkZXYgY29uc29sZS5cbiAqL1xuZXhwb3J0IGNsYXNzIEFuZ3VsYXJQcm9maWxlciB7XG4gIGFwcFJlZjogQXBwbGljYXRpb25SZWY7XG5cbiAgY29uc3RydWN0b3IocmVmOiBDb21wb25lbnRSZWYpIHtcbiAgICB0aGlzLmFwcFJlZiA9ICg8Q29tcG9uZW50UmVmXz5yZWYpLmluamVjdG9yLmdldChBcHBsaWNhdGlvblJlZik7XG4gIH1cblxuICAvKipcbiAgICogRXhlcmNpc2VzIGNoYW5nZSBkZXRlY3Rpb24gaW4gYSBsb29wIGFuZCB0aGVuIHByaW50cyB0aGUgYXZlcmFnZSBhbW91bnQgb2ZcbiAgICogdGltZSBpbiBtaWxsaXNlY29uZHMgaG93IGxvbmcgYSBzaW5nbGUgcm91bmQgb2YgY2hhbmdlIGRldGVjdGlvbiB0YWtlcyBmb3JcbiAgICogdGhlIGN1cnJlbnQgc3RhdGUgb2YgdGhlIFVJLiBJdCBydW5zIGEgbWluaW11bSBvZiA1IHJvdW5kcyBmb3IgYSBtaW5pbXVtXG4gICAqIG9mIDUwMCBtaWxsaXNlY29uZHMuXG4gICAqXG4gICAqIE9wdGlvbmFsbHksIGEgdXNlciBtYXkgcGFzcyBhIGBjb25maWdgIHBhcmFtZXRlciBjb250YWluaW5nIGEgbWFwIG9mXG4gICAqIG9wdGlvbnMuIFN1cHBvcnRlZCBvcHRpb25zIGFyZTpcbiAgICpcbiAgICogYHJlY29yZGAgKGJvb2xlYW4pIC0gY2F1c2VzIHRoZSBwcm9maWxlciB0byByZWNvcmQgYSBDUFUgcHJvZmlsZSB3aGlsZVxuICAgKiBpdCBleGVyY2lzZXMgdGhlIGNoYW5nZSBkZXRlY3Rvci4gRXhhbXBsZTpcbiAgICpcbiAgICogYGBgXG4gICAqIG5nLnByb2ZpbGVyLnRpbWVDaGFuZ2VEZXRlY3Rpb24oe3JlY29yZDogdHJ1ZX0pXG4gICAqIGBgYFxuICAgKi9cbiAgdGltZUNoYW5nZURldGVjdGlvbihjb25maWc6IGFueSkge1xuICAgIHZhciByZWNvcmQgPSBpc1ByZXNlbnQoY29uZmlnKSAmJiBjb25maWdbJ3JlY29yZCddO1xuICAgIHZhciBwcm9maWxlTmFtZSA9ICdDaGFuZ2UgRGV0ZWN0aW9uJztcbiAgICAvLyBQcm9maWxlciBpcyBub3QgYXZhaWxhYmxlIGluIEFuZHJvaWQgYnJvd3NlcnMsIG5vciBpbiBJRSA5IHdpdGhvdXQgZGV2IHRvb2xzIG9wZW5lZFxuICAgIHZhciBpc1Byb2ZpbGVyQXZhaWxhYmxlID0gaXNQcmVzZW50KHdpbmRvdy5jb25zb2xlLnByb2ZpbGUpO1xuICAgIGlmIChyZWNvcmQgJiYgaXNQcm9maWxlckF2YWlsYWJsZSkge1xuICAgICAgd2luZG93LmNvbnNvbGUucHJvZmlsZShwcm9maWxlTmFtZSk7XG4gICAgfVxuICAgIHZhciBzdGFydCA9IERPTS5wZXJmb3JtYW5jZU5vdygpO1xuICAgIHZhciBudW1UaWNrcyA9IDA7XG4gICAgd2hpbGUgKG51bVRpY2tzIDwgNSB8fCAoRE9NLnBlcmZvcm1hbmNlTm93KCkgLSBzdGFydCkgPCA1MDApIHtcbiAgICAgIHRoaXMuYXBwUmVmLnRpY2soKTtcbiAgICAgIG51bVRpY2tzKys7XG4gICAgfVxuICAgIHZhciBlbmQgPSBET00ucGVyZm9ybWFuY2VOb3coKTtcbiAgICBpZiAocmVjb3JkICYmIGlzUHJvZmlsZXJBdmFpbGFibGUpIHtcbiAgICAgIC8vIG5lZWQgdG8gY2FzdCB0byA8YW55PiBiZWNhdXNlIHR5cGUgY2hlY2tlciB0aGlua3MgdGhlcmUncyBubyBhcmd1bWVudFxuICAgICAgLy8gd2hpbGUgaW4gZmFjdCB0aGVyZSBpczpcbiAgICAgIC8vXG4gICAgICAvLyBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9BUEkvQ29uc29sZS9wcm9maWxlRW5kXG4gICAgICAoPGFueT53aW5kb3cuY29uc29sZS5wcm9maWxlRW5kKShwcm9maWxlTmFtZSk7XG4gICAgfVxuICAgIHZhciBtc1BlclRpY2sgPSAoZW5kIC0gc3RhcnQpIC8gbnVtVGlja3M7XG4gICAgd2luZG93LmNvbnNvbGUubG9nKGByYW4gJHtudW1UaWNrc30gY2hhbmdlIGRldGVjdGlvbiBjeWNsZXNgKTtcbiAgICB3aW5kb3cuY29uc29sZS5sb2coYCR7TnVtYmVyV3JhcHBlci50b0ZpeGVkKG1zUGVyVGljaywgMil9IG1zIHBlciBjaGVja2ApO1xuICB9XG59XG4iXX0=