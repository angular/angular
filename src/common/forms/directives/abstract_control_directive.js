'use strict';var lang_1 = require('angular2/src/facade/lang');
var exceptions_1 = require('angular2/src/facade/exceptions');
/**
 * Base class for control directives.
 *
 * Only used internally in the forms module.
 */
var AbstractControlDirective = (function () {
    function AbstractControlDirective() {
    }
    Object.defineProperty(AbstractControlDirective.prototype, "control", {
        get: function () { return exceptions_1.unimplemented(); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AbstractControlDirective.prototype, "value", {
        get: function () { return lang_1.isPresent(this.control) ? this.control.value : null; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AbstractControlDirective.prototype, "valid", {
        get: function () { return lang_1.isPresent(this.control) ? this.control.valid : null; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AbstractControlDirective.prototype, "errors", {
        get: function () {
            return lang_1.isPresent(this.control) ? this.control.errors : null;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AbstractControlDirective.prototype, "pristine", {
        get: function () { return lang_1.isPresent(this.control) ? this.control.pristine : null; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AbstractControlDirective.prototype, "dirty", {
        get: function () { return lang_1.isPresent(this.control) ? this.control.dirty : null; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AbstractControlDirective.prototype, "touched", {
        get: function () { return lang_1.isPresent(this.control) ? this.control.touched : null; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AbstractControlDirective.prototype, "untouched", {
        get: function () { return lang_1.isPresent(this.control) ? this.control.untouched : null; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AbstractControlDirective.prototype, "path", {
        get: function () { return null; },
        enumerable: true,
        configurable: true
    });
    return AbstractControlDirective;
})();
exports.AbstractControlDirective = AbstractControlDirective;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWJzdHJhY3RfY29udHJvbF9kaXJlY3RpdmUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvY29tbW9uL2Zvcm1zL2RpcmVjdGl2ZXMvYWJzdHJhY3RfY29udHJvbF9kaXJlY3RpdmUudHMiXSwibmFtZXMiOlsiQWJzdHJhY3RDb250cm9sRGlyZWN0aXZlIiwiQWJzdHJhY3RDb250cm9sRGlyZWN0aXZlLmNvbnN0cnVjdG9yIiwiQWJzdHJhY3RDb250cm9sRGlyZWN0aXZlLmNvbnRyb2wiLCJBYnN0cmFjdENvbnRyb2xEaXJlY3RpdmUudmFsdWUiLCJBYnN0cmFjdENvbnRyb2xEaXJlY3RpdmUudmFsaWQiLCJBYnN0cmFjdENvbnRyb2xEaXJlY3RpdmUuZXJyb3JzIiwiQWJzdHJhY3RDb250cm9sRGlyZWN0aXZlLnByaXN0aW5lIiwiQWJzdHJhY3RDb250cm9sRGlyZWN0aXZlLmRpcnR5IiwiQWJzdHJhY3RDb250cm9sRGlyZWN0aXZlLnRvdWNoZWQiLCJBYnN0cmFjdENvbnRyb2xEaXJlY3RpdmUudW50b3VjaGVkIiwiQWJzdHJhY3RDb250cm9sRGlyZWN0aXZlLnBhdGgiXSwibWFwcGluZ3MiOiJBQUNBLHFCQUF3QiwwQkFBMEIsQ0FBQyxDQUFBO0FBQ25ELDJCQUE0QixnQ0FBZ0MsQ0FBQyxDQUFBO0FBRTdEOzs7O0dBSUc7QUFDSDtJQUFBQTtJQW9CQUMsQ0FBQ0E7SUFuQkNELHNCQUFJQSw2Q0FBT0E7YUFBWEEsY0FBaUNFLE1BQU1BLENBQUNBLDBCQUFhQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQTs7O09BQUFGO0lBRTFEQSxzQkFBSUEsMkNBQUtBO2FBQVRBLGNBQW1CRyxNQUFNQSxDQUFDQSxnQkFBU0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsR0FBR0EsSUFBSUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsS0FBS0EsR0FBR0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7OztPQUFBSDtJQUVoRkEsc0JBQUlBLDJDQUFLQTthQUFUQSxjQUF1QkksTUFBTUEsQ0FBQ0EsZ0JBQVNBLENBQUNBLElBQUlBLENBQUNBLE9BQU9BLENBQUNBLEdBQUdBLElBQUlBLENBQUNBLE9BQU9BLENBQUNBLEtBQUtBLEdBQUdBLElBQUlBLENBQUNBLENBQUNBLENBQUNBOzs7T0FBQUo7SUFFcEZBLHNCQUFJQSw0Q0FBTUE7YUFBVkE7WUFDRUssTUFBTUEsQ0FBQ0EsZ0JBQVNBLENBQUNBLElBQUlBLENBQUNBLE9BQU9BLENBQUNBLEdBQUdBLElBQUlBLENBQUNBLE9BQU9BLENBQUNBLE1BQU1BLEdBQUdBLElBQUlBLENBQUNBO1FBQzlEQSxDQUFDQTs7O09BQUFMO0lBRURBLHNCQUFJQSw4Q0FBUUE7YUFBWkEsY0FBMEJNLE1BQU1BLENBQUNBLGdCQUFTQSxDQUFDQSxJQUFJQSxDQUFDQSxPQUFPQSxDQUFDQSxHQUFHQSxJQUFJQSxDQUFDQSxPQUFPQSxDQUFDQSxRQUFRQSxHQUFHQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQTs7O09BQUFOO0lBRTFGQSxzQkFBSUEsMkNBQUtBO2FBQVRBLGNBQXVCTyxNQUFNQSxDQUFDQSxnQkFBU0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsR0FBR0EsSUFBSUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsS0FBS0EsR0FBR0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7OztPQUFBUDtJQUVwRkEsc0JBQUlBLDZDQUFPQTthQUFYQSxjQUF5QlEsTUFBTUEsQ0FBQ0EsZ0JBQVNBLENBQUNBLElBQUlBLENBQUNBLE9BQU9BLENBQUNBLEdBQUdBLElBQUlBLENBQUNBLE9BQU9BLENBQUNBLE9BQU9BLEdBQUdBLElBQUlBLENBQUNBLENBQUNBLENBQUNBOzs7T0FBQVI7SUFFeEZBLHNCQUFJQSwrQ0FBU0E7YUFBYkEsY0FBMkJTLE1BQU1BLENBQUNBLGdCQUFTQSxDQUFDQSxJQUFJQSxDQUFDQSxPQUFPQSxDQUFDQSxHQUFHQSxJQUFJQSxDQUFDQSxPQUFPQSxDQUFDQSxTQUFTQSxHQUFHQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQTs7O09BQUFUO0lBRTVGQSxzQkFBSUEsMENBQUlBO2FBQVJBLGNBQXVCVSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQTs7O09BQUFWO0lBQ3ZDQSwrQkFBQ0E7QUFBREEsQ0FBQ0EsQUFwQkQsSUFvQkM7QUFwQnFCLGdDQUF3QiwyQkFvQjdDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0Fic3RyYWN0Q29udHJvbH0gZnJvbSAnLi4vbW9kZWwnO1xuaW1wb3J0IHtpc1ByZXNlbnR9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge3VuaW1wbGVtZW50ZWR9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvZXhjZXB0aW9ucyc7XG5cbi8qKlxuICogQmFzZSBjbGFzcyBmb3IgY29udHJvbCBkaXJlY3RpdmVzLlxuICpcbiAqIE9ubHkgdXNlZCBpbnRlcm5hbGx5IGluIHRoZSBmb3JtcyBtb2R1bGUuXG4gKi9cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBBYnN0cmFjdENvbnRyb2xEaXJlY3RpdmUge1xuICBnZXQgY29udHJvbCgpOiBBYnN0cmFjdENvbnRyb2wgeyByZXR1cm4gdW5pbXBsZW1lbnRlZCgpOyB9XG5cbiAgZ2V0IHZhbHVlKCk6IGFueSB7IHJldHVybiBpc1ByZXNlbnQodGhpcy5jb250cm9sKSA/IHRoaXMuY29udHJvbC52YWx1ZSA6IG51bGw7IH1cblxuICBnZXQgdmFsaWQoKTogYm9vbGVhbiB7IHJldHVybiBpc1ByZXNlbnQodGhpcy5jb250cm9sKSA/IHRoaXMuY29udHJvbC52YWxpZCA6IG51bGw7IH1cblxuICBnZXQgZXJyb3JzKCk6IHtba2V5OiBzdHJpbmddOiBhbnl9IHtcbiAgICByZXR1cm4gaXNQcmVzZW50KHRoaXMuY29udHJvbCkgPyB0aGlzLmNvbnRyb2wuZXJyb3JzIDogbnVsbDtcbiAgfVxuXG4gIGdldCBwcmlzdGluZSgpOiBib29sZWFuIHsgcmV0dXJuIGlzUHJlc2VudCh0aGlzLmNvbnRyb2wpID8gdGhpcy5jb250cm9sLnByaXN0aW5lIDogbnVsbDsgfVxuXG4gIGdldCBkaXJ0eSgpOiBib29sZWFuIHsgcmV0dXJuIGlzUHJlc2VudCh0aGlzLmNvbnRyb2wpID8gdGhpcy5jb250cm9sLmRpcnR5IDogbnVsbDsgfVxuXG4gIGdldCB0b3VjaGVkKCk6IGJvb2xlYW4geyByZXR1cm4gaXNQcmVzZW50KHRoaXMuY29udHJvbCkgPyB0aGlzLmNvbnRyb2wudG91Y2hlZCA6IG51bGw7IH1cblxuICBnZXQgdW50b3VjaGVkKCk6IGJvb2xlYW4geyByZXR1cm4gaXNQcmVzZW50KHRoaXMuY29udHJvbCkgPyB0aGlzLmNvbnRyb2wudW50b3VjaGVkIDogbnVsbDsgfVxuXG4gIGdldCBwYXRoKCk6IHN0cmluZ1tdIHsgcmV0dXJuIG51bGw7IH1cbn1cbiJdfQ==