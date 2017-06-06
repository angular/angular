'use strict';"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var abstract_control_directive_1 = require('./abstract_control_directive');
var exceptions_1 = require('angular2/src/facade/exceptions');
/**
 * A base class that all control directive extend.
 * It binds a {@link Control} object to a DOM element.
 *
 * Used internally by Angular forms.
 */
var NgControl = (function (_super) {
    __extends(NgControl, _super);
    function NgControl() {
        _super.apply(this, arguments);
        this.name = null;
        this.valueAccessor = null;
    }
    Object.defineProperty(NgControl.prototype, "validator", {
        get: function () { return exceptions_1.unimplemented(); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(NgControl.prototype, "asyncValidator", {
        get: function () { return exceptions_1.unimplemented(); },
        enumerable: true,
        configurable: true
    });
    return NgControl;
}(abstract_control_directive_1.AbstractControlDirective));
exports.NgControl = NgControl;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfY29udHJvbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImRpZmZpbmdfcGx1Z2luX3dyYXBwZXItb3V0cHV0X3BhdGgtcjVQckpLOWgudG1wL2FuZ3VsYXIyL3NyYy9jb21tb24vZm9ybXMvZGlyZWN0aXZlcy9uZ19jb250cm9sLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUNBLDJDQUF1Qyw4QkFBOEIsQ0FBQyxDQUFBO0FBQ3RFLDJCQUE0QixnQ0FBZ0MsQ0FBQyxDQUFBO0FBRzdEOzs7OztHQUtHO0FBQ0g7SUFBd0MsNkJBQXdCO0lBQWhFO1FBQXdDLDhCQUF3QjtRQUM5RCxTQUFJLEdBQVcsSUFBSSxDQUFDO1FBQ3BCLGtCQUFhLEdBQXlCLElBQUksQ0FBQztJQU03QyxDQUFDO0lBSkMsc0JBQUksZ0NBQVM7YUFBYixjQUErQixNQUFNLENBQWMsMEJBQWEsRUFBRSxDQUFDLENBQUMsQ0FBQzs7O09BQUE7SUFDckUsc0JBQUkscUNBQWM7YUFBbEIsY0FBeUMsTUFBTSxDQUFtQiwwQkFBYSxFQUFFLENBQUMsQ0FBQyxDQUFDOzs7T0FBQTtJQUd0RixnQkFBQztBQUFELENBQUMsQUFSRCxDQUF3QyxxREFBd0IsR0FRL0Q7QUFScUIsaUJBQVMsWUFROUIsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7Q29udHJvbFZhbHVlQWNjZXNzb3J9IGZyb20gJy4vY29udHJvbF92YWx1ZV9hY2Nlc3Nvcic7XG5pbXBvcnQge0Fic3RyYWN0Q29udHJvbERpcmVjdGl2ZX0gZnJvbSAnLi9hYnN0cmFjdF9jb250cm9sX2RpcmVjdGl2ZSc7XG5pbXBvcnQge3VuaW1wbGVtZW50ZWR9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvZXhjZXB0aW9ucyc7XG5pbXBvcnQge0FzeW5jVmFsaWRhdG9yRm4sIFZhbGlkYXRvckZufSBmcm9tICcuL3ZhbGlkYXRvcnMnO1xuXG4vKipcbiAqIEEgYmFzZSBjbGFzcyB0aGF0IGFsbCBjb250cm9sIGRpcmVjdGl2ZSBleHRlbmQuXG4gKiBJdCBiaW5kcyBhIHtAbGluayBDb250cm9sfSBvYmplY3QgdG8gYSBET00gZWxlbWVudC5cbiAqXG4gKiBVc2VkIGludGVybmFsbHkgYnkgQW5ndWxhciBmb3Jtcy5cbiAqL1xuZXhwb3J0IGFic3RyYWN0IGNsYXNzIE5nQ29udHJvbCBleHRlbmRzIEFic3RyYWN0Q29udHJvbERpcmVjdGl2ZSB7XG4gIG5hbWU6IHN0cmluZyA9IG51bGw7XG4gIHZhbHVlQWNjZXNzb3I6IENvbnRyb2xWYWx1ZUFjY2Vzc29yID0gbnVsbDtcblxuICBnZXQgdmFsaWRhdG9yKCk6IFZhbGlkYXRvckZuIHsgcmV0dXJuIDxWYWxpZGF0b3JGbj51bmltcGxlbWVudGVkKCk7IH1cbiAgZ2V0IGFzeW5jVmFsaWRhdG9yKCk6IEFzeW5jVmFsaWRhdG9yRm4geyByZXR1cm4gPEFzeW5jVmFsaWRhdG9yRm4+dW5pbXBsZW1lbnRlZCgpOyB9XG5cbiAgYWJzdHJhY3Qgdmlld1RvTW9kZWxVcGRhdGUobmV3VmFsdWU6IGFueSk6IHZvaWQ7XG59XG4iXX0=