import { isBlank } from 'angular2/src/facade/lang';
export var ChangeDetectorState;
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
})(ChangeDetectorState || (ChangeDetectorState = {}));
export var ChangeDetectionStrategy;
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
})(ChangeDetectionStrategy || (ChangeDetectionStrategy = {}));
export var CHANGE_DETECTION_STRATEGY_VALUES = [
    ChangeDetectionStrategy.CheckOnce,
    ChangeDetectionStrategy.Checked,
    ChangeDetectionStrategy.CheckAlways,
    ChangeDetectionStrategy.Detached,
    ChangeDetectionStrategy.OnPush,
    ChangeDetectionStrategy.Default,
    ChangeDetectionStrategy.OnPushObserve
];
export var CHANGE_DETECTOR_STATE_VALUES = [
    ChangeDetectorState.NeverChecked,
    ChangeDetectorState.CheckedBefore,
    ChangeDetectorState.Errored
];
export function isDefaultChangeDetectionStrategy(changeDetectionStrategy) {
    return isBlank(changeDetectionStrategy) ||
        changeDetectionStrategy === ChangeDetectionStrategy.Default;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uc3RhbnRzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYW5ndWxhcjIvc3JjL2NvcmUvY2hhbmdlX2RldGVjdGlvbi9jb25zdGFudHMudHMiXSwibmFtZXMiOlsiQ2hhbmdlRGV0ZWN0b3JTdGF0ZSIsIkNoYW5nZURldGVjdGlvblN0cmF0ZWd5IiwiaXNEZWZhdWx0Q2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kiXSwibWFwcGluZ3MiOiJPQUFPLEVBQStCLE9BQU8sRUFBQyxNQUFNLDBCQUEwQjtBQUU5RSxXQUFZLG1CQW1CWDtBQW5CRCxXQUFZLG1CQUFtQjtJQUM3QkE7OztPQUdHQTtJQUNIQSw2RUFBWUEsQ0FBQUE7SUFFWkE7OztPQUdHQTtJQUNIQSwrRUFBYUEsQ0FBQUE7SUFFYkE7Ozs7T0FJR0E7SUFDSEEsbUVBQU9BLENBQUFBO0FBQ1RBLENBQUNBLEVBbkJXLG1CQUFtQixLQUFuQixtQkFBbUIsUUFtQjlCO0FBRUQsV0FBWSx1QkF1Q1g7QUF2Q0QsV0FBWSx1QkFBdUI7SUFDakNDOzs7T0FHR0E7SUFDSEEsK0VBQVNBLENBQUFBO0lBRVRBOzs7T0FHR0E7SUFDSEEsMkVBQU9BLENBQUFBO0lBRVBBOzs7T0FHR0E7SUFDSEEsbUZBQVdBLENBQUFBO0lBRVhBOzs7T0FHR0E7SUFDSEEsNkVBQVFBLENBQUFBO0lBRVJBOztPQUVHQTtJQUNIQSx5RUFBTUEsQ0FBQUE7SUFFTkE7O09BRUdBO0lBQ0hBLDJFQUFPQSxDQUFBQTtJQUVQQTs7T0FFR0E7SUFDSEEsdUZBQWFBLENBQUFBO0FBQ2ZBLENBQUNBLEVBdkNXLHVCQUF1QixLQUF2Qix1QkFBdUIsUUF1Q2xDO0FBRUQsV0FBVyxnQ0FBZ0MsR0FBRztJQUM1Qyx1QkFBdUIsQ0FBQyxTQUFTO0lBQ2pDLHVCQUF1QixDQUFDLE9BQU87SUFDL0IsdUJBQXVCLENBQUMsV0FBVztJQUNuQyx1QkFBdUIsQ0FBQyxRQUFRO0lBQ2hDLHVCQUF1QixDQUFDLE1BQU07SUFDOUIsdUJBQXVCLENBQUMsT0FBTztJQUMvQix1QkFBdUIsQ0FBQyxhQUFhO0NBQ3RDLENBQUM7QUFFRixXQUFXLDRCQUE0QixHQUFHO0lBQ3hDLG1CQUFtQixDQUFDLFlBQVk7SUFDaEMsbUJBQW1CLENBQUMsYUFBYTtJQUNqQyxtQkFBbUIsQ0FBQyxPQUFPO0NBQzVCLENBQUM7QUFFRixpREFDSSx1QkFBZ0Q7SUFDbERDLE1BQU1BLENBQUNBLE9BQU9BLENBQUNBLHVCQUF1QkEsQ0FBQ0E7UUFDaENBLHVCQUF1QkEsS0FBS0EsdUJBQXVCQSxDQUFDQSxPQUFPQSxDQUFDQTtBQUNyRUEsQ0FBQ0EiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1N0cmluZ1dyYXBwZXIsIG5vcm1hbGl6ZUJvb2wsIGlzQmxhbmt9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5cbmV4cG9ydCBlbnVtIENoYW5nZURldGVjdG9yU3RhdGUge1xuICAvKipcbiAgICogYE5ldmVyQ2hlY2tlZGAgbWVhbnMgdGhhdCB0aGUgY2hhbmdlIGRldGVjdG9yIGhhcyBub3QgYmVlbiBjaGVja2VkIHlldCwgYW5kXG4gICAqIGluaXRpYWxpemF0aW9uIG1ldGhvZHMgc2hvdWxkIGJlIGNhbGxlZCBkdXJpbmcgZGV0ZWN0aW9uLlxuICAgKi9cbiAgTmV2ZXJDaGVja2VkLFxuXG4gIC8qKlxuICAgKiBgQ2hlY2tlZEJlZm9yZWAgbWVhbnMgdGhhdCB0aGUgY2hhbmdlIGRldGVjdG9yIGhhcyBzdWNjZXNzZnVsbHkgY29tcGxldGVkIGF0IGxlYXN0XG4gICAqIG9uZSBkZXRlY3Rpb24gcHJldmlvdXNseS5cbiAgICovXG4gIENoZWNrZWRCZWZvcmUsXG5cbiAgLyoqXG4gICAqIGBFcnJvcmVkYCBtZWFucyB0aGF0IHRoZSBjaGFuZ2UgZGV0ZWN0b3IgZW5jb3VudGVyZWQgYW4gZXJyb3IgY2hlY2tpbmcgYSBiaW5kaW5nXG4gICAqIG9yIGNhbGxpbmcgYSBkaXJlY3RpdmUgbGlmZWN5Y2xlIG1ldGhvZCBhbmQgaXMgbm93IGluIGFuIGluY29uc2lzdGVudCBzdGF0ZS4gQ2hhbmdlXG4gICAqIGRldGVjdG9ycyBpbiB0aGlzIHN0YXRlIHdpbGwgbm8gbG9uZ2VyIGRldGVjdCBjaGFuZ2VzLlxuICAgKi9cbiAgRXJyb3JlZFxufVxuXG5leHBvcnQgZW51bSBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSB7XG4gIC8qKlxuICAgKiBgQ2hlY2tlZE9uY2VgIG1lYW5zIHRoYXQgYWZ0ZXIgY2FsbGluZyBkZXRlY3RDaGFuZ2VzIHRoZSBtb2RlIG9mIHRoZSBjaGFuZ2UgZGV0ZWN0b3JcbiAgICogd2lsbCBiZWNvbWUgYENoZWNrZWRgLlxuICAgKi9cbiAgQ2hlY2tPbmNlLFxuXG4gIC8qKlxuICAgKiBgQ2hlY2tlZGAgbWVhbnMgdGhhdCB0aGUgY2hhbmdlIGRldGVjdG9yIHNob3VsZCBiZSBza2lwcGVkIHVudGlsIGl0cyBtb2RlIGNoYW5nZXMgdG9cbiAgICogYENoZWNrT25jZWAuXG4gICAqL1xuICBDaGVja2VkLFxuXG4gIC8qKlxuICAgKiBgQ2hlY2tBbHdheXNgIG1lYW5zIHRoYXQgYWZ0ZXIgY2FsbGluZyBkZXRlY3RDaGFuZ2VzIHRoZSBtb2RlIG9mIHRoZSBjaGFuZ2UgZGV0ZWN0b3JcbiAgICogd2lsbCByZW1haW4gYENoZWNrQWx3YXlzYC5cbiAgICovXG4gIENoZWNrQWx3YXlzLFxuXG4gIC8qKlxuICAgKiBgRGV0YWNoZWRgIG1lYW5zIHRoYXQgdGhlIGNoYW5nZSBkZXRlY3RvciBzdWIgdHJlZSBpcyBub3QgYSBwYXJ0IG9mIHRoZSBtYWluIHRyZWUgYW5kXG4gICAqIHNob3VsZCBiZSBza2lwcGVkLlxuICAgKi9cbiAgRGV0YWNoZWQsXG5cbiAgLyoqXG4gICAqIGBPblB1c2hgIG1lYW5zIHRoYXQgdGhlIGNoYW5nZSBkZXRlY3RvcidzIG1vZGUgd2lsbCBiZSBzZXQgdG8gYENoZWNrT25jZWAgZHVyaW5nIGh5ZHJhdGlvbi5cbiAgICovXG4gIE9uUHVzaCxcblxuICAvKipcbiAgICogYERlZmF1bHRgIG1lYW5zIHRoYXQgdGhlIGNoYW5nZSBkZXRlY3RvcidzIG1vZGUgd2lsbCBiZSBzZXQgdG8gYENoZWNrQWx3YXlzYCBkdXJpbmcgaHlkcmF0aW9uLlxuICAgKi9cbiAgRGVmYXVsdCxcblxuICAvKipcbiAgICogVGhpcyBpcyBhbiBleHBlcmltZW50YWwgZmVhdHVyZS4gV29ya3Mgb25seSBpbiBEYXJ0LlxuICAgKi9cbiAgT25QdXNoT2JzZXJ2ZVxufVxuXG5leHBvcnQgdmFyIENIQU5HRV9ERVRFQ1RJT05fU1RSQVRFR1lfVkFMVUVTID0gW1xuICBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5DaGVja09uY2UsXG4gIENoYW5nZURldGVjdGlvblN0cmF0ZWd5LkNoZWNrZWQsXG4gIENoYW5nZURldGVjdGlvblN0cmF0ZWd5LkNoZWNrQWx3YXlzLFxuICBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5EZXRhY2hlZCxcbiAgQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kuT25QdXNoLFxuICBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5EZWZhdWx0LFxuICBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5PblB1c2hPYnNlcnZlXG5dO1xuXG5leHBvcnQgdmFyIENIQU5HRV9ERVRFQ1RPUl9TVEFURV9WQUxVRVMgPSBbXG4gIENoYW5nZURldGVjdG9yU3RhdGUuTmV2ZXJDaGVja2VkLFxuICBDaGFuZ2VEZXRlY3RvclN0YXRlLkNoZWNrZWRCZWZvcmUsXG4gIENoYW5nZURldGVjdG9yU3RhdGUuRXJyb3JlZFxuXTtcblxuZXhwb3J0IGZ1bmN0aW9uIGlzRGVmYXVsdENoYW5nZURldGVjdGlvblN0cmF0ZWd5KFxuICAgIGNoYW5nZURldGVjdGlvblN0cmF0ZWd5OiBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSk6IGJvb2xlYW4ge1xuICByZXR1cm4gaXNCbGFuayhjaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSkgfHxcbiAgICAgICAgIGNoYW5nZURldGVjdGlvblN0cmF0ZWd5ID09PSBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5EZWZhdWx0O1xufVxuIl19