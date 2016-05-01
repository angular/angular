import { isBlank } from 'angular2/src/facade/lang';
/**
 * Describes the current state of the change detector.
 */
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
/**
 * Describes within the change detector which strategy will be used the next time change
 * detection is triggered.
 */
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
})(ChangeDetectionStrategy || (ChangeDetectionStrategy = {}));
/**
 * List of possible {@link ChangeDetectionStrategy} values.
 */
export var CHANGE_DETECTION_STRATEGY_VALUES = [
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
export var CHANGE_DETECTOR_STATE_VALUES = [
    ChangeDetectorState.NeverChecked,
    ChangeDetectorState.CheckedBefore,
    ChangeDetectorState.Errored
];
export function isDefaultChangeDetectionStrategy(changeDetectionStrategy) {
    return isBlank(changeDetectionStrategy) ||
        changeDetectionStrategy === ChangeDetectionStrategy.Default;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uc3RhbnRzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZGlmZmluZ19wbHVnaW5fd3JhcHBlci1vdXRwdXRfcGF0aC1ndE03UWhFbi50bXAvYW5ndWxhcjIvc3JjL2NvcmUvY2hhbmdlX2RldGVjdGlvbi9jb25zdGFudHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ik9BQU8sRUFBK0IsT0FBTyxFQUFDLE1BQU0sMEJBQTBCO0FBRTlFOztHQUVHO0FBQ0gsV0FBWSxtQkFtQlg7QUFuQkQsV0FBWSxtQkFBbUI7SUFDN0I7OztPQUdHO0lBQ0gsNkVBQVksQ0FBQTtJQUVaOzs7T0FHRztJQUNILCtFQUFhLENBQUE7SUFFYjs7OztPQUlHO0lBQ0gsbUVBQU8sQ0FBQTtBQUNULENBQUMsRUFuQlcsbUJBQW1CLEtBQW5CLG1CQUFtQixRQW1COUI7QUFHRDs7O0dBR0c7QUFDSCxXQUFZLHVCQWtDWDtBQWxDRCxXQUFZLHVCQUF1QjtJQUNqQzs7O09BR0c7SUFDSCwrRUFBUyxDQUFBO0lBRVQ7OztPQUdHO0lBQ0gsMkVBQU8sQ0FBQTtJQUVQOzs7T0FHRztJQUNILG1GQUFXLENBQUE7SUFFWDs7O09BR0c7SUFDSCw2RUFBUSxDQUFBO0lBRVI7O09BRUc7SUFDSCx5RUFBTSxDQUFBO0lBRU47O09BRUc7SUFDSCwyRUFBTyxDQUFBO0FBQ1QsQ0FBQyxFQWxDVyx1QkFBdUIsS0FBdkIsdUJBQXVCLFFBa0NsQztBQUVEOztHQUVHO0FBQ0gsT0FBTyxJQUFJLGdDQUFnQyxHQUFHO0lBQzVDLHVCQUF1QixDQUFDLFNBQVM7SUFDakMsdUJBQXVCLENBQUMsT0FBTztJQUMvQix1QkFBdUIsQ0FBQyxXQUFXO0lBQ25DLHVCQUF1QixDQUFDLFFBQVE7SUFDaEMsdUJBQXVCLENBQUMsTUFBTTtJQUM5Qix1QkFBdUIsQ0FBQyxPQUFPO0NBQ2hDLENBQUM7QUFFRjs7R0FFRztBQUNILE9BQU8sSUFBSSw0QkFBNEIsR0FBRztJQUN4QyxtQkFBbUIsQ0FBQyxZQUFZO0lBQ2hDLG1CQUFtQixDQUFDLGFBQWE7SUFDakMsbUJBQW1CLENBQUMsT0FBTztDQUM1QixDQUFDO0FBRUYsaURBQ0ksdUJBQWdEO0lBQ2xELE1BQU0sQ0FBQyxPQUFPLENBQUMsdUJBQXVCLENBQUM7UUFDaEMsdUJBQXVCLEtBQUssdUJBQXVCLENBQUMsT0FBTyxDQUFDO0FBQ3JFLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1N0cmluZ1dyYXBwZXIsIG5vcm1hbGl6ZUJvb2wsIGlzQmxhbmt9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5cbi8qKlxuICogRGVzY3JpYmVzIHRoZSBjdXJyZW50IHN0YXRlIG9mIHRoZSBjaGFuZ2UgZGV0ZWN0b3IuXG4gKi9cbmV4cG9ydCBlbnVtIENoYW5nZURldGVjdG9yU3RhdGUge1xuICAvKipcbiAgICogYE5ldmVyQ2hlY2tlZGAgbWVhbnMgdGhhdCB0aGUgY2hhbmdlIGRldGVjdG9yIGhhcyBub3QgYmVlbiBjaGVja2VkIHlldCwgYW5kXG4gICAqIGluaXRpYWxpemF0aW9uIG1ldGhvZHMgc2hvdWxkIGJlIGNhbGxlZCBkdXJpbmcgZGV0ZWN0aW9uLlxuICAgKi9cbiAgTmV2ZXJDaGVja2VkLFxuXG4gIC8qKlxuICAgKiBgQ2hlY2tlZEJlZm9yZWAgbWVhbnMgdGhhdCB0aGUgY2hhbmdlIGRldGVjdG9yIGhhcyBzdWNjZXNzZnVsbHkgY29tcGxldGVkIGF0IGxlYXN0XG4gICAqIG9uZSBkZXRlY3Rpb24gcHJldmlvdXNseS5cbiAgICovXG4gIENoZWNrZWRCZWZvcmUsXG5cbiAgLyoqXG4gICAqIGBFcnJvcmVkYCBtZWFucyB0aGF0IHRoZSBjaGFuZ2UgZGV0ZWN0b3IgZW5jb3VudGVyZWQgYW4gZXJyb3IgY2hlY2tpbmcgYSBiaW5kaW5nXG4gICAqIG9yIGNhbGxpbmcgYSBkaXJlY3RpdmUgbGlmZWN5Y2xlIG1ldGhvZCBhbmQgaXMgbm93IGluIGFuIGluY29uc2lzdGVudCBzdGF0ZS4gQ2hhbmdlXG4gICAqIGRldGVjdG9ycyBpbiB0aGlzIHN0YXRlIHdpbGwgbm8gbG9uZ2VyIGRldGVjdCBjaGFuZ2VzLlxuICAgKi9cbiAgRXJyb3JlZFxufVxuXG5cbi8qKlxuICogRGVzY3JpYmVzIHdpdGhpbiB0aGUgY2hhbmdlIGRldGVjdG9yIHdoaWNoIHN0cmF0ZWd5IHdpbGwgYmUgdXNlZCB0aGUgbmV4dCB0aW1lIGNoYW5nZVxuICogZGV0ZWN0aW9uIGlzIHRyaWdnZXJlZC5cbiAqL1xuZXhwb3J0IGVudW0gQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kge1xuICAvKipcbiAgICogYENoZWNrZWRPbmNlYCBtZWFucyB0aGF0IGFmdGVyIGNhbGxpbmcgZGV0ZWN0Q2hhbmdlcyB0aGUgbW9kZSBvZiB0aGUgY2hhbmdlIGRldGVjdG9yXG4gICAqIHdpbGwgYmVjb21lIGBDaGVja2VkYC5cbiAgICovXG4gIENoZWNrT25jZSxcblxuICAvKipcbiAgICogYENoZWNrZWRgIG1lYW5zIHRoYXQgdGhlIGNoYW5nZSBkZXRlY3RvciBzaG91bGQgYmUgc2tpcHBlZCB1bnRpbCBpdHMgbW9kZSBjaGFuZ2VzIHRvXG4gICAqIGBDaGVja09uY2VgLlxuICAgKi9cbiAgQ2hlY2tlZCxcblxuICAvKipcbiAgICogYENoZWNrQWx3YXlzYCBtZWFucyB0aGF0IGFmdGVyIGNhbGxpbmcgZGV0ZWN0Q2hhbmdlcyB0aGUgbW9kZSBvZiB0aGUgY2hhbmdlIGRldGVjdG9yXG4gICAqIHdpbGwgcmVtYWluIGBDaGVja0Fsd2F5c2AuXG4gICAqL1xuICBDaGVja0Fsd2F5cyxcblxuICAvKipcbiAgICogYERldGFjaGVkYCBtZWFucyB0aGF0IHRoZSBjaGFuZ2UgZGV0ZWN0b3Igc3ViIHRyZWUgaXMgbm90IGEgcGFydCBvZiB0aGUgbWFpbiB0cmVlIGFuZFxuICAgKiBzaG91bGQgYmUgc2tpcHBlZC5cbiAgICovXG4gIERldGFjaGVkLFxuXG4gIC8qKlxuICAgKiBgT25QdXNoYCBtZWFucyB0aGF0IHRoZSBjaGFuZ2UgZGV0ZWN0b3IncyBtb2RlIHdpbGwgYmUgc2V0IHRvIGBDaGVja09uY2VgIGR1cmluZyBoeWRyYXRpb24uXG4gICAqL1xuICBPblB1c2gsXG5cbiAgLyoqXG4gICAqIGBEZWZhdWx0YCBtZWFucyB0aGF0IHRoZSBjaGFuZ2UgZGV0ZWN0b3IncyBtb2RlIHdpbGwgYmUgc2V0IHRvIGBDaGVja0Fsd2F5c2AgZHVyaW5nIGh5ZHJhdGlvbi5cbiAgICovXG4gIERlZmF1bHQsXG59XG5cbi8qKlxuICogTGlzdCBvZiBwb3NzaWJsZSB7QGxpbmsgQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3l9IHZhbHVlcy5cbiAqL1xuZXhwb3J0IHZhciBDSEFOR0VfREVURUNUSU9OX1NUUkFURUdZX1ZBTFVFUyA9IFtcbiAgQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kuQ2hlY2tPbmNlLFxuICBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5DaGVja2VkLFxuICBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5DaGVja0Fsd2F5cyxcbiAgQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kuRGV0YWNoZWQsXG4gIENoYW5nZURldGVjdGlvblN0cmF0ZWd5Lk9uUHVzaCxcbiAgQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kuRGVmYXVsdFxuXTtcblxuLyoqXG4gKiBMaXN0IG9mIHBvc3NpYmxlIHtAbGluayBDaGFuZ2VEZXRlY3RvclN0YXRlfSB2YWx1ZXMuXG4gKi9cbmV4cG9ydCB2YXIgQ0hBTkdFX0RFVEVDVE9SX1NUQVRFX1ZBTFVFUyA9IFtcbiAgQ2hhbmdlRGV0ZWN0b3JTdGF0ZS5OZXZlckNoZWNrZWQsXG4gIENoYW5nZURldGVjdG9yU3RhdGUuQ2hlY2tlZEJlZm9yZSxcbiAgQ2hhbmdlRGV0ZWN0b3JTdGF0ZS5FcnJvcmVkXG5dO1xuXG5leHBvcnQgZnVuY3Rpb24gaXNEZWZhdWx0Q2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3koXG4gICAgY2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3k6IENoYW5nZURldGVjdGlvblN0cmF0ZWd5KTogYm9vbGVhbiB7XG4gIHJldHVybiBpc0JsYW5rKGNoYW5nZURldGVjdGlvblN0cmF0ZWd5KSB8fFxuICAgICAgICAgY2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kgPT09IENoYW5nZURldGVjdGlvblN0cmF0ZWd5LkRlZmF1bHQ7XG59XG4iXX0=