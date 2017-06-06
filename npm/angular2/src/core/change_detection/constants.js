'use strict';"use strict";
var lang_1 = require('angular2/src/facade/lang');
/**
 * Describes the current state of the change detector.
 */
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
/**
 * Describes within the change detector which strategy will be used the next time change
 * detection is triggered.
 */
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
})(exports.ChangeDetectionStrategy || (exports.ChangeDetectionStrategy = {}));
var ChangeDetectionStrategy = exports.ChangeDetectionStrategy;
/**
 * List of possible {@link ChangeDetectionStrategy} values.
 */
exports.CHANGE_DETECTION_STRATEGY_VALUES = [
    ChangeDetectionStrategy.CheckOnce,
    ChangeDetectionStrategy.Checked,
    ChangeDetectionStrategy.CheckAlways,
    ChangeDetectionStrategy.Detached,
    ChangeDetectionStrategy.OnPush,
    ChangeDetectionStrategy.Default
];
/**
 * List of possible {@link ChangeDetectorState} values.
 */
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uc3RhbnRzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZGlmZmluZ19wbHVnaW5fd3JhcHBlci1vdXRwdXRfcGF0aC1yNVBySks5aC50bXAvYW5ndWxhcjIvc3JjL2NvcmUvY2hhbmdlX2RldGVjdGlvbi9jb25zdGFudHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLHFCQUFvRCwwQkFBMEIsQ0FBQyxDQUFBO0FBRS9FOztHQUVHO0FBQ0gsV0FBWSxtQkFBbUI7SUFDN0I7OztPQUdHO0lBQ0gsNkVBQVksQ0FBQTtJQUVaOzs7T0FHRztJQUNILCtFQUFhLENBQUE7SUFFYjs7OztPQUlHO0lBQ0gsbUVBQU8sQ0FBQTtBQUNULENBQUMsRUFuQlcsMkJBQW1CLEtBQW5CLDJCQUFtQixRQW1COUI7QUFuQkQsSUFBWSxtQkFBbUIsR0FBbkIsMkJBbUJYLENBQUE7QUFHRDs7O0dBR0c7QUFDSCxXQUFZLHVCQUF1QjtJQUNqQzs7O09BR0c7SUFDSCwrRUFBUyxDQUFBO0lBRVQ7OztPQUdHO0lBQ0gsMkVBQU8sQ0FBQTtJQUVQOzs7T0FHRztJQUNILG1GQUFXLENBQUE7SUFFWDs7O09BR0c7SUFDSCw2RUFBUSxDQUFBO0lBRVI7O09BRUc7SUFDSCx5RUFBTSxDQUFBO0lBRU47O09BRUc7SUFDSCwyRUFBTyxDQUFBO0FBQ1QsQ0FBQyxFQWxDVywrQkFBdUIsS0FBdkIsK0JBQXVCLFFBa0NsQztBQWxDRCxJQUFZLHVCQUF1QixHQUF2QiwrQkFrQ1gsQ0FBQTtBQUVEOztHQUVHO0FBQ1Esd0NBQWdDLEdBQUc7SUFDNUMsdUJBQXVCLENBQUMsU0FBUztJQUNqQyx1QkFBdUIsQ0FBQyxPQUFPO0lBQy9CLHVCQUF1QixDQUFDLFdBQVc7SUFDbkMsdUJBQXVCLENBQUMsUUFBUTtJQUNoQyx1QkFBdUIsQ0FBQyxNQUFNO0lBQzlCLHVCQUF1QixDQUFDLE9BQU87Q0FDaEMsQ0FBQztBQUVGOztHQUVHO0FBQ1Esb0NBQTRCLEdBQUc7SUFDeEMsbUJBQW1CLENBQUMsWUFBWTtJQUNoQyxtQkFBbUIsQ0FBQyxhQUFhO0lBQ2pDLG1CQUFtQixDQUFDLE9BQU87Q0FDNUIsQ0FBQztBQUVGLDBDQUNJLHVCQUFnRDtJQUNsRCxNQUFNLENBQUMsY0FBTyxDQUFDLHVCQUF1QixDQUFDO1FBQ2hDLHVCQUF1QixLQUFLLHVCQUF1QixDQUFDLE9BQU8sQ0FBQztBQUNyRSxDQUFDO0FBSmUsd0NBQWdDLG1DQUkvQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtTdHJpbmdXcmFwcGVyLCBub3JtYWxpemVCb29sLCBpc0JsYW5rfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuXG4vKipcbiAqIERlc2NyaWJlcyB0aGUgY3VycmVudCBzdGF0ZSBvZiB0aGUgY2hhbmdlIGRldGVjdG9yLlxuICovXG5leHBvcnQgZW51bSBDaGFuZ2VEZXRlY3RvclN0YXRlIHtcbiAgLyoqXG4gICAqIGBOZXZlckNoZWNrZWRgIG1lYW5zIHRoYXQgdGhlIGNoYW5nZSBkZXRlY3RvciBoYXMgbm90IGJlZW4gY2hlY2tlZCB5ZXQsIGFuZFxuICAgKiBpbml0aWFsaXphdGlvbiBtZXRob2RzIHNob3VsZCBiZSBjYWxsZWQgZHVyaW5nIGRldGVjdGlvbi5cbiAgICovXG4gIE5ldmVyQ2hlY2tlZCxcblxuICAvKipcbiAgICogYENoZWNrZWRCZWZvcmVgIG1lYW5zIHRoYXQgdGhlIGNoYW5nZSBkZXRlY3RvciBoYXMgc3VjY2Vzc2Z1bGx5IGNvbXBsZXRlZCBhdCBsZWFzdFxuICAgKiBvbmUgZGV0ZWN0aW9uIHByZXZpb3VzbHkuXG4gICAqL1xuICBDaGVja2VkQmVmb3JlLFxuXG4gIC8qKlxuICAgKiBgRXJyb3JlZGAgbWVhbnMgdGhhdCB0aGUgY2hhbmdlIGRldGVjdG9yIGVuY291bnRlcmVkIGFuIGVycm9yIGNoZWNraW5nIGEgYmluZGluZ1xuICAgKiBvciBjYWxsaW5nIGEgZGlyZWN0aXZlIGxpZmVjeWNsZSBtZXRob2QgYW5kIGlzIG5vdyBpbiBhbiBpbmNvbnNpc3RlbnQgc3RhdGUuIENoYW5nZVxuICAgKiBkZXRlY3RvcnMgaW4gdGhpcyBzdGF0ZSB3aWxsIG5vIGxvbmdlciBkZXRlY3QgY2hhbmdlcy5cbiAgICovXG4gIEVycm9yZWRcbn1cblxuXG4vKipcbiAqIERlc2NyaWJlcyB3aXRoaW4gdGhlIGNoYW5nZSBkZXRlY3RvciB3aGljaCBzdHJhdGVneSB3aWxsIGJlIHVzZWQgdGhlIG5leHQgdGltZSBjaGFuZ2VcbiAqIGRldGVjdGlvbiBpcyB0cmlnZ2VyZWQuXG4gKi9cbmV4cG9ydCBlbnVtIENoYW5nZURldGVjdGlvblN0cmF0ZWd5IHtcbiAgLyoqXG4gICAqIGBDaGVja2VkT25jZWAgbWVhbnMgdGhhdCBhZnRlciBjYWxsaW5nIGRldGVjdENoYW5nZXMgdGhlIG1vZGUgb2YgdGhlIGNoYW5nZSBkZXRlY3RvclxuICAgKiB3aWxsIGJlY29tZSBgQ2hlY2tlZGAuXG4gICAqL1xuICBDaGVja09uY2UsXG5cbiAgLyoqXG4gICAqIGBDaGVja2VkYCBtZWFucyB0aGF0IHRoZSBjaGFuZ2UgZGV0ZWN0b3Igc2hvdWxkIGJlIHNraXBwZWQgdW50aWwgaXRzIG1vZGUgY2hhbmdlcyB0b1xuICAgKiBgQ2hlY2tPbmNlYC5cbiAgICovXG4gIENoZWNrZWQsXG5cbiAgLyoqXG4gICAqIGBDaGVja0Fsd2F5c2AgbWVhbnMgdGhhdCBhZnRlciBjYWxsaW5nIGRldGVjdENoYW5nZXMgdGhlIG1vZGUgb2YgdGhlIGNoYW5nZSBkZXRlY3RvclxuICAgKiB3aWxsIHJlbWFpbiBgQ2hlY2tBbHdheXNgLlxuICAgKi9cbiAgQ2hlY2tBbHdheXMsXG5cbiAgLyoqXG4gICAqIGBEZXRhY2hlZGAgbWVhbnMgdGhhdCB0aGUgY2hhbmdlIGRldGVjdG9yIHN1YiB0cmVlIGlzIG5vdCBhIHBhcnQgb2YgdGhlIG1haW4gdHJlZSBhbmRcbiAgICogc2hvdWxkIGJlIHNraXBwZWQuXG4gICAqL1xuICBEZXRhY2hlZCxcblxuICAvKipcbiAgICogYE9uUHVzaGAgbWVhbnMgdGhhdCB0aGUgY2hhbmdlIGRldGVjdG9yJ3MgbW9kZSB3aWxsIGJlIHNldCB0byBgQ2hlY2tPbmNlYCBkdXJpbmcgaHlkcmF0aW9uLlxuICAgKi9cbiAgT25QdXNoLFxuXG4gIC8qKlxuICAgKiBgRGVmYXVsdGAgbWVhbnMgdGhhdCB0aGUgY2hhbmdlIGRldGVjdG9yJ3MgbW9kZSB3aWxsIGJlIHNldCB0byBgQ2hlY2tBbHdheXNgIGR1cmluZyBoeWRyYXRpb24uXG4gICAqL1xuICBEZWZhdWx0LFxufVxuXG4vKipcbiAqIExpc3Qgb2YgcG9zc2libGUge0BsaW5rIENoYW5nZURldGVjdGlvblN0cmF0ZWd5fSB2YWx1ZXMuXG4gKi9cbmV4cG9ydCB2YXIgQ0hBTkdFX0RFVEVDVElPTl9TVFJBVEVHWV9WQUxVRVMgPSBbXG4gIENoYW5nZURldGVjdGlvblN0cmF0ZWd5LkNoZWNrT25jZSxcbiAgQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kuQ2hlY2tlZCxcbiAgQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kuQ2hlY2tBbHdheXMsXG4gIENoYW5nZURldGVjdGlvblN0cmF0ZWd5LkRldGFjaGVkLFxuICBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5PblB1c2gsXG4gIENoYW5nZURldGVjdGlvblN0cmF0ZWd5LkRlZmF1bHRcbl07XG5cbi8qKlxuICogTGlzdCBvZiBwb3NzaWJsZSB7QGxpbmsgQ2hhbmdlRGV0ZWN0b3JTdGF0ZX0gdmFsdWVzLlxuICovXG5leHBvcnQgdmFyIENIQU5HRV9ERVRFQ1RPUl9TVEFURV9WQUxVRVMgPSBbXG4gIENoYW5nZURldGVjdG9yU3RhdGUuTmV2ZXJDaGVja2VkLFxuICBDaGFuZ2VEZXRlY3RvclN0YXRlLkNoZWNrZWRCZWZvcmUsXG4gIENoYW5nZURldGVjdG9yU3RhdGUuRXJyb3JlZFxuXTtcblxuZXhwb3J0IGZ1bmN0aW9uIGlzRGVmYXVsdENoYW5nZURldGVjdGlvblN0cmF0ZWd5KFxuICAgIGNoYW5nZURldGVjdGlvblN0cmF0ZWd5OiBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSk6IGJvb2xlYW4ge1xuICByZXR1cm4gaXNCbGFuayhjaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSkgfHxcbiAgICAgICAgIGNoYW5nZURldGVjdGlvblN0cmF0ZWd5ID09PSBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5EZWZhdWx0O1xufVxuIl19