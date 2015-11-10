function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
/**
 * @module
 * @description
 * Starting point to import all public core APIs.
 */
__export(require('./src/core/metadata'));
__export(require('./src/core/util'));
__export(require('./src/core/di'));
__export(require('./src/common/pipes'));
__export(require('./src/facade/facade'));
__export(require('./src/core/application'));
__export(require('./src/core/bootstrap'));
__export(require('./src/core/services'));
__export(require('./src/core/linker'));
var application_ref_1 = require('./src/core/application_ref');
exports.ApplicationRef = application_ref_1.ApplicationRef;
__export(require('./src/core/zone'));
__export(require('./src/core/render'));
__export(require('./src/common/directives'));
__export(require('./src/common/forms'));
__export(require('./src/core/debug'));
__export(require('./src/core/change_detection'));
__export(require('./src/core/ambient'));
__export(require('./src/core/dev_mode'));
//# sourceMappingURL=core.js.map