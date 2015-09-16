import {
  StringWrapper,
  normalizeBool,
  isBlank,
  serializeEnum,
  deserializeEnum
} from 'angular2/src/core/facade/lang';
import {MapWrapper} from 'angular2/src/core/facade/collection';

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

var strategyMap: Map<number, ChangeDetectionStrategy> = MapWrapper.createFromPairs([
  [0, ChangeDetectionStrategy.CheckOnce],
  [1, ChangeDetectionStrategy.Checked],
  [2, ChangeDetectionStrategy.CheckAlways],
  [3, ChangeDetectionStrategy.Detached],
  [4, ChangeDetectionStrategy.OnPush],
  [5, ChangeDetectionStrategy.Default],
  [6, ChangeDetectionStrategy.OnPushObserve]
]);

export function changeDetectionStrategyFromJson(value: number): ChangeDetectionStrategy {
  return deserializeEnum(value, strategyMap);
}

export function isDefaultChangeDetectionStrategy(changeDetectionStrategy: ChangeDetectionStrategy):
    boolean {
  return isBlank(changeDetectionStrategy) ||
         changeDetectionStrategy === ChangeDetectionStrategy.Default;
}
