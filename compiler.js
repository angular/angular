function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
/**
 * @module
 * @description
 * Starting point to import all compiler APIs.
 */
__export(require('./src/compiler/url_resolver'));
__export(require('./src/compiler/xhr'));
__export(require('./src/compiler/compiler'));
__export(require('./src/compiler/app_root_url'));
//# sourceMappingURL=compiler.js.map