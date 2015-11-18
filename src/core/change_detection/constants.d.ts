export declare enum ChangeDetectorState {
    /**
     * `NeverChecked` means that the change detector has not been checked yet, and
     * initialization methods should be called during detection.
     */
    NeverChecked = 0,
    /**
     * `CheckedBefore` means that the change detector has successfully completed at least
     * one detection previously.
     */
    CheckedBefore = 1,
    /**
     * `Errored` means that the change detector encountered an error checking a binding
     * or calling a directive lifecycle method and is now in an inconsistent state. Change
     * detectors in this state will no longer detect changes.
     */
    Errored = 2,
}
export declare enum ChangeDetectionStrategy {
    /**
     * `CheckedOnce` means that after calling detectChanges the mode of the change detector
     * will become `Checked`.
     */
    CheckOnce = 0,
    /**
     * `Checked` means that the change detector should be skipped until its mode changes to
     * `CheckOnce`.
     */
    Checked = 1,
    /**
     * `CheckAlways` means that after calling detectChanges the mode of the change detector
     * will remain `CheckAlways`.
     */
    CheckAlways = 2,
    /**
     * `Detached` means that the change detector sub tree is not a part of the main tree and
     * should be skipped.
     */
    Detached = 3,
    /**
     * `OnPush` means that the change detector's mode will be set to `CheckOnce` during hydration.
     */
    OnPush = 4,
    /**
     * `Default` means that the change detector's mode will be set to `CheckAlways` during hydration.
     */
    Default = 5,
    /**
     * This is an experimental feature. Works only in Dart.
     */
    OnPushObserve = 6,
}
export declare var CHANGE_DETECTION_STRATEGY_VALUES: ChangeDetectionStrategy[];
export declare var CHANGE_DETECTOR_STATE_VALUES: ChangeDetectorState[];
export declare function isDefaultChangeDetectionStrategy(changeDetectionStrategy: ChangeDetectionStrategy): boolean;
