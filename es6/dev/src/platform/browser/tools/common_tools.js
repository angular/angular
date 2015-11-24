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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tbW9uX3Rvb2xzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYW5ndWxhcjIvc3JjL3BsYXRmb3JtL2Jyb3dzZXIvdG9vbHMvY29tbW9uX3Rvb2xzLnRzIl0sIm5hbWVzIjpbIkFuZ3VsYXJUb29scyIsIkFuZ3VsYXJUb29scy5jb25zdHJ1Y3RvciIsIkFuZ3VsYXJQcm9maWxlciIsIkFuZ3VsYXJQcm9maWxlci5jb25zdHJ1Y3RvciIsIkFuZ3VsYXJQcm9maWxlci50aW1lQ2hhbmdlRGV0ZWN0aW9uIl0sIm1hcHBpbmdzIjoiT0FBTyxFQUFDLGNBQWMsRUFBQyxNQUFNLG1DQUFtQztPQUV6RCxFQUFDLFNBQVMsRUFBRSxhQUFhLEVBQUMsTUFBTSwwQkFBMEI7T0FDMUQsRUFBYyxNQUFNLEVBQUMsTUFBTSw2QkFBNkI7T0FDeEQsRUFBQyxHQUFHLEVBQUMsTUFBTSx1Q0FBdUM7QUFFekQ7OztHQUdHO0FBQ0g7SUFHRUEsWUFBWUEsR0FBaUJBO1FBQUlDLElBQUlBLENBQUNBLFFBQVFBLEdBQUdBLElBQUlBLGVBQWVBLENBQUNBLEdBQUdBLENBQUNBLENBQUNBO0lBQUNBLENBQUNBO0FBQzlFRCxDQUFDQTtBQUVEOzs7R0FHRztBQUNIO0lBR0VFLFlBQVlBLEdBQWlCQTtRQUMzQkMsSUFBSUEsQ0FBQ0EsTUFBTUEsR0FBbUJBLEdBQUlBLENBQUNBLFFBQVFBLENBQUNBLEdBQUdBLENBQUNBLGNBQWNBLENBQUNBLENBQUNBO0lBQ2xFQSxDQUFDQTtJQUVERDs7Ozs7Ozs7Ozs7Ozs7O09BZUdBO0lBQ0hBLG1CQUFtQkEsQ0FBQ0EsTUFBV0E7UUFDN0JFLElBQUlBLE1BQU1BLEdBQUdBLFNBQVNBLENBQUNBLE1BQU1BLENBQUNBLElBQUlBLE1BQU1BLENBQUNBLFFBQVFBLENBQUNBLENBQUNBO1FBQ25EQSxJQUFJQSxXQUFXQSxHQUFHQSxrQkFBa0JBLENBQUNBO1FBQ3JDQSxzRkFBc0ZBO1FBQ3RGQSxJQUFJQSxtQkFBbUJBLEdBQUdBLFNBQVNBLENBQUNBLE1BQU1BLENBQUNBLE9BQU9BLENBQUNBLE9BQU9BLENBQUNBLENBQUNBO1FBQzVEQSxFQUFFQSxDQUFDQSxDQUFDQSxNQUFNQSxJQUFJQSxtQkFBbUJBLENBQUNBLENBQUNBLENBQUNBO1lBQ2xDQSxNQUFNQSxDQUFDQSxPQUFPQSxDQUFDQSxPQUFPQSxDQUFDQSxXQUFXQSxDQUFDQSxDQUFDQTtRQUN0Q0EsQ0FBQ0E7UUFDREEsSUFBSUEsS0FBS0EsR0FBR0EsR0FBR0EsQ0FBQ0EsY0FBY0EsRUFBRUEsQ0FBQ0E7UUFDakNBLElBQUlBLFFBQVFBLEdBQUdBLENBQUNBLENBQUNBO1FBQ2pCQSxPQUFPQSxRQUFRQSxHQUFHQSxDQUFDQSxJQUFJQSxDQUFDQSxHQUFHQSxDQUFDQSxjQUFjQSxFQUFFQSxHQUFHQSxLQUFLQSxDQUFDQSxHQUFHQSxHQUFHQSxFQUFFQSxDQUFDQTtZQUM1REEsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsSUFBSUEsRUFBRUEsQ0FBQ0E7WUFDbkJBLFFBQVFBLEVBQUVBLENBQUNBO1FBQ2JBLENBQUNBO1FBQ0RBLElBQUlBLEdBQUdBLEdBQUdBLEdBQUdBLENBQUNBLGNBQWNBLEVBQUVBLENBQUNBO1FBQy9CQSxFQUFFQSxDQUFDQSxDQUFDQSxNQUFNQSxJQUFJQSxtQkFBbUJBLENBQUNBLENBQUNBLENBQUNBO1lBQ2xDQSx3RUFBd0VBO1lBQ3hFQSwwQkFBMEJBO1lBQzFCQSxFQUFFQTtZQUNGQSxzRUFBc0VBO1lBQ2hFQSxNQUFNQSxDQUFDQSxPQUFPQSxDQUFDQSxVQUFXQSxDQUFDQSxXQUFXQSxDQUFDQSxDQUFDQTtRQUNoREEsQ0FBQ0E7UUFDREEsSUFBSUEsU0FBU0EsR0FBR0EsQ0FBQ0EsR0FBR0EsR0FBR0EsS0FBS0EsQ0FBQ0EsR0FBR0EsUUFBUUEsQ0FBQ0E7UUFDekNBLE1BQU1BLENBQUNBLE9BQU9BLENBQUNBLEdBQUdBLENBQUNBLE9BQU9BLFFBQVFBLDBCQUEwQkEsQ0FBQ0EsQ0FBQ0E7UUFDOURBLE1BQU1BLENBQUNBLE9BQU9BLENBQUNBLEdBQUdBLENBQUNBLEdBQUdBLGFBQWFBLENBQUNBLE9BQU9BLENBQUNBLFNBQVNBLEVBQUVBLENBQUNBLENBQUNBLGVBQWVBLENBQUNBLENBQUNBO0lBQzVFQSxDQUFDQTtBQUNIRixDQUFDQTtBQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtBcHBsaWNhdGlvblJlZn0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvYXBwbGljYXRpb25fcmVmJztcbmltcG9ydCB7Q29tcG9uZW50UmVmLCBDb21wb25lbnRSZWZffSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9saW5rZXIvZHluYW1pY19jb21wb25lbnRfbG9hZGVyJztcbmltcG9ydCB7aXNQcmVzZW50LCBOdW1iZXJXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHtwZXJmb3JtYW5jZSwgd2luZG93fSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2Jyb3dzZXInO1xuaW1wb3J0IHtET019IGZyb20gJ2FuZ3VsYXIyL3NyYy9wbGF0Zm9ybS9kb20vZG9tX2FkYXB0ZXInO1xuXG4vKipcbiAqIEVudHJ5IHBvaW50IGZvciBhbGwgQW5ndWxhciBkZWJ1ZyB0b29scy4gVGhpcyBvYmplY3QgY29ycmVzcG9uZHMgdG8gdGhlIGBuZ2BcbiAqIGdsb2JhbCB2YXJpYWJsZSBhY2Nlc3NpYmxlIGluIHRoZSBkZXYgY29uc29sZS5cbiAqL1xuZXhwb3J0IGNsYXNzIEFuZ3VsYXJUb29scyB7XG4gIHByb2ZpbGVyOiBBbmd1bGFyUHJvZmlsZXI7XG5cbiAgY29uc3RydWN0b3IocmVmOiBDb21wb25lbnRSZWYpIHsgdGhpcy5wcm9maWxlciA9IG5ldyBBbmd1bGFyUHJvZmlsZXIocmVmKTsgfVxufVxuXG4vKipcbiAqIEVudHJ5IHBvaW50IGZvciBhbGwgQW5ndWxhciBwcm9maWxpbmctcmVsYXRlZCBkZWJ1ZyB0b29scy4gVGhpcyBvYmplY3RcbiAqIGNvcnJlc3BvbmRzIHRvIHRoZSBgbmcucHJvZmlsZXJgIGluIHRoZSBkZXYgY29uc29sZS5cbiAqL1xuZXhwb3J0IGNsYXNzIEFuZ3VsYXJQcm9maWxlciB7XG4gIGFwcFJlZjogQXBwbGljYXRpb25SZWY7XG5cbiAgY29uc3RydWN0b3IocmVmOiBDb21wb25lbnRSZWYpIHtcbiAgICB0aGlzLmFwcFJlZiA9ICg8Q29tcG9uZW50UmVmXz5yZWYpLmluamVjdG9yLmdldChBcHBsaWNhdGlvblJlZik7XG4gIH1cblxuICAvKipcbiAgICogRXhlcmNpc2VzIGNoYW5nZSBkZXRlY3Rpb24gaW4gYSBsb29wIGFuZCB0aGVuIHByaW50cyB0aGUgYXZlcmFnZSBhbW91bnQgb2ZcbiAgICogdGltZSBpbiBtaWxsaXNlY29uZHMgaG93IGxvbmcgYSBzaW5nbGUgcm91bmQgb2YgY2hhbmdlIGRldGVjdGlvbiB0YWtlcyBmb3JcbiAgICogdGhlIGN1cnJlbnQgc3RhdGUgb2YgdGhlIFVJLiBJdCBydW5zIGEgbWluaW11bSBvZiA1IHJvdW5kcyBmb3IgYSBtaW5pbXVtXG4gICAqIG9mIDUwMCBtaWxsaXNlY29uZHMuXG4gICAqXG4gICAqIE9wdGlvbmFsbHksIGEgdXNlciBtYXkgcGFzcyBhIGBjb25maWdgIHBhcmFtZXRlciBjb250YWluaW5nIGEgbWFwIG9mXG4gICAqIG9wdGlvbnMuIFN1cHBvcnRlZCBvcHRpb25zIGFyZTpcbiAgICpcbiAgICogYHJlY29yZGAgKGJvb2xlYW4pIC0gY2F1c2VzIHRoZSBwcm9maWxlciB0byByZWNvcmQgYSBDUFUgcHJvZmlsZSB3aGlsZVxuICAgKiBpdCBleGVyY2lzZXMgdGhlIGNoYW5nZSBkZXRlY3Rvci4gRXhhbXBsZTpcbiAgICpcbiAgICogYGBgXG4gICAqIG5nLnByb2ZpbGVyLnRpbWVDaGFuZ2VEZXRlY3Rpb24oe3JlY29yZDogdHJ1ZX0pXG4gICAqIGBgYFxuICAgKi9cbiAgdGltZUNoYW5nZURldGVjdGlvbihjb25maWc6IGFueSkge1xuICAgIHZhciByZWNvcmQgPSBpc1ByZXNlbnQoY29uZmlnKSAmJiBjb25maWdbJ3JlY29yZCddO1xuICAgIHZhciBwcm9maWxlTmFtZSA9ICdDaGFuZ2UgRGV0ZWN0aW9uJztcbiAgICAvLyBQcm9maWxlciBpcyBub3QgYXZhaWxhYmxlIGluIEFuZHJvaWQgYnJvd3NlcnMsIG5vciBpbiBJRSA5IHdpdGhvdXQgZGV2IHRvb2xzIG9wZW5lZFxuICAgIHZhciBpc1Byb2ZpbGVyQXZhaWxhYmxlID0gaXNQcmVzZW50KHdpbmRvdy5jb25zb2xlLnByb2ZpbGUpO1xuICAgIGlmIChyZWNvcmQgJiYgaXNQcm9maWxlckF2YWlsYWJsZSkge1xuICAgICAgd2luZG93LmNvbnNvbGUucHJvZmlsZShwcm9maWxlTmFtZSk7XG4gICAgfVxuICAgIHZhciBzdGFydCA9IERPTS5wZXJmb3JtYW5jZU5vdygpO1xuICAgIHZhciBudW1UaWNrcyA9IDA7XG4gICAgd2hpbGUgKG51bVRpY2tzIDwgNSB8fCAoRE9NLnBlcmZvcm1hbmNlTm93KCkgLSBzdGFydCkgPCA1MDApIHtcbiAgICAgIHRoaXMuYXBwUmVmLnRpY2soKTtcbiAgICAgIG51bVRpY2tzKys7XG4gICAgfVxuICAgIHZhciBlbmQgPSBET00ucGVyZm9ybWFuY2VOb3coKTtcbiAgICBpZiAocmVjb3JkICYmIGlzUHJvZmlsZXJBdmFpbGFibGUpIHtcbiAgICAgIC8vIG5lZWQgdG8gY2FzdCB0byA8YW55PiBiZWNhdXNlIHR5cGUgY2hlY2tlciB0aGlua3MgdGhlcmUncyBubyBhcmd1bWVudFxuICAgICAgLy8gd2hpbGUgaW4gZmFjdCB0aGVyZSBpczpcbiAgICAgIC8vXG4gICAgICAvLyBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9BUEkvQ29uc29sZS9wcm9maWxlRW5kXG4gICAgICAoPGFueT53aW5kb3cuY29uc29sZS5wcm9maWxlRW5kKShwcm9maWxlTmFtZSk7XG4gICAgfVxuICAgIHZhciBtc1BlclRpY2sgPSAoZW5kIC0gc3RhcnQpIC8gbnVtVGlja3M7XG4gICAgd2luZG93LmNvbnNvbGUubG9nKGByYW4gJHtudW1UaWNrc30gY2hhbmdlIGRldGVjdGlvbiBjeWNsZXNgKTtcbiAgICB3aW5kb3cuY29uc29sZS5sb2coYCR7TnVtYmVyV3JhcHBlci50b0ZpeGVkKG1zUGVyVGljaywgMil9IG1zIHBlciBjaGVja2ApO1xuICB9XG59XG4iXX0=