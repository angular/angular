'use strict';function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
__export(require('./common'));
__export(require('./core'));
__export(require('./instrumentation'));
__export(require('./platform/browser'));
__export(require('./src/platform/dom/dom_adapter'));
__export(require('./src/platform/dom/events/event_manager'));
__export(require('./upgrade'));
var compiler_1 = require('./compiler');
exports.UrlResolver = compiler_1.UrlResolver;
exports.AppRootUrl = compiler_1.AppRootUrl;
//# sourceMappingURL=angular2.js.map