'use strict';"use strict";
var application_ref_1 = require('angular2/src/core/application_ref');
var lang_1 = require('angular2/src/facade/lang');
var browser_1 = require('angular2/src/facade/browser');
var dom_adapter_1 = require('angular2/src/platform/dom/dom_adapter');
var ChangeDetectionPerfRecord = (function () {
    function ChangeDetectionPerfRecord(msPerTick, numTicks) {
        this.msPerTick = msPerTick;
        this.numTicks = numTicks;
    }
    return ChangeDetectionPerfRecord;
}());
exports.ChangeDetectionPerfRecord = ChangeDetectionPerfRecord;
/**
 * Entry point for all Angular debug tools. This object corresponds to the `ng`
 * global variable accessible in the dev console.
 */
var AngularTools = (function () {
    function AngularTools(ref) {
        this.profiler = new AngularProfiler(ref);
    }
    return AngularTools;
}());
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
        return new ChangeDetectionPerfRecord(msPerTick, numTicks);
    };
    return AngularProfiler;
}());
exports.AngularProfiler = AngularProfiler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tbW9uX3Rvb2xzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZGlmZmluZ19wbHVnaW5fd3JhcHBlci1vdXRwdXRfcGF0aC1yNVBySks5aC50bXAvYW5ndWxhcjIvc3JjL3BsYXRmb3JtL2Jyb3dzZXIvdG9vbHMvY29tbW9uX3Rvb2xzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxnQ0FBNkIsbUNBQW1DLENBQUMsQ0FBQTtBQUVqRSxxQkFBdUMsMEJBQTBCLENBQUMsQ0FBQTtBQUNsRSx3QkFBcUIsNkJBQTZCLENBQUMsQ0FBQTtBQUNuRCw0QkFBa0IsdUNBQXVDLENBQUMsQ0FBQTtBQUUxRDtJQUNFLG1DQUFtQixTQUFpQixFQUFTLFFBQWdCO1FBQTFDLGNBQVMsR0FBVCxTQUFTLENBQVE7UUFBUyxhQUFRLEdBQVIsUUFBUSxDQUFRO0lBQUcsQ0FBQztJQUNuRSxnQ0FBQztBQUFELENBQUMsQUFGRCxJQUVDO0FBRlksaUNBQXlCLDRCQUVyQyxDQUFBO0FBRUQ7OztHQUdHO0FBQ0g7SUFHRSxzQkFBWSxHQUFzQjtRQUFJLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxlQUFlLENBQUMsR0FBRyxDQUFDLENBQUM7SUFBQyxDQUFDO0lBQ25GLG1CQUFDO0FBQUQsQ0FBQyxBQUpELElBSUM7QUFKWSxvQkFBWSxlQUl4QixDQUFBO0FBRUQ7OztHQUdHO0FBQ0g7SUFHRSx5QkFBWSxHQUFzQjtRQUFJLElBQUksQ0FBQyxNQUFNLEdBQUcsR0FBRyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsZ0NBQWMsQ0FBQyxDQUFDO0lBQUMsQ0FBQztJQUV2Rjs7Ozs7Ozs7Ozs7Ozs7O09BZUc7SUFDSCw2Q0FBbUIsR0FBbkIsVUFBb0IsTUFBVztRQUM3QixJQUFJLE1BQU0sR0FBRyxnQkFBUyxDQUFDLE1BQU0sQ0FBQyxJQUFJLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUNuRCxJQUFJLFdBQVcsR0FBRyxrQkFBa0IsQ0FBQztRQUNyQyxzRkFBc0Y7UUFDdEYsSUFBSSxtQkFBbUIsR0FBRyxnQkFBUyxDQUFDLGdCQUFNLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQzVELEVBQUUsQ0FBQyxDQUFDLE1BQU0sSUFBSSxtQkFBbUIsQ0FBQyxDQUFDLENBQUM7WUFDbEMsZ0JBQU0sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQ3RDLENBQUM7UUFDRCxJQUFJLEtBQUssR0FBRyxpQkFBRyxDQUFDLGNBQWMsRUFBRSxDQUFDO1FBQ2pDLElBQUksUUFBUSxHQUFHLENBQUMsQ0FBQztRQUNqQixPQUFPLFFBQVEsR0FBRyxDQUFDLElBQUksQ0FBQyxpQkFBRyxDQUFDLGNBQWMsRUFBRSxHQUFHLEtBQUssQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDO1lBQzVELElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDbkIsUUFBUSxFQUFFLENBQUM7UUFDYixDQUFDO1FBQ0QsSUFBSSxHQUFHLEdBQUcsaUJBQUcsQ0FBQyxjQUFjLEVBQUUsQ0FBQztRQUMvQixFQUFFLENBQUMsQ0FBQyxNQUFNLElBQUksbUJBQW1CLENBQUMsQ0FBQyxDQUFDO1lBQ2xDLHdFQUF3RTtZQUN4RSwwQkFBMEI7WUFDMUIsRUFBRTtZQUNGLHNFQUFzRTtZQUNoRSxnQkFBTSxDQUFDLE9BQU8sQ0FBQyxVQUFXLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDaEQsQ0FBQztRQUNELElBQUksU0FBUyxHQUFHLENBQUMsR0FBRyxHQUFHLEtBQUssQ0FBQyxHQUFHLFFBQVEsQ0FBQztRQUN6QyxnQkFBTSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsU0FBTyxRQUFRLDZCQUEwQixDQUFDLENBQUM7UUFDOUQsZ0JBQU0sQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFJLG9CQUFhLENBQUMsT0FBTyxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUMsa0JBQWUsQ0FBQyxDQUFDO1FBRTFFLE1BQU0sQ0FBQyxJQUFJLHlCQUF5QixDQUFDLFNBQVMsRUFBRSxRQUFRLENBQUMsQ0FBQztJQUM1RCxDQUFDO0lBQ0gsc0JBQUM7QUFBRCxDQUFDLEFBakRELElBaURDO0FBakRZLHVCQUFlLGtCQWlEM0IsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7QXBwbGljYXRpb25SZWZ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2FwcGxpY2F0aW9uX3JlZic7XG5pbXBvcnQge0NvbXBvbmVudFJlZn0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvbGlua2VyL2NvbXBvbmVudF9mYWN0b3J5JztcbmltcG9ydCB7aXNQcmVzZW50LCBOdW1iZXJXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHt3aW5kb3d9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvYnJvd3Nlcic7XG5pbXBvcnQge0RPTX0gZnJvbSAnYW5ndWxhcjIvc3JjL3BsYXRmb3JtL2RvbS9kb21fYWRhcHRlcic7XG5cbmV4cG9ydCBjbGFzcyBDaGFuZ2VEZXRlY3Rpb25QZXJmUmVjb3JkIHtcbiAgY29uc3RydWN0b3IocHVibGljIG1zUGVyVGljazogbnVtYmVyLCBwdWJsaWMgbnVtVGlja3M6IG51bWJlcikge31cbn1cblxuLyoqXG4gKiBFbnRyeSBwb2ludCBmb3IgYWxsIEFuZ3VsYXIgZGVidWcgdG9vbHMuIFRoaXMgb2JqZWN0IGNvcnJlc3BvbmRzIHRvIHRoZSBgbmdgXG4gKiBnbG9iYWwgdmFyaWFibGUgYWNjZXNzaWJsZSBpbiB0aGUgZGV2IGNvbnNvbGUuXG4gKi9cbmV4cG9ydCBjbGFzcyBBbmd1bGFyVG9vbHMge1xuICBwcm9maWxlcjogQW5ndWxhclByb2ZpbGVyO1xuXG4gIGNvbnN0cnVjdG9yKHJlZjogQ29tcG9uZW50UmVmPGFueT4pIHsgdGhpcy5wcm9maWxlciA9IG5ldyBBbmd1bGFyUHJvZmlsZXIocmVmKTsgfVxufVxuXG4vKipcbiAqIEVudHJ5IHBvaW50IGZvciBhbGwgQW5ndWxhciBwcm9maWxpbmctcmVsYXRlZCBkZWJ1ZyB0b29scy4gVGhpcyBvYmplY3RcbiAqIGNvcnJlc3BvbmRzIHRvIHRoZSBgbmcucHJvZmlsZXJgIGluIHRoZSBkZXYgY29uc29sZS5cbiAqL1xuZXhwb3J0IGNsYXNzIEFuZ3VsYXJQcm9maWxlciB7XG4gIGFwcFJlZjogQXBwbGljYXRpb25SZWY7XG5cbiAgY29uc3RydWN0b3IocmVmOiBDb21wb25lbnRSZWY8YW55PikgeyB0aGlzLmFwcFJlZiA9IHJlZi5pbmplY3Rvci5nZXQoQXBwbGljYXRpb25SZWYpOyB9XG5cbiAgLyoqXG4gICAqIEV4ZXJjaXNlcyBjaGFuZ2UgZGV0ZWN0aW9uIGluIGEgbG9vcCBhbmQgdGhlbiBwcmludHMgdGhlIGF2ZXJhZ2UgYW1vdW50IG9mXG4gICAqIHRpbWUgaW4gbWlsbGlzZWNvbmRzIGhvdyBsb25nIGEgc2luZ2xlIHJvdW5kIG9mIGNoYW5nZSBkZXRlY3Rpb24gdGFrZXMgZm9yXG4gICAqIHRoZSBjdXJyZW50IHN0YXRlIG9mIHRoZSBVSS4gSXQgcnVucyBhIG1pbmltdW0gb2YgNSByb3VuZHMgZm9yIGEgbWluaW11bVxuICAgKiBvZiA1MDAgbWlsbGlzZWNvbmRzLlxuICAgKlxuICAgKiBPcHRpb25hbGx5LCBhIHVzZXIgbWF5IHBhc3MgYSBgY29uZmlnYCBwYXJhbWV0ZXIgY29udGFpbmluZyBhIG1hcCBvZlxuICAgKiBvcHRpb25zLiBTdXBwb3J0ZWQgb3B0aW9ucyBhcmU6XG4gICAqXG4gICAqIGByZWNvcmRgIChib29sZWFuKSAtIGNhdXNlcyB0aGUgcHJvZmlsZXIgdG8gcmVjb3JkIGEgQ1BVIHByb2ZpbGUgd2hpbGVcbiAgICogaXQgZXhlcmNpc2VzIHRoZSBjaGFuZ2UgZGV0ZWN0b3IuIEV4YW1wbGU6XG4gICAqXG4gICAqIGBgYFxuICAgKiBuZy5wcm9maWxlci50aW1lQ2hhbmdlRGV0ZWN0aW9uKHtyZWNvcmQ6IHRydWV9KVxuICAgKiBgYGBcbiAgICovXG4gIHRpbWVDaGFuZ2VEZXRlY3Rpb24oY29uZmlnOiBhbnkpOiBDaGFuZ2VEZXRlY3Rpb25QZXJmUmVjb3JkIHtcbiAgICB2YXIgcmVjb3JkID0gaXNQcmVzZW50KGNvbmZpZykgJiYgY29uZmlnWydyZWNvcmQnXTtcbiAgICB2YXIgcHJvZmlsZU5hbWUgPSAnQ2hhbmdlIERldGVjdGlvbic7XG4gICAgLy8gUHJvZmlsZXIgaXMgbm90IGF2YWlsYWJsZSBpbiBBbmRyb2lkIGJyb3dzZXJzLCBub3IgaW4gSUUgOSB3aXRob3V0IGRldiB0b29scyBvcGVuZWRcbiAgICB2YXIgaXNQcm9maWxlckF2YWlsYWJsZSA9IGlzUHJlc2VudCh3aW5kb3cuY29uc29sZS5wcm9maWxlKTtcbiAgICBpZiAocmVjb3JkICYmIGlzUHJvZmlsZXJBdmFpbGFibGUpIHtcbiAgICAgIHdpbmRvdy5jb25zb2xlLnByb2ZpbGUocHJvZmlsZU5hbWUpO1xuICAgIH1cbiAgICB2YXIgc3RhcnQgPSBET00ucGVyZm9ybWFuY2VOb3coKTtcbiAgICB2YXIgbnVtVGlja3MgPSAwO1xuICAgIHdoaWxlIChudW1UaWNrcyA8IDUgfHwgKERPTS5wZXJmb3JtYW5jZU5vdygpIC0gc3RhcnQpIDwgNTAwKSB7XG4gICAgICB0aGlzLmFwcFJlZi50aWNrKCk7XG4gICAgICBudW1UaWNrcysrO1xuICAgIH1cbiAgICB2YXIgZW5kID0gRE9NLnBlcmZvcm1hbmNlTm93KCk7XG4gICAgaWYgKHJlY29yZCAmJiBpc1Byb2ZpbGVyQXZhaWxhYmxlKSB7XG4gICAgICAvLyBuZWVkIHRvIGNhc3QgdG8gPGFueT4gYmVjYXVzZSB0eXBlIGNoZWNrZXIgdGhpbmtzIHRoZXJlJ3Mgbm8gYXJndW1lbnRcbiAgICAgIC8vIHdoaWxlIGluIGZhY3QgdGhlcmUgaXM6XG4gICAgICAvL1xuICAgICAgLy8gaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQVBJL0NvbnNvbGUvcHJvZmlsZUVuZFxuICAgICAgKDxhbnk+d2luZG93LmNvbnNvbGUucHJvZmlsZUVuZCkocHJvZmlsZU5hbWUpO1xuICAgIH1cbiAgICB2YXIgbXNQZXJUaWNrID0gKGVuZCAtIHN0YXJ0KSAvIG51bVRpY2tzO1xuICAgIHdpbmRvdy5jb25zb2xlLmxvZyhgcmFuICR7bnVtVGlja3N9IGNoYW5nZSBkZXRlY3Rpb24gY3ljbGVzYCk7XG4gICAgd2luZG93LmNvbnNvbGUubG9nKGAke051bWJlcldyYXBwZXIudG9GaXhlZChtc1BlclRpY2ssIDIpfSBtcyBwZXIgY2hlY2tgKTtcblxuICAgIHJldHVybiBuZXcgQ2hhbmdlRGV0ZWN0aW9uUGVyZlJlY29yZChtc1BlclRpY2ssIG51bVRpY2tzKTtcbiAgfVxufVxuIl19