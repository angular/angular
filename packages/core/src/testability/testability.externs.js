/** @externs */

/** @record @struct */
function PublicTestability() {}

/**
 * @return {?}
 */
PublicTestability.prototype.isStable = function () {};

/**
 * @param {?} callback
 * @param {?} timeout
 * @param {?} updateCallback
 * @return {?}
 */
PublicTestability.prototype.whenStable = function (callback, timeout, updateCallback) {};

/**
 * @param {?} using
 * @param {?} provider
 * @param {?} exactMatch
 * @return {?}
 */
PublicTestability.prototype.findProviders = function (using, provider, exactMatch) {};
