import {StringWrapper, normalizeBool, isBlank} from 'angular2/src/core/facade/lang';

export enum ChangeDetectionStrategy {
  /**
   * `CheckedOnce` means that after calling detectChanges the mode of the change detector
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
   * `OnPush` means that the change detector's mode will be set to `CheckOnce` during hydration.
   */
  OnPush,

  /**
   * `Default` means that the change detector's mode will be set to `CheckAlways` during hydration.
   */
  Default,

  /**
   * This is an experimental feature. Works only in Dart.
   */
  OnPushObserve
}

export var CHANGE_DECTION_STRATEGY_VALUES = [
  ChangeDetectionStrategy.CheckOnce,
  ChangeDetectionStrategy.Checked,
  ChangeDetectionStrategy.CheckAlways,
  ChangeDetectionStrategy.Detached,
  ChangeDetectionStrategy.OnPush,
  ChangeDetectionStrategy.Default,
  ChangeDetectionStrategy.OnPushObserve
];

export function isDefaultChangeDetectionStrategy(changeDetectionStrategy: ChangeDetectionStrategy):
    boolean {
  return isBlank(changeDetectionStrategy) ||
         changeDetectionStrategy === ChangeDetectionStrategy.Default;
}
