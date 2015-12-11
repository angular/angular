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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tbW9uX3Rvb2xzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYW5ndWxhcjIvc3JjL3BsYXRmb3JtL2Jyb3dzZXIvdG9vbHMvY29tbW9uX3Rvb2xzLnRzIl0sIm5hbWVzIjpbIkFuZ3VsYXJUb29scyIsIkFuZ3VsYXJUb29scy5jb25zdHJ1Y3RvciIsIkFuZ3VsYXJQcm9maWxlciIsIkFuZ3VsYXJQcm9maWxlci5jb25zdHJ1Y3RvciIsIkFuZ3VsYXJQcm9maWxlci50aW1lQ2hhbmdlRGV0ZWN0aW9uIl0sIm1hcHBpbmdzIjoiT0FBTyxFQUFDLGNBQWMsRUFBQyxNQUFNLG1DQUFtQztPQUV6RCxFQUFDLFNBQVMsRUFBRSxhQUFhLEVBQUMsTUFBTSwwQkFBMEI7T0FDMUQsRUFBQyxNQUFNLEVBQUMsTUFBTSw2QkFBNkI7T0FDM0MsRUFBQyxHQUFHLEVBQUMsTUFBTSx1Q0FBdUM7QUFFekQ7OztHQUdHO0FBQ0g7SUFHRUEsWUFBWUEsR0FBaUJBO1FBQUlDLElBQUlBLENBQUNBLFFBQVFBLEdBQUdBLElBQUlBLGVBQWVBLENBQUNBLEdBQUdBLENBQUNBLENBQUNBO0lBQUNBLENBQUNBO0FBQzlFRCxDQUFDQTtBQUVEOzs7R0FHRztBQUNIO0lBR0VFLFlBQVlBLEdBQWlCQTtRQUMzQkMsSUFBSUEsQ0FBQ0EsTUFBTUEsR0FBbUJBLEdBQUlBLENBQUNBLFFBQVFBLENBQUNBLEdBQUdBLENBQUNBLGNBQWNBLENBQUNBLENBQUNBO0lBQ2xFQSxDQUFDQTtJQUVERDs7Ozs7Ozs7Ozs7Ozs7O09BZUdBO0lBQ0hBLG1CQUFtQkEsQ0FBQ0EsTUFBV0E7UUFDN0JFLElBQUlBLE1BQU1BLEdBQUdBLFNBQVNBLENBQUNBLE1BQU1BLENBQUNBLElBQUlBLE1BQU1BLENBQUNBLFFBQVFBLENBQUNBLENBQUNBO1FBQ25EQSxJQUFJQSxXQUFXQSxHQUFHQSxrQkFBa0JBLENBQUNBO1FBQ3JDQSxzRkFBc0ZBO1FBQ3RGQSxJQUFJQSxtQkFBbUJBLEdBQUdBLFNBQVNBLENBQUNBLE1BQU1BLENBQUNBLE9BQU9BLENBQUNBLE9BQU9BLENBQUNBLENBQUNBO1FBQzVEQSxFQUFFQSxDQUFDQSxDQUFDQSxNQUFNQSxJQUFJQSxtQkFBbUJBLENBQUNBLENBQUNBLENBQUNBO1lBQ2xDQSxNQUFNQSxDQUFDQSxPQUFPQSxDQUFDQSxPQUFPQSxDQUFDQSxXQUFXQSxDQUFDQSxDQUFDQTtRQUN0Q0EsQ0FBQ0E7UUFDREEsSUFBSUEsS0FBS0EsR0FBR0EsR0FBR0EsQ0FBQ0EsY0FBY0EsRUFBRUEsQ0FBQ0E7UUFDakNBLElBQUlBLFFBQVFBLEdBQUdBLENBQUNBLENBQUNBO1FBQ2pCQSxPQUFPQSxRQUFRQSxHQUFHQSxDQUFDQSxJQUFJQSxDQUFDQSxHQUFHQSxDQUFDQSxjQUFjQSxFQUFFQSxHQUFHQSxLQUFLQSxDQUFDQSxHQUFHQSxHQUFHQSxFQUFFQSxDQUFDQTtZQUM1REEsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsSUFBSUEsRUFBRUEsQ0FBQ0E7WUFDbkJBLFFBQVFBLEVBQUVBLENBQUNBO1FBQ2JBLENBQUNBO1FBQ0RBLElBQUlBLEdBQUdBLEdBQUdBLEdBQUdBLENBQUNBLGNBQWNBLEVBQUVBLENBQUNBO1FBQy9CQSxFQUFFQSxDQUFDQSxDQUFDQSxNQUFNQSxJQUFJQSxtQkFBbUJBLENBQUNBLENBQUNBLENBQUNBO1lBQ2xDQSx3RUFBd0VBO1lBQ3hFQSwwQkFBMEJBO1lBQzFCQSxFQUFFQTtZQUNGQSxzRUFBc0VBO1lBQ2hFQSxNQUFNQSxDQUFDQSxPQUFPQSxDQUFDQSxVQUFXQSxDQUFDQSxXQUFXQSxDQUFDQSxDQUFDQTtRQUNoREEsQ0FBQ0E7UUFDREEsSUFBSUEsU0FBU0EsR0FBR0EsQ0FBQ0EsR0FBR0EsR0FBR0EsS0FBS0EsQ0FBQ0EsR0FBR0EsUUFBUUEsQ0FBQ0E7UUFDekNBLE1BQU1BLENBQUNBLE9BQU9BLENBQUNBLEdBQUdBLENBQUNBLE9BQU9BLFFBQVFBLDBCQUEwQkEsQ0FBQ0EsQ0FBQ0E7UUFDOURBLE1BQU1BLENBQUNBLE9BQU9BLENBQUNBLEdBQUdBLENBQUNBLEdBQUdBLGFBQWFBLENBQUNBLE9BQU9BLENBQUNBLFNBQVNBLEVBQUVBLENBQUNBLENBQUNBLGVBQWVBLENBQUNBLENBQUNBO0lBQzVFQSxDQUFDQTtBQUNIRixDQUFDQTtBQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtBcHBsaWNhdGlvblJlZn0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvYXBwbGljYXRpb25fcmVmJztcbmltcG9ydCB7Q29tcG9uZW50UmVmLCBDb21wb25lbnRSZWZffSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9saW5rZXIvZHluYW1pY19jb21wb25lbnRfbG9hZGVyJztcbmltcG9ydCB7aXNQcmVzZW50LCBOdW1iZXJXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHt3aW5kb3d9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvYnJvd3Nlcic7XG5pbXBvcnQge0RPTX0gZnJvbSAnYW5ndWxhcjIvc3JjL3BsYXRmb3JtL2RvbS9kb21fYWRhcHRlcic7XG5cbi8qKlxuICogRW50cnkgcG9pbnQgZm9yIGFsbCBBbmd1bGFyIGRlYnVnIHRvb2xzLiBUaGlzIG9iamVjdCBjb3JyZXNwb25kcyB0byB0aGUgYG5nYFxuICogZ2xvYmFsIHZhcmlhYmxlIGFjY2Vzc2libGUgaW4gdGhlIGRldiBjb25zb2xlLlxuICovXG5leHBvcnQgY2xhc3MgQW5ndWxhclRvb2xzIHtcbiAgcHJvZmlsZXI6IEFuZ3VsYXJQcm9maWxlcjtcblxuICBjb25zdHJ1Y3RvcihyZWY6IENvbXBvbmVudFJlZikgeyB0aGlzLnByb2ZpbGVyID0gbmV3IEFuZ3VsYXJQcm9maWxlcihyZWYpOyB9XG59XG5cbi8qKlxuICogRW50cnkgcG9pbnQgZm9yIGFsbCBBbmd1bGFyIHByb2ZpbGluZy1yZWxhdGVkIGRlYnVnIHRvb2xzLiBUaGlzIG9iamVjdFxuICogY29ycmVzcG9uZHMgdG8gdGhlIGBuZy5wcm9maWxlcmAgaW4gdGhlIGRldiBjb25zb2xlLlxuICovXG5leHBvcnQgY2xhc3MgQW5ndWxhclByb2ZpbGVyIHtcbiAgYXBwUmVmOiBBcHBsaWNhdGlvblJlZjtcblxuICBjb25zdHJ1Y3RvcihyZWY6IENvbXBvbmVudFJlZikge1xuICAgIHRoaXMuYXBwUmVmID0gKDxDb21wb25lbnRSZWZfPnJlZikuaW5qZWN0b3IuZ2V0KEFwcGxpY2F0aW9uUmVmKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBFeGVyY2lzZXMgY2hhbmdlIGRldGVjdGlvbiBpbiBhIGxvb3AgYW5kIHRoZW4gcHJpbnRzIHRoZSBhdmVyYWdlIGFtb3VudCBvZlxuICAgKiB0aW1lIGluIG1pbGxpc2Vjb25kcyBob3cgbG9uZyBhIHNpbmdsZSByb3VuZCBvZiBjaGFuZ2UgZGV0ZWN0aW9uIHRha2VzIGZvclxuICAgKiB0aGUgY3VycmVudCBzdGF0ZSBvZiB0aGUgVUkuIEl0IHJ1bnMgYSBtaW5pbXVtIG9mIDUgcm91bmRzIGZvciBhIG1pbmltdW1cbiAgICogb2YgNTAwIG1pbGxpc2Vjb25kcy5cbiAgICpcbiAgICogT3B0aW9uYWxseSwgYSB1c2VyIG1heSBwYXNzIGEgYGNvbmZpZ2AgcGFyYW1ldGVyIGNvbnRhaW5pbmcgYSBtYXAgb2ZcbiAgICogb3B0aW9ucy4gU3VwcG9ydGVkIG9wdGlvbnMgYXJlOlxuICAgKlxuICAgKiBgcmVjb3JkYCAoYm9vbGVhbikgLSBjYXVzZXMgdGhlIHByb2ZpbGVyIHRvIHJlY29yZCBhIENQVSBwcm9maWxlIHdoaWxlXG4gICAqIGl0IGV4ZXJjaXNlcyB0aGUgY2hhbmdlIGRldGVjdG9yLiBFeGFtcGxlOlxuICAgKlxuICAgKiBgYGBcbiAgICogbmcucHJvZmlsZXIudGltZUNoYW5nZURldGVjdGlvbih7cmVjb3JkOiB0cnVlfSlcbiAgICogYGBgXG4gICAqL1xuICB0aW1lQ2hhbmdlRGV0ZWN0aW9uKGNvbmZpZzogYW55KSB7XG4gICAgdmFyIHJlY29yZCA9IGlzUHJlc2VudChjb25maWcpICYmIGNvbmZpZ1sncmVjb3JkJ107XG4gICAgdmFyIHByb2ZpbGVOYW1lID0gJ0NoYW5nZSBEZXRlY3Rpb24nO1xuICAgIC8vIFByb2ZpbGVyIGlzIG5vdCBhdmFpbGFibGUgaW4gQW5kcm9pZCBicm93c2Vycywgbm9yIGluIElFIDkgd2l0aG91dCBkZXYgdG9vbHMgb3BlbmVkXG4gICAgdmFyIGlzUHJvZmlsZXJBdmFpbGFibGUgPSBpc1ByZXNlbnQod2luZG93LmNvbnNvbGUucHJvZmlsZSk7XG4gICAgaWYgKHJlY29yZCAmJiBpc1Byb2ZpbGVyQXZhaWxhYmxlKSB7XG4gICAgICB3aW5kb3cuY29uc29sZS5wcm9maWxlKHByb2ZpbGVOYW1lKTtcbiAgICB9XG4gICAgdmFyIHN0YXJ0ID0gRE9NLnBlcmZvcm1hbmNlTm93KCk7XG4gICAgdmFyIG51bVRpY2tzID0gMDtcbiAgICB3aGlsZSAobnVtVGlja3MgPCA1IHx8IChET00ucGVyZm9ybWFuY2VOb3coKSAtIHN0YXJ0KSA8IDUwMCkge1xuICAgICAgdGhpcy5hcHBSZWYudGljaygpO1xuICAgICAgbnVtVGlja3MrKztcbiAgICB9XG4gICAgdmFyIGVuZCA9IERPTS5wZXJmb3JtYW5jZU5vdygpO1xuICAgIGlmIChyZWNvcmQgJiYgaXNQcm9maWxlckF2YWlsYWJsZSkge1xuICAgICAgLy8gbmVlZCB0byBjYXN0IHRvIDxhbnk+IGJlY2F1c2UgdHlwZSBjaGVja2VyIHRoaW5rcyB0aGVyZSdzIG5vIGFyZ3VtZW50XG4gICAgICAvLyB3aGlsZSBpbiBmYWN0IHRoZXJlIGlzOlxuICAgICAgLy9cbiAgICAgIC8vIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0FQSS9Db25zb2xlL3Byb2ZpbGVFbmRcbiAgICAgICg8YW55PndpbmRvdy5jb25zb2xlLnByb2ZpbGVFbmQpKHByb2ZpbGVOYW1lKTtcbiAgICB9XG4gICAgdmFyIG1zUGVyVGljayA9IChlbmQgLSBzdGFydCkgLyBudW1UaWNrcztcbiAgICB3aW5kb3cuY29uc29sZS5sb2coYHJhbiAke251bVRpY2tzfSBjaGFuZ2UgZGV0ZWN0aW9uIGN5Y2xlc2ApO1xuICAgIHdpbmRvdy5jb25zb2xlLmxvZyhgJHtOdW1iZXJXcmFwcGVyLnRvRml4ZWQobXNQZXJUaWNrLCAyKX0gbXMgcGVyIGNoZWNrYCk7XG4gIH1cbn1cbiJdfQ==