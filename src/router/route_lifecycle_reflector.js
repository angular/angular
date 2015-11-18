'use strict';var lang_1 = require('angular2/src/facade/lang');
var lifecycle_annotations_impl_1 = require('./lifecycle_annotations_impl');
var reflection_1 = require('angular2/src/core/reflection/reflection');
function hasLifecycleHook(e, type) {
    if (!(type instanceof lang_1.Type))
        return false;
    return e.name in type.prototype;
}
exports.hasLifecycleHook = hasLifecycleHook;
function getCanActivateHook(type) {
    var annotations = reflection_1.reflector.annotations(type);
    for (var i = 0; i < annotations.length; i += 1) {
        var annotation = annotations[i];
        if (annotation instanceof lifecycle_annotations_impl_1.CanActivate) {
            return annotation.fn;
        }
    }
    return null;
}
exports.getCanActivateHook = getCanActivateHook;
//# sourceMappingURL=route_lifecycle_reflector.js.map