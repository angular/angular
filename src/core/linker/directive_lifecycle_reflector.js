'use strict';var lang_1 = require('angular2/src/facade/lang');
var interfaces_1 = require('./interfaces');
function hasLifecycleHook(lcInterface, token) {
    if (!(token instanceof lang_1.Type))
        return false;
    var proto = token.prototype;
    switch (lcInterface) {
        case interfaces_1.LifecycleHooks.AfterContentInit:
            return !!proto.afterContentInit;
        case interfaces_1.LifecycleHooks.AfterContentChecked:
            return !!proto.afterContentChecked;
        case interfaces_1.LifecycleHooks.AfterViewInit:
            return !!proto.afterViewInit;
        case interfaces_1.LifecycleHooks.AfterViewChecked:
            return !!proto.afterViewChecked;
        case interfaces_1.LifecycleHooks.OnChanges:
            return !!proto.onChanges;
        case interfaces_1.LifecycleHooks.DoCheck:
            return !!proto.doCheck;
        case interfaces_1.LifecycleHooks.OnDestroy:
            return !!proto.onDestroy;
        case interfaces_1.LifecycleHooks.OnInit:
            return !!proto.onInit;
        default:
            return false;
    }
}
exports.hasLifecycleHook = hasLifecycleHook;
//# sourceMappingURL=directive_lifecycle_reflector.js.map