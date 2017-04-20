/** @externs */

/** @record @struct */
function PublicTestability() {}

/**
 * @return {?}
 */
PublicTestability.prototype.isStable = function() {};

/**
 * @param {?} callback
 * @return {?}
 */
PublicTestability.prototype.whenStable = function(callback) {};

/**
 * @param {?} using
 * @param {?} provider
 * @param {?} exactMatch
 * @return {?}
 */
PublicTestability.prototype.findProviders = function(using, provider, exactMatch) {};