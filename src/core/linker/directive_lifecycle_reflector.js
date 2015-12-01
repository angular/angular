'use strict';var lang_1 = require('angular2/src/facade/lang');
var interfaces_1 = require('./interfaces');
function hasLifecycleHook(lcInterface, token) {
    if (!(token instanceof lang_1.Type))
        return false;
    var proto = token.prototype;
    switch (lcInterface) {
        case interfaces_1.LifecycleHooks.AfterContentInit:
            return !!proto.ngAfterContentInit;
        case interfaces_1.LifecycleHooks.AfterContentChecked:
            return !!proto.ngAfterContentChecked;
        case interfaces_1.LifecycleHooks.AfterViewInit:
            return !!proto.ngAfterViewInit;
        case interfaces_1.LifecycleHooks.AfterViewChecked:
            return !!proto.ngAfterViewChecked;
        case interfaces_1.LifecycleHooks.OnChanges:
            return !!proto.ngOnChanges;
        case interfaces_1.LifecycleHooks.DoCheck:
            return !!proto.ngDoCheck;
        case interfaces_1.LifecycleHooks.OnDestroy:
            return !!proto.ngOnDestroy;
        case interfaces_1.LifecycleHooks.OnInit:
            return !!proto.ngOnInit;
        default:
            return false;
    }
}
exports.hasLifecycleHook = hasLifecycleHook;
//# sourceMappingURL=directive_lifecycle_reflector.js.map