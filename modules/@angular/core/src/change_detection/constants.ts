/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */


/**
 * Describes within the change detector which strategy will be used the next time change
 * detection is triggered.
 * @stable
 */
export enum ChangeDetectionStrategy {
  /**
   * `OnPush` means that the change detector's mode will be set to `CheckOnce` during hydration.
   */
  OnPush,

  /**
   * `Default` means that the change detector's mode will be set to `CheckAlways` during hydration.
   */
  Default,
}

/**
 * Describes the status of the detector.
 */
export enum ChangeDetectorStatus {
  /**
   * `CheckOnce` means that after calling detectChanges the mode of the change detector
   * will become `Checked`.
   */
  CheckOnce,

  /**
   * `Checked` means that the change detector should be skipped until its mode changes to
   * `CheckOnce`.
   */
  Checked,

  /**
   * `CheckAlways` means that after calling detectChanges the mode of the change detector
   * will remain `CheckAlways`.
   */
  CheckAlways,

  /**
   * `Detached` means that the change detector sub tree is not a part of the main tree and
   * should be skipped.
   */
  Detached,

  /**
   * `Errored` means that the change detector encountered an error checking a binding
   * or calling a directive lifecycle method and is now in an inconsistent state. Change
   * detectors in this state will no longer detect changes.
   */
  Errored,

  /**
   * `Destroyed` means that the change detector is destroyed.
   */
  Destroyed,
}

export function isDefaultChangeDetectionStrategy(changeDetectionStrategy: ChangeDetectionStrategy):
    boolean {
  return changeDetectionStrategy == null ||
      changeDetectionStrategy === ChangeDetectionStrategy.Default;
}
