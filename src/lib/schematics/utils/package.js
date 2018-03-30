"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Adds a package to the package.json
 */
function addPackageToPackageJson(host, type, pkg, version) {
    if (host.exists('package.json')) {
        const sourceText = host.read('package.json').toString('utf-8');
        const json = JSON.parse(sourceText);
        if (!json[type]) {
            json[type] = {};
        }
        if (!json[type][pkg]) {
            json[type][pkg] = version;
        }
        host.overwrite('package.json', JSON.stringify(json, null, 2));
    }
    return host;
}
exports.addPackageToPackageJson = addPackageToPackageJson;
//# sourceMappingURL=package.js.map