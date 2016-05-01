'use strict';"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var base_wrapped_exception_1 = require('./base_wrapped_exception');
var exception_handler_1 = require('./exception_handler');
var exception_handler_2 = require('./exception_handler');
exports.ExceptionHandler = exception_handler_2.ExceptionHandler;
var BaseException = (function (_super) {
    __extends(BaseException, _super);
    function BaseException(message) {
        if (message === void 0) { message = "--"; }
        _super.call(this, message);
        this.message = message;
        this.stack = (new Error(message)).stack;
    }
    BaseException.prototype.toString = function () { return this.message; };
    return BaseException;
}(Error));
exports.BaseException = BaseException;
/**
 * Wraps an exception and provides additional context or information.
 */
var WrappedException = (function (_super) {
    __extends(WrappedException, _super);
    function WrappedException(_wrapperMessage, _originalException, _originalStack, _context) {
        _super.call(this, _wrapperMessage);
        this._wrapperMessage = _wrapperMessage;
        this._originalException = _originalException;
        this._originalStack = _originalStack;
        this._context = _context;
        this._wrapperStack = (new Error(_wrapperMessage)).stack;
    }
    Object.defineProperty(WrappedException.prototype, "wrapperMessage", {
        get: function () { return this._wrapperMessage; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WrappedException.prototype, "wrapperStack", {
        get: function () { return this._wrapperStack; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WrappedException.prototype, "originalException", {
        get: function () { return this._originalException; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WrappedException.prototype, "originalStack", {
        get: function () { return this._originalStack; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WrappedException.prototype, "context", {
        get: function () { return this._context; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WrappedException.prototype, "message", {
        get: function () { return exception_handler_1.ExceptionHandler.exceptionToString(this); },
        enumerable: true,
        configurable: true
    });
    WrappedException.prototype.toString = function () { return this.message; };
    return WrappedException;
}(base_wrapped_exception_1.BaseWrappedException));
exports.WrappedException = WrappedException;
function makeTypeError(message) {
    return new TypeError(message);
}
exports.makeTypeError = makeTypeError;
function unimplemented() {
    throw new BaseException('unimplemented');
}
exports.unimplemented = unimplemented;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXhjZXB0aW9ucy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImRpZmZpbmdfcGx1Z2luX3dyYXBwZXItb3V0cHV0X3BhdGgtcjVQckpLOWgudG1wL2FuZ3VsYXIyL3NyYy9mYWNhZGUvZXhjZXB0aW9ucy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSx1Q0FBbUMsMEJBQTBCLENBQUMsQ0FBQTtBQUM5RCxrQ0FBK0IscUJBQXFCLENBQUMsQ0FBQTtBQUVyRCxrQ0FBK0IscUJBQXFCLENBQUM7QUFBN0MsZ0VBQTZDO0FBRXJEO0lBQW1DLGlDQUFLO0lBRXRDLHVCQUFtQixPQUFzQjtRQUE3Qix1QkFBNkIsR0FBN0IsY0FBNkI7UUFDdkMsa0JBQU0sT0FBTyxDQUFDLENBQUM7UUFERSxZQUFPLEdBQVAsT0FBTyxDQUFlO1FBRXZDLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBTSxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQztJQUMvQyxDQUFDO0lBRUQsZ0NBQVEsR0FBUixjQUFxQixNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7SUFDN0Msb0JBQUM7QUFBRCxDQUFDLEFBUkQsQ0FBbUMsS0FBSyxHQVF2QztBQVJZLHFCQUFhLGdCQVF6QixDQUFBO0FBRUQ7O0dBRUc7QUFDSDtJQUFzQyxvQ0FBb0I7SUFHeEQsMEJBQW9CLGVBQXVCLEVBQVUsa0JBQWtCLEVBQVUsY0FBZSxFQUM1RSxRQUFTO1FBQzNCLGtCQUFNLGVBQWUsQ0FBQyxDQUFDO1FBRkwsb0JBQWUsR0FBZixlQUFlLENBQVE7UUFBVSx1QkFBa0IsR0FBbEIsa0JBQWtCLENBQUE7UUFBVSxtQkFBYyxHQUFkLGNBQWMsQ0FBQztRQUM1RSxhQUFRLEdBQVIsUUFBUSxDQUFDO1FBRTNCLElBQUksQ0FBQyxhQUFhLEdBQUcsQ0FBTSxJQUFJLEtBQUssQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQztJQUMvRCxDQUFDO0lBRUQsc0JBQUksNENBQWM7YUFBbEIsY0FBK0IsTUFBTSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDOzs7T0FBQTtJQUU3RCxzQkFBSSwwQ0FBWTthQUFoQixjQUEwQixNQUFNLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUM7OztPQUFBO0lBR3RELHNCQUFJLCtDQUFpQjthQUFyQixjQUErQixNQUFNLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUMsQ0FBQzs7O09BQUE7SUFFaEUsc0JBQUksMkNBQWE7YUFBakIsY0FBMkIsTUFBTSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDOzs7T0FBQTtJQUd4RCxzQkFBSSxxQ0FBTzthQUFYLGNBQXFCLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQzs7O09BQUE7SUFFNUMsc0JBQUkscUNBQU87YUFBWCxjQUF3QixNQUFNLENBQUMsb0NBQWdCLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDOzs7T0FBQTtJQUUxRSxtQ0FBUSxHQUFSLGNBQXFCLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztJQUM3Qyx1QkFBQztBQUFELENBQUMsQUF4QkQsQ0FBc0MsNkNBQW9CLEdBd0J6RDtBQXhCWSx3QkFBZ0IsbUJBd0I1QixDQUFBO0FBRUQsdUJBQThCLE9BQWdCO0lBQzVDLE1BQU0sQ0FBQyxJQUFJLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUNoQyxDQUFDO0FBRmUscUJBQWEsZ0JBRTVCLENBQUE7QUFFRDtJQUNFLE1BQU0sSUFBSSxhQUFhLENBQUMsZUFBZSxDQUFDLENBQUM7QUFDM0MsQ0FBQztBQUZlLHFCQUFhLGdCQUU1QixDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtCYXNlV3JhcHBlZEV4Y2VwdGlvbn0gZnJvbSAnLi9iYXNlX3dyYXBwZWRfZXhjZXB0aW9uJztcbmltcG9ydCB7RXhjZXB0aW9uSGFuZGxlcn0gZnJvbSAnLi9leGNlcHRpb25faGFuZGxlcic7XG5cbmV4cG9ydCB7RXhjZXB0aW9uSGFuZGxlcn0gZnJvbSAnLi9leGNlcHRpb25faGFuZGxlcic7XG5cbmV4cG9ydCBjbGFzcyBCYXNlRXhjZXB0aW9uIGV4dGVuZHMgRXJyb3Ige1xuICBwdWJsaWMgc3RhY2s6IGFueTtcbiAgY29uc3RydWN0b3IocHVibGljIG1lc3NhZ2U6IHN0cmluZyA9IFwiLS1cIikge1xuICAgIHN1cGVyKG1lc3NhZ2UpO1xuICAgIHRoaXMuc3RhY2sgPSAoPGFueT5uZXcgRXJyb3IobWVzc2FnZSkpLnN0YWNrO1xuICB9XG5cbiAgdG9TdHJpbmcoKTogc3RyaW5nIHsgcmV0dXJuIHRoaXMubWVzc2FnZTsgfVxufVxuXG4vKipcbiAqIFdyYXBzIGFuIGV4Y2VwdGlvbiBhbmQgcHJvdmlkZXMgYWRkaXRpb25hbCBjb250ZXh0IG9yIGluZm9ybWF0aW9uLlxuICovXG5leHBvcnQgY2xhc3MgV3JhcHBlZEV4Y2VwdGlvbiBleHRlbmRzIEJhc2VXcmFwcGVkRXhjZXB0aW9uIHtcbiAgcHJpdmF0ZSBfd3JhcHBlclN0YWNrOiBhbnk7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBfd3JhcHBlck1lc3NhZ2U6IHN0cmluZywgcHJpdmF0ZSBfb3JpZ2luYWxFeGNlcHRpb24sIHByaXZhdGUgX29yaWdpbmFsU3RhY2s/LFxuICAgICAgICAgICAgICBwcml2YXRlIF9jb250ZXh0Pykge1xuICAgIHN1cGVyKF93cmFwcGVyTWVzc2FnZSk7XG4gICAgdGhpcy5fd3JhcHBlclN0YWNrID0gKDxhbnk+bmV3IEVycm9yKF93cmFwcGVyTWVzc2FnZSkpLnN0YWNrO1xuICB9XG5cbiAgZ2V0IHdyYXBwZXJNZXNzYWdlKCk6IHN0cmluZyB7IHJldHVybiB0aGlzLl93cmFwcGVyTWVzc2FnZTsgfVxuXG4gIGdldCB3cmFwcGVyU3RhY2soKTogYW55IHsgcmV0dXJuIHRoaXMuX3dyYXBwZXJTdGFjazsgfVxuXG5cbiAgZ2V0IG9yaWdpbmFsRXhjZXB0aW9uKCk6IGFueSB7IHJldHVybiB0aGlzLl9vcmlnaW5hbEV4Y2VwdGlvbjsgfVxuXG4gIGdldCBvcmlnaW5hbFN0YWNrKCk6IGFueSB7IHJldHVybiB0aGlzLl9vcmlnaW5hbFN0YWNrOyB9XG5cblxuICBnZXQgY29udGV4dCgpOiBhbnkgeyByZXR1cm4gdGhpcy5fY29udGV4dDsgfVxuXG4gIGdldCBtZXNzYWdlKCk6IHN0cmluZyB7IHJldHVybiBFeGNlcHRpb25IYW5kbGVyLmV4Y2VwdGlvblRvU3RyaW5nKHRoaXMpOyB9XG5cbiAgdG9TdHJpbmcoKTogc3RyaW5nIHsgcmV0dXJuIHRoaXMubWVzc2FnZTsgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gbWFrZVR5cGVFcnJvcihtZXNzYWdlPzogc3RyaW5nKTogRXJyb3Ige1xuICByZXR1cm4gbmV3IFR5cGVFcnJvcihtZXNzYWdlKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHVuaW1wbGVtZW50ZWQoKTogYW55IHtcbiAgdGhyb3cgbmV3IEJhc2VFeGNlcHRpb24oJ3VuaW1wbGVtZW50ZWQnKTtcbn1cbiJdfQ==