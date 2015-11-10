var lang_1 = require('angular2/src/facade/lang');
var compiler_1 = require('angular2/src/compiler/compiler');
var application_common_1 = require('./application_common');
var application_tokens_1 = require('./application_tokens');
exports.APP_COMPONENT = application_tokens_1.APP_COMPONENT;
exports.APP_ID = application_tokens_1.APP_ID;
var application_common_2 = require('./application_common');
exports.platform = application_common_2.platform;
var application_ref_1 = require('./application_ref');
exports.PlatformRef = application_ref_1.PlatformRef;
exports.ApplicationRef = application_ref_1.ApplicationRef;
exports.applicationCommonProviders = application_ref_1.applicationCommonProviders;
exports.createNgZone = application_ref_1.createNgZone;
exports.platformCommon = application_ref_1.platformCommon;
exports.platformProviders = application_ref_1.platformProviders;
/// See [commonBootstrap] for detailed documentation.
function bootstrap(appComponentType, appProviders) {
    if (appProviders === void 0) { appProviders = null; }
    var providers = [compiler_1.compilerProviders()];
    if (lang_1.isPresent(appProviders)) {
        providers.push(appProviders);
    }
    return application_common_1.commonBootstrap(appComponentType, providers);
}
exports.bootstrap = bootstrap;
//# sourceMappingURL=application.js.map