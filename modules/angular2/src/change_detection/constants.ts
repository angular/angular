// TODO:vsavkin Use enums after switching to TypeScript

/**
 * CHECK_ONCE means that after calling detectChanges the mode of the change detector
 * will become CHECKED.
 */
export const CHECK_ONCE = "CHECK_ONCE";

/**
 * CHECKED means that the change detector should be skipped until its mode changes to
 * CHECK_ONCE or CHECK_ALWAYS.
 */
export const CHECKED = "CHECKED";

/**
 * CHECK_ALWAYS means that after calling detectChanges the mode of the change detector
 * will remain CHECK_ALWAYS.
 */
export const CHECK_ALWAYS = "ALWAYS_CHECK";

/**
 * DETACHED means that the change detector sub tree is not a part of the main tree and
 * should be skipped.
 */
export const DETACHED = "DETACHED";

/**
 * ON_PUSH means that the change detector's mode will be set to CHECK_ONCE during hydration.
 */
export const ON_PUSH = "ON_PUSH";

/**
 * DEFAULT means that the change detector's mode will be set to CHECK_ALWAYS during hydration.
 */
export const DEFAULT = "DEFAULT";