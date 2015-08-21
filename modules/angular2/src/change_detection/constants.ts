// TODO:vsavkin Use enums after switching to TypeScript
import {StringWrapper, normalizeBool, isBlank} from 'angular2/src/facade/lang';

/**
 * CHECK_ONCE means that after calling detectChanges the mode of the change detector
 * will become CHECKED.
 */
export const CHECK_ONCE: string = "CHECK_ONCE";

/**
 * CHECKED means that the change detector should be skipped until its mode changes to
 * CHECK_ONCE or CHECK_ALWAYS.
 */
export const CHECKED: string = "CHECKED";

/**
 * CHECK_ALWAYS means that after calling detectChanges the mode of the change detector
 * will remain CHECK_ALWAYS.
 */
export const CHECK_ALWAYS: string = "ALWAYS_CHECK";

/**
 * DETACHED means that the change detector sub tree is not a part of the main tree and
 * should be skipped.
 */
export const DETACHED: string = "DETACHED";

/**
 * ON_PUSH means that the change detector's mode will be set to CHECK_ONCE during hydration.
 */
export const ON_PUSH: string = "ON_PUSH";

/**
 * DEFAULT means that the change detector's mode will be set to CHECK_ALWAYS during hydration.
 */
export const DEFAULT: string = "DEFAULT";

export function isDefaultChangeDetectionStrategy(changeDetectionStrategy: string): boolean {
  return isBlank(changeDetectionStrategy) || StringWrapper.equals(changeDetectionStrategy, DEFAULT);
}


/**
 * This is an experimental feature. Works only in Dart.
 */
export const ON_PUSH_OBSERVE = "ON_PUSH_OBSERVE";