import { ApplicationRef } from 'angular2/src/core/application_ref';
import { isPresent, NumberWrapper } from 'angular2/src/facade/lang';
import { window } from 'angular2/src/facade/browser';
import { DOM } from 'angular2/src/platform/dom/dom_adapter';
export class ChangeDetectionPerfRecord {
    constructor(msPerTick, numTicks) {
        this.msPerTick = msPerTick;
        this.numTicks = numTicks;
    }
}
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
        return new ChangeDetectionPerfRecord(msPerTick, numTicks);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tbW9uX3Rvb2xzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZGlmZmluZ19wbHVnaW5fd3JhcHBlci1vdXRwdXRfcGF0aC1ndE03UWhFbi50bXAvYW5ndWxhcjIvc3JjL3BsYXRmb3JtL2Jyb3dzZXIvdG9vbHMvY29tbW9uX3Rvb2xzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJPQUFPLEVBQUMsY0FBYyxFQUFDLE1BQU0sbUNBQW1DO09BRXpELEVBQUMsU0FBUyxFQUFFLGFBQWEsRUFBQyxNQUFNLDBCQUEwQjtPQUMxRCxFQUFDLE1BQU0sRUFBQyxNQUFNLDZCQUE2QjtPQUMzQyxFQUFDLEdBQUcsRUFBQyxNQUFNLHVDQUF1QztBQUV6RDtJQUNFLFlBQW1CLFNBQWlCLEVBQVMsUUFBZ0I7UUFBMUMsY0FBUyxHQUFULFNBQVMsQ0FBUTtRQUFTLGFBQVEsR0FBUixRQUFRLENBQVE7SUFBRyxDQUFDO0FBQ25FLENBQUM7QUFFRDs7O0dBR0c7QUFDSDtJQUdFLFlBQVksR0FBc0I7UUFBSSxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksZUFBZSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQUMsQ0FBQztBQUNuRixDQUFDO0FBRUQ7OztHQUdHO0FBQ0g7SUFHRSxZQUFZLEdBQXNCO1FBQUksSUFBSSxDQUFDLE1BQU0sR0FBRyxHQUFHLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUMsQ0FBQztJQUFDLENBQUM7SUFFdkY7Ozs7Ozs7Ozs7Ozs7OztPQWVHO0lBQ0gsbUJBQW1CLENBQUMsTUFBVztRQUM3QixJQUFJLE1BQU0sR0FBRyxTQUFTLENBQUMsTUFBTSxDQUFDLElBQUksTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ25ELElBQUksV0FBVyxHQUFHLGtCQUFrQixDQUFDO1FBQ3JDLHNGQUFzRjtRQUN0RixJQUFJLG1CQUFtQixHQUFHLFNBQVMsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQzVELEVBQUUsQ0FBQyxDQUFDLE1BQU0sSUFBSSxtQkFBbUIsQ0FBQyxDQUFDLENBQUM7WUFDbEMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDdEMsQ0FBQztRQUNELElBQUksS0FBSyxHQUFHLEdBQUcsQ0FBQyxjQUFjLEVBQUUsQ0FBQztRQUNqQyxJQUFJLFFBQVEsR0FBRyxDQUFDLENBQUM7UUFDakIsT0FBTyxRQUFRLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLGNBQWMsRUFBRSxHQUFHLEtBQUssQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDO1lBQzVELElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDbkIsUUFBUSxFQUFFLENBQUM7UUFDYixDQUFDO1FBQ0QsSUFBSSxHQUFHLEdBQUcsR0FBRyxDQUFDLGNBQWMsRUFBRSxDQUFDO1FBQy9CLEVBQUUsQ0FBQyxDQUFDLE1BQU0sSUFBSSxtQkFBbUIsQ0FBQyxDQUFDLENBQUM7WUFDbEMsd0VBQXdFO1lBQ3hFLDBCQUEwQjtZQUMxQixFQUFFO1lBQ0Ysc0VBQXNFO1lBQ2hFLE1BQU0sQ0FBQyxPQUFPLENBQUMsVUFBVyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQ2hELENBQUM7UUFDRCxJQUFJLFNBQVMsR0FBRyxDQUFDLEdBQUcsR0FBRyxLQUFLLENBQUMsR0FBRyxRQUFRLENBQUM7UUFDekMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsT0FBTyxRQUFRLDBCQUEwQixDQUFDLENBQUM7UUFDOUQsTUFBTSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxhQUFhLENBQUMsT0FBTyxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUMsZUFBZSxDQUFDLENBQUM7UUFFMUUsTUFBTSxDQUFDLElBQUkseUJBQXlCLENBQUMsU0FBUyxFQUFFLFFBQVEsQ0FBQyxDQUFDO0lBQzVELENBQUM7QUFDSCxDQUFDO0FBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0FwcGxpY2F0aW9uUmVmfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9hcHBsaWNhdGlvbl9yZWYnO1xuaW1wb3J0IHtDb21wb25lbnRSZWZ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2xpbmtlci9jb21wb25lbnRfZmFjdG9yeSc7XG5pbXBvcnQge2lzUHJlc2VudCwgTnVtYmVyV3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcbmltcG9ydCB7d2luZG93fSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2Jyb3dzZXInO1xuaW1wb3J0IHtET019IGZyb20gJ2FuZ3VsYXIyL3NyYy9wbGF0Zm9ybS9kb20vZG9tX2FkYXB0ZXInO1xuXG5leHBvcnQgY2xhc3MgQ2hhbmdlRGV0ZWN0aW9uUGVyZlJlY29yZCB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBtc1BlclRpY2s6IG51bWJlciwgcHVibGljIG51bVRpY2tzOiBudW1iZXIpIHt9XG59XG5cbi8qKlxuICogRW50cnkgcG9pbnQgZm9yIGFsbCBBbmd1bGFyIGRlYnVnIHRvb2xzLiBUaGlzIG9iamVjdCBjb3JyZXNwb25kcyB0byB0aGUgYG5nYFxuICogZ2xvYmFsIHZhcmlhYmxlIGFjY2Vzc2libGUgaW4gdGhlIGRldiBjb25zb2xlLlxuICovXG5leHBvcnQgY2xhc3MgQW5ndWxhclRvb2xzIHtcbiAgcHJvZmlsZXI6IEFuZ3VsYXJQcm9maWxlcjtcblxuICBjb25zdHJ1Y3RvcihyZWY6IENvbXBvbmVudFJlZjxhbnk+KSB7IHRoaXMucHJvZmlsZXIgPSBuZXcgQW5ndWxhclByb2ZpbGVyKHJlZik7IH1cbn1cblxuLyoqXG4gKiBFbnRyeSBwb2ludCBmb3IgYWxsIEFuZ3VsYXIgcHJvZmlsaW5nLXJlbGF0ZWQgZGVidWcgdG9vbHMuIFRoaXMgb2JqZWN0XG4gKiBjb3JyZXNwb25kcyB0byB0aGUgYG5nLnByb2ZpbGVyYCBpbiB0aGUgZGV2IGNvbnNvbGUuXG4gKi9cbmV4cG9ydCBjbGFzcyBBbmd1bGFyUHJvZmlsZXIge1xuICBhcHBSZWY6IEFwcGxpY2F0aW9uUmVmO1xuXG4gIGNvbnN0cnVjdG9yKHJlZjogQ29tcG9uZW50UmVmPGFueT4pIHsgdGhpcy5hcHBSZWYgPSByZWYuaW5qZWN0b3IuZ2V0KEFwcGxpY2F0aW9uUmVmKTsgfVxuXG4gIC8qKlxuICAgKiBFeGVyY2lzZXMgY2hhbmdlIGRldGVjdGlvbiBpbiBhIGxvb3AgYW5kIHRoZW4gcHJpbnRzIHRoZSBhdmVyYWdlIGFtb3VudCBvZlxuICAgKiB0aW1lIGluIG1pbGxpc2Vjb25kcyBob3cgbG9uZyBhIHNpbmdsZSByb3VuZCBvZiBjaGFuZ2UgZGV0ZWN0aW9uIHRha2VzIGZvclxuICAgKiB0aGUgY3VycmVudCBzdGF0ZSBvZiB0aGUgVUkuIEl0IHJ1bnMgYSBtaW5pbXVtIG9mIDUgcm91bmRzIGZvciBhIG1pbmltdW1cbiAgICogb2YgNTAwIG1pbGxpc2Vjb25kcy5cbiAgICpcbiAgICogT3B0aW9uYWxseSwgYSB1c2VyIG1heSBwYXNzIGEgYGNvbmZpZ2AgcGFyYW1ldGVyIGNvbnRhaW5pbmcgYSBtYXAgb2ZcbiAgICogb3B0aW9ucy4gU3VwcG9ydGVkIG9wdGlvbnMgYXJlOlxuICAgKlxuICAgKiBgcmVjb3JkYCAoYm9vbGVhbikgLSBjYXVzZXMgdGhlIHByb2ZpbGVyIHRvIHJlY29yZCBhIENQVSBwcm9maWxlIHdoaWxlXG4gICAqIGl0IGV4ZXJjaXNlcyB0aGUgY2hhbmdlIGRldGVjdG9yLiBFeGFtcGxlOlxuICAgKlxuICAgKiBgYGBcbiAgICogbmcucHJvZmlsZXIudGltZUNoYW5nZURldGVjdGlvbih7cmVjb3JkOiB0cnVlfSlcbiAgICogYGBgXG4gICAqL1xuICB0aW1lQ2hhbmdlRGV0ZWN0aW9uKGNvbmZpZzogYW55KTogQ2hhbmdlRGV0ZWN0aW9uUGVyZlJlY29yZCB7XG4gICAgdmFyIHJlY29yZCA9IGlzUHJlc2VudChjb25maWcpICYmIGNvbmZpZ1sncmVjb3JkJ107XG4gICAgdmFyIHByb2ZpbGVOYW1lID0gJ0NoYW5nZSBEZXRlY3Rpb24nO1xuICAgIC8vIFByb2ZpbGVyIGlzIG5vdCBhdmFpbGFibGUgaW4gQW5kcm9pZCBicm93c2Vycywgbm9yIGluIElFIDkgd2l0aG91dCBkZXYgdG9vbHMgb3BlbmVkXG4gICAgdmFyIGlzUHJvZmlsZXJBdmFpbGFibGUgPSBpc1ByZXNlbnQod2luZG93LmNvbnNvbGUucHJvZmlsZSk7XG4gICAgaWYgKHJlY29yZCAmJiBpc1Byb2ZpbGVyQXZhaWxhYmxlKSB7XG4gICAgICB3aW5kb3cuY29uc29sZS5wcm9maWxlKHByb2ZpbGVOYW1lKTtcbiAgICB9XG4gICAgdmFyIHN0YXJ0ID0gRE9NLnBlcmZvcm1hbmNlTm93KCk7XG4gICAgdmFyIG51bVRpY2tzID0gMDtcbiAgICB3aGlsZSAobnVtVGlja3MgPCA1IHx8IChET00ucGVyZm9ybWFuY2VOb3coKSAtIHN0YXJ0KSA8IDUwMCkge1xuICAgICAgdGhpcy5hcHBSZWYudGljaygpO1xuICAgICAgbnVtVGlja3MrKztcbiAgICB9XG4gICAgdmFyIGVuZCA9IERPTS5wZXJmb3JtYW5jZU5vdygpO1xuICAgIGlmIChyZWNvcmQgJiYgaXNQcm9maWxlckF2YWlsYWJsZSkge1xuICAgICAgLy8gbmVlZCB0byBjYXN0IHRvIDxhbnk+IGJlY2F1c2UgdHlwZSBjaGVja2VyIHRoaW5rcyB0aGVyZSdzIG5vIGFyZ3VtZW50XG4gICAgICAvLyB3aGlsZSBpbiBmYWN0IHRoZXJlIGlzOlxuICAgICAgLy9cbiAgICAgIC8vIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0FQSS9Db25zb2xlL3Byb2ZpbGVFbmRcbiAgICAgICg8YW55PndpbmRvdy5jb25zb2xlLnByb2ZpbGVFbmQpKHByb2ZpbGVOYW1lKTtcbiAgICB9XG4gICAgdmFyIG1zUGVyVGljayA9IChlbmQgLSBzdGFydCkgLyBudW1UaWNrcztcbiAgICB3aW5kb3cuY29uc29sZS5sb2coYHJhbiAke251bVRpY2tzfSBjaGFuZ2UgZGV0ZWN0aW9uIGN5Y2xlc2ApO1xuICAgIHdpbmRvdy5jb25zb2xlLmxvZyhgJHtOdW1iZXJXcmFwcGVyLnRvRml4ZWQobXNQZXJUaWNrLCAyKX0gbXMgcGVyIGNoZWNrYCk7XG5cbiAgICByZXR1cm4gbmV3IENoYW5nZURldGVjdGlvblBlcmZSZWNvcmQobXNQZXJUaWNrLCBudW1UaWNrcyk7XG4gIH1cbn1cbiJdfQ==