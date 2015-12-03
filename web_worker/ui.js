'use strict';function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
__export(require('angular2/src/facade/facade'));
__export(require('../src/core/di'));
var application_ref_1 = require('../src/core/application_ref');
exports.platform = application_ref_1.platform;
exports.PlatformRef = application_ref_1.PlatformRef;
exports.ApplicationRef = application_ref_1.ApplicationRef;
var application_tokens_1 = require('../src/core/application_tokens');
exports.APP_ID = application_tokens_1.APP_ID;
exports.APP_COMPONENT = application_tokens_1.APP_COMPONENT;
exports.APP_INITIALIZER = application_tokens_1.APP_INITIALIZER;
exports.PLATFORM_INITIALIZER = application_tokens_1.PLATFORM_INITIALIZER;
__export(require('../src/core/zone'));
__export(require('angular2/platform/worker_render'));
//# sourceMappingURL=ui.js.map