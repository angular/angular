'use strict';function noNg() {
    throw new Error('AngularJS v1.x is not loaded!');
}
var angular = { bootstrap: noNg, module: noNg, element: noNg, version: noNg };
try {
    if (window.hasOwnProperty('angular')) {
        angular = window.angular;
    }
}
catch (e) {
}
exports.bootstrap = angular.bootstrap;
exports.module = angular.module;
exports.element = angular.element;
exports.version = angular.version;
//# sourceMappingURL=angular_js.js.map