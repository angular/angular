function noNg() {
    throw new Error('AngularJS v1.x is not loaded!');
}
var angular = {
    bootstrap: noNg,
    module: noNg,
    element: noNg,
    version: noNg,
    resumeBootstrap: noNg,
    getTestability: noNg
};
try {
    if (window.hasOwnProperty('angular')) {
        angular = window.angular;
    }
}
catch (e) {
}
export var bootstrap = angular.bootstrap;
export var module = angular.module;
export var element = angular.element;
export var version = angular.version;
export var resumeBootstrap = angular.resumeBootstrap;
export var getTestability = angular.getTestability;
