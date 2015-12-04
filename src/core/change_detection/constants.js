'use strict';var lang_1 = require('angular2/src/facade/lang');
(function (ChangeDetectorState) {
    /**
     * `NeverChecked` means that the change detector has not been checked yet, and
     * initialization methods should be called during detection.
     */
    ChangeDetectorState[ChangeDetectorState["NeverChecked"] = 0] = "NeverChecked";
    /**
     * `CheckedBefore` means that the change detector has successfully completed at least
     * one detection previously.
     */
    ChangeDetectorState[ChangeDetectorState["CheckedBefore"] = 1] = "CheckedBefore";
    /**
     * `Errored` means that the change detector encountered an error checking a binding
     * or calling a directive lifecycle method and is now in an inconsistent state. Change
     * detectors in this state will no longer detect changes.
     */
    ChangeDetectorState[ChangeDetectorState["Errored"] = 2] = "Errored";
})(exports.ChangeDetectorState || (exports.ChangeDetectorState = {}));
var ChangeDetectorState = exports.ChangeDetectorState;
(function (ChangeDetectionStrategy) {
    /**
     * `CheckedOnce` means that after calling detectChanges the mode of the change detector
     * will become `Checked`.
     */
    ChangeDetectionStrategy[ChangeDetectionStrategy["CheckOnce"] = 0] = "CheckOnce";
    /**
     * `Checked` means that the change detector should be skipped until its mode changes to
     * `CheckOnce`.
     */
    ChangeDetectionStrategy[ChangeDetectionStrategy["Checked"] = 1] = "Checked";
    /**
     * `CheckAlways` means that after calling detectChanges the mode of the change detector
     * will remain `CheckAlways`.
     */
    ChangeDetectionStrategy[ChangeDetectionStrategy["CheckAlways"] = 2] = "CheckAlways";
    /**
     * `Detached` means that the change detector sub tree is not a part of the main tree and
     * should be skipped.
     */
    ChangeDetectionStrategy[ChangeDetectionStrategy["Detached"] = 3] = "Detached";
    /**
     * `OnPush` means that the change detector's mode will be set to `CheckOnce` during hydration.
     */
    ChangeDetectionStrategy[ChangeDetectionStrategy["OnPush"] = 4] = "OnPush";
    /**
     * `Default` means that the change detector's mode will be set to `CheckAlways` during hydration.
     */
    ChangeDetectionStrategy[ChangeDetectionStrategy["Default"] = 5] = "Default";
    /**
     * This is an experimental feature. Works only in Dart.
     */
    ChangeDetectionStrategy[ChangeDetectionStrategy["OnPushObserve"] = 6] = "OnPushObserve";
})(exports.ChangeDetectionStrategy || (exports.ChangeDetectionStrategy = {}));
var ChangeDetectionStrategy = exports.ChangeDetectionStrategy;
exports.CHANGE_DETECTION_STRATEGY_VALUES = [
    ChangeDetectionStrategy.CheckOnce,
    ChangeDetectionStrategy.Checked,
    ChangeDetectionStrategy.CheckAlways,
    ChangeDetectionStrategy.Detached,
    ChangeDetectionStrategy.OnPush,
    ChangeDetectionStrategy.Default,
    ChangeDetectionStrategy.OnPushObserve
];
exports.CHANGE_DETECTOR_STATE_VALUES = [
    ChangeDetectorState.NeverChecked,
    ChangeDetectorState.CheckedBefore,
    ChangeDetectorState.Errored
];
function isDefaultChangeDetectionStrategy(changeDetectionStrategy) {
    return lang_1.isBlank(changeDetectionStrategy) ||
        changeDetectionStrategy === ChangeDetectionStrategy.Default;
}
exports.isDefaultChangeDetectionStrategy = isDefaultChangeDetectionStrategy;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uc3RhbnRzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYW5ndWxhcjIvc3JjL2NvcmUvY2hhbmdlX2RldGVjdGlvbi9jb25zdGFudHMudHMiXSwibmFtZXMiOlsiQ2hhbmdlRGV0ZWN0b3JTdGF0ZSIsIkNoYW5nZURldGVjdGlvblN0cmF0ZWd5IiwiaXNEZWZhdWx0Q2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kiXSwibWFwcGluZ3MiOiJBQUFBLHFCQUFvRCwwQkFBMEIsQ0FBQyxDQUFBO0FBRS9FLFdBQVksbUJBQW1CO0lBQzdCQTs7O09BR0dBO0lBQ0hBLDZFQUFZQSxDQUFBQTtJQUVaQTs7O09BR0dBO0lBQ0hBLCtFQUFhQSxDQUFBQTtJQUViQTs7OztPQUlHQTtJQUNIQSxtRUFBT0EsQ0FBQUE7QUFDVEEsQ0FBQ0EsRUFuQlcsMkJBQW1CLEtBQW5CLDJCQUFtQixRQW1COUI7QUFuQkQsSUFBWSxtQkFBbUIsR0FBbkIsMkJBbUJYLENBQUE7QUFFRCxXQUFZLHVCQUF1QjtJQUNqQ0M7OztPQUdHQTtJQUNIQSwrRUFBU0EsQ0FBQUE7SUFFVEE7OztPQUdHQTtJQUNIQSwyRUFBT0EsQ0FBQUE7SUFFUEE7OztPQUdHQTtJQUNIQSxtRkFBV0EsQ0FBQUE7SUFFWEE7OztPQUdHQTtJQUNIQSw2RUFBUUEsQ0FBQUE7SUFFUkE7O09BRUdBO0lBQ0hBLHlFQUFNQSxDQUFBQTtJQUVOQTs7T0FFR0E7SUFDSEEsMkVBQU9BLENBQUFBO0lBRVBBOztPQUVHQTtJQUNIQSx1RkFBYUEsQ0FBQUE7QUFDZkEsQ0FBQ0EsRUF2Q1csK0JBQXVCLEtBQXZCLCtCQUF1QixRQXVDbEM7QUF2Q0QsSUFBWSx1QkFBdUIsR0FBdkIsK0JBdUNYLENBQUE7QUFFVSx3Q0FBZ0MsR0FBRztJQUM1Qyx1QkFBdUIsQ0FBQyxTQUFTO0lBQ2pDLHVCQUF1QixDQUFDLE9BQU87SUFDL0IsdUJBQXVCLENBQUMsV0FBVztJQUNuQyx1QkFBdUIsQ0FBQyxRQUFRO0lBQ2hDLHVCQUF1QixDQUFDLE1BQU07SUFDOUIsdUJBQXVCLENBQUMsT0FBTztJQUMvQix1QkFBdUIsQ0FBQyxhQUFhO0NBQ3RDLENBQUM7QUFFUyxvQ0FBNEIsR0FBRztJQUN4QyxtQkFBbUIsQ0FBQyxZQUFZO0lBQ2hDLG1CQUFtQixDQUFDLGFBQWE7SUFDakMsbUJBQW1CLENBQUMsT0FBTztDQUM1QixDQUFDO0FBRUYsMENBQ0ksdUJBQWdEO0lBQ2xEQyxNQUFNQSxDQUFDQSxjQUFPQSxDQUFDQSx1QkFBdUJBLENBQUNBO1FBQ2hDQSx1QkFBdUJBLEtBQUtBLHVCQUF1QkEsQ0FBQ0EsT0FBT0EsQ0FBQ0E7QUFDckVBLENBQUNBO0FBSmUsd0NBQWdDLG1DQUkvQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtTdHJpbmdXcmFwcGVyLCBub3JtYWxpemVCb29sLCBpc0JsYW5rfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuXG5leHBvcnQgZW51bSBDaGFuZ2VEZXRlY3RvclN0YXRlIHtcbiAgLyoqXG4gICAqIGBOZXZlckNoZWNrZWRgIG1lYW5zIHRoYXQgdGhlIGNoYW5nZSBkZXRlY3RvciBoYXMgbm90IGJlZW4gY2hlY2tlZCB5ZXQsIGFuZFxuICAgKiBpbml0aWFsaXphdGlvbiBtZXRob2RzIHNob3VsZCBiZSBjYWxsZWQgZHVyaW5nIGRldGVjdGlvbi5cbiAgICovXG4gIE5ldmVyQ2hlY2tlZCxcblxuICAvKipcbiAgICogYENoZWNrZWRCZWZvcmVgIG1lYW5zIHRoYXQgdGhlIGNoYW5nZSBkZXRlY3RvciBoYXMgc3VjY2Vzc2Z1bGx5IGNvbXBsZXRlZCBhdCBsZWFzdFxuICAgKiBvbmUgZGV0ZWN0aW9uIHByZXZpb3VzbHkuXG4gICAqL1xuICBDaGVja2VkQmVmb3JlLFxuXG4gIC8qKlxuICAgKiBgRXJyb3JlZGAgbWVhbnMgdGhhdCB0aGUgY2hhbmdlIGRldGVjdG9yIGVuY291bnRlcmVkIGFuIGVycm9yIGNoZWNraW5nIGEgYmluZGluZ1xuICAgKiBvciBjYWxsaW5nIGEgZGlyZWN0aXZlIGxpZmVjeWNsZSBtZXRob2QgYW5kIGlzIG5vdyBpbiBhbiBpbmNvbnNpc3RlbnQgc3RhdGUuIENoYW5nZVxuICAgKiBkZXRlY3RvcnMgaW4gdGhpcyBzdGF0ZSB3aWxsIG5vIGxvbmdlciBkZXRlY3QgY2hhbmdlcy5cbiAgICovXG4gIEVycm9yZWRcbn1cblxuZXhwb3J0IGVudW0gQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kge1xuICAvKipcbiAgICogYENoZWNrZWRPbmNlYCBtZWFucyB0aGF0IGFmdGVyIGNhbGxpbmcgZGV0ZWN0Q2hhbmdlcyB0aGUgbW9kZSBvZiB0aGUgY2hhbmdlIGRldGVjdG9yXG4gICAqIHdpbGwgYmVjb21lIGBDaGVja2VkYC5cbiAgICovXG4gIENoZWNrT25jZSxcblxuICAvKipcbiAgICogYENoZWNrZWRgIG1lYW5zIHRoYXQgdGhlIGNoYW5nZSBkZXRlY3RvciBzaG91bGQgYmUgc2tpcHBlZCB1bnRpbCBpdHMgbW9kZSBjaGFuZ2VzIHRvXG4gICAqIGBDaGVja09uY2VgLlxuICAgKi9cbiAgQ2hlY2tlZCxcblxuICAvKipcbiAgICogYENoZWNrQWx3YXlzYCBtZWFucyB0aGF0IGFmdGVyIGNhbGxpbmcgZGV0ZWN0Q2hhbmdlcyB0aGUgbW9kZSBvZiB0aGUgY2hhbmdlIGRldGVjdG9yXG4gICAqIHdpbGwgcmVtYWluIGBDaGVja0Fsd2F5c2AuXG4gICAqL1xuICBDaGVja0Fsd2F5cyxcblxuICAvKipcbiAgICogYERldGFjaGVkYCBtZWFucyB0aGF0IHRoZSBjaGFuZ2UgZGV0ZWN0b3Igc3ViIHRyZWUgaXMgbm90IGEgcGFydCBvZiB0aGUgbWFpbiB0cmVlIGFuZFxuICAgKiBzaG91bGQgYmUgc2tpcHBlZC5cbiAgICovXG4gIERldGFjaGVkLFxuXG4gIC8qKlxuICAgKiBgT25QdXNoYCBtZWFucyB0aGF0IHRoZSBjaGFuZ2UgZGV0ZWN0b3IncyBtb2RlIHdpbGwgYmUgc2V0IHRvIGBDaGVja09uY2VgIGR1cmluZyBoeWRyYXRpb24uXG4gICAqL1xuICBPblB1c2gsXG5cbiAgLyoqXG4gICAqIGBEZWZhdWx0YCBtZWFucyB0aGF0IHRoZSBjaGFuZ2UgZGV0ZWN0b3IncyBtb2RlIHdpbGwgYmUgc2V0IHRvIGBDaGVja0Fsd2F5c2AgZHVyaW5nIGh5ZHJhdGlvbi5cbiAgICovXG4gIERlZmF1bHQsXG5cbiAgLyoqXG4gICAqIFRoaXMgaXMgYW4gZXhwZXJpbWVudGFsIGZlYXR1cmUuIFdvcmtzIG9ubHkgaW4gRGFydC5cbiAgICovXG4gIE9uUHVzaE9ic2VydmVcbn1cblxuZXhwb3J0IHZhciBDSEFOR0VfREVURUNUSU9OX1NUUkFURUdZX1ZBTFVFUyA9IFtcbiAgQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kuQ2hlY2tPbmNlLFxuICBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5DaGVja2VkLFxuICBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5DaGVja0Fsd2F5cyxcbiAgQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kuRGV0YWNoZWQsXG4gIENoYW5nZURldGVjdGlvblN0cmF0ZWd5Lk9uUHVzaCxcbiAgQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kuRGVmYXVsdCxcbiAgQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kuT25QdXNoT2JzZXJ2ZVxuXTtcblxuZXhwb3J0IHZhciBDSEFOR0VfREVURUNUT1JfU1RBVEVfVkFMVUVTID0gW1xuICBDaGFuZ2VEZXRlY3RvclN0YXRlLk5ldmVyQ2hlY2tlZCxcbiAgQ2hhbmdlRGV0ZWN0b3JTdGF0ZS5DaGVja2VkQmVmb3JlLFxuICBDaGFuZ2VEZXRlY3RvclN0YXRlLkVycm9yZWRcbl07XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0RlZmF1bHRDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneShcbiAgICBjaGFuZ2VEZXRlY3Rpb25TdHJhdGVneTogQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kpOiBib29sZWFuIHtcbiAgcmV0dXJuIGlzQmxhbmsoY2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kpIHx8XG4gICAgICAgICBjaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSA9PT0gQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kuRGVmYXVsdDtcbn1cbiJdfQ==