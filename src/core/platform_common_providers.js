var lang_1 = require('angular2/src/facade/lang');
var di_1 = require('angular2/src/core/di');
var reflection_1 = require('./reflection/reflection');
var testability_1 = require('angular2/src/core/testability/testability');
function _reflector() {
    return reflection_1.reflector;
}
/**
 * A default set of providers which should be included in any Angular platform.
 */
exports.PLATFORM_COMMON_PROVIDERS = lang_1.CONST_EXPR([new di_1.Provider(reflection_1.Reflector, { useFactory: _reflector, deps: [] }), testability_1.TestabilityRegistry]);
//# sourceMappingURL=platform_common_providers.js.map