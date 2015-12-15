'use strict';var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
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
})(Error);
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
})(Error);
exports.WrappedException = WrappedException;
function makeTypeError(message) {
    return new TypeError(message);
}
exports.makeTypeError = makeTypeError;
function unimplemented() {
    throw new BaseException('unimplemented');
}
exports.unimplemented = unimplemented;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXhjZXB0aW9ucy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy9mYWNhZGUvZXhjZXB0aW9ucy50cyJdLCJuYW1lcyI6WyJCYXNlRXhjZXB0aW9uIiwiQmFzZUV4Y2VwdGlvbi5jb25zdHJ1Y3RvciIsIkJhc2VFeGNlcHRpb24udG9TdHJpbmciLCJXcmFwcGVkRXhjZXB0aW9uIiwiV3JhcHBlZEV4Y2VwdGlvbi5jb25zdHJ1Y3RvciIsIldyYXBwZWRFeGNlcHRpb24ud3JhcHBlck1lc3NhZ2UiLCJXcmFwcGVkRXhjZXB0aW9uLndyYXBwZXJTdGFjayIsIldyYXBwZWRFeGNlcHRpb24ub3JpZ2luYWxFeGNlcHRpb24iLCJXcmFwcGVkRXhjZXB0aW9uLm9yaWdpbmFsU3RhY2siLCJXcmFwcGVkRXhjZXB0aW9uLmNvbnRleHQiLCJXcmFwcGVkRXhjZXB0aW9uLm1lc3NhZ2UiLCJXcmFwcGVkRXhjZXB0aW9uLnRvU3RyaW5nIiwibWFrZVR5cGVFcnJvciIsInVuaW1wbGVtZW50ZWQiXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsa0NBQStCLHFCQUFxQixDQUFDLENBQUE7QUFFckQsa0NBQStCLHFCQUFxQixDQUFDO0FBQTdDLGdFQUE2QztBQUVyRDtJQUFtQ0EsaUNBQUtBO0lBRXRDQSx1QkFBbUJBLE9BQXNCQTtRQUE3QkMsdUJBQTZCQSxHQUE3QkEsY0FBNkJBO1FBQ3ZDQSxrQkFBTUEsT0FBT0EsQ0FBQ0EsQ0FBQ0E7UUFERUEsWUFBT0EsR0FBUEEsT0FBT0EsQ0FBZUE7UUFFdkNBLElBQUlBLENBQUNBLEtBQUtBLEdBQUdBLENBQU1BLElBQUlBLEtBQUtBLENBQUNBLE9BQU9BLENBQUNBLENBQUNBLENBQUNBLEtBQUtBLENBQUNBO0lBQy9DQSxDQUFDQTtJQUVERCxnQ0FBUUEsR0FBUkEsY0FBcUJFLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLE9BQU9BLENBQUNBLENBQUNBLENBQUNBO0lBQzdDRixvQkFBQ0E7QUFBREEsQ0FBQ0EsQUFSRCxFQUFtQyxLQUFLLEVBUXZDO0FBUlkscUJBQWEsZ0JBUXpCLENBQUE7QUFFRDs7R0FFRztBQUNIO0lBQXNDRyxvQ0FBS0E7SUFHekNBLDBCQUFvQkEsZUFBdUJBLEVBQVVBLGtCQUFrQkEsRUFBVUEsY0FBZUEsRUFDNUVBLFFBQVNBO1FBQzNCQyxrQkFBTUEsZUFBZUEsQ0FBQ0EsQ0FBQ0E7UUFGTEEsb0JBQWVBLEdBQWZBLGVBQWVBLENBQVFBO1FBQVVBLHVCQUFrQkEsR0FBbEJBLGtCQUFrQkEsQ0FBQUE7UUFBVUEsbUJBQWNBLEdBQWRBLGNBQWNBLENBQUNBO1FBQzVFQSxhQUFRQSxHQUFSQSxRQUFRQSxDQUFDQTtRQUUzQkEsSUFBSUEsQ0FBQ0EsYUFBYUEsR0FBR0EsQ0FBTUEsSUFBSUEsS0FBS0EsQ0FBQ0EsZUFBZUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsS0FBS0EsQ0FBQ0E7SUFDL0RBLENBQUNBO0lBRURELHNCQUFJQSw0Q0FBY0E7YUFBbEJBLGNBQStCRSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxlQUFlQSxDQUFDQSxDQUFDQSxDQUFDQTs7O09BQUFGO0lBRTdEQSxzQkFBSUEsMENBQVlBO2FBQWhCQSxjQUEwQkcsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsYUFBYUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7OztPQUFBSDtJQUd0REEsc0JBQUlBLCtDQUFpQkE7YUFBckJBLGNBQStCSSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxrQkFBa0JBLENBQUNBLENBQUNBLENBQUNBOzs7T0FBQUo7SUFFaEVBLHNCQUFJQSwyQ0FBYUE7YUFBakJBLGNBQTJCSyxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxjQUFjQSxDQUFDQSxDQUFDQSxDQUFDQTs7O09BQUFMO0lBR3hEQSxzQkFBSUEscUNBQU9BO2FBQVhBLGNBQXFCTSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxRQUFRQSxDQUFDQSxDQUFDQSxDQUFDQTs7O09BQUFOO0lBRTVDQSxzQkFBSUEscUNBQU9BO2FBQVhBLGNBQXdCTyxNQUFNQSxDQUFDQSxvQ0FBZ0JBLENBQUNBLGlCQUFpQkEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7OztPQUFBUDtJQUUxRUEsbUNBQVFBLEdBQVJBLGNBQXFCUSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxPQUFPQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUM3Q1IsdUJBQUNBO0FBQURBLENBQUNBLEFBeEJELEVBQXNDLEtBQUssRUF3QjFDO0FBeEJZLHdCQUFnQixtQkF3QjVCLENBQUE7QUFFRCx1QkFBOEIsT0FBZ0I7SUFDNUNTLE1BQU1BLENBQUNBLElBQUlBLFNBQVNBLENBQUNBLE9BQU9BLENBQUNBLENBQUNBO0FBQ2hDQSxDQUFDQTtBQUZlLHFCQUFhLGdCQUU1QixDQUFBO0FBRUQ7SUFDRUMsTUFBTUEsSUFBSUEsYUFBYUEsQ0FBQ0EsZUFBZUEsQ0FBQ0EsQ0FBQ0E7QUFDM0NBLENBQUNBO0FBRmUscUJBQWEsZ0JBRTVCLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0V4Y2VwdGlvbkhhbmRsZXJ9IGZyb20gJy4vZXhjZXB0aW9uX2hhbmRsZXInO1xuXG5leHBvcnQge0V4Y2VwdGlvbkhhbmRsZXJ9IGZyb20gJy4vZXhjZXB0aW9uX2hhbmRsZXInO1xuXG5leHBvcnQgY2xhc3MgQmFzZUV4Y2VwdGlvbiBleHRlbmRzIEVycm9yIHtcbiAgcHVibGljIHN0YWNrOiBhbnk7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBtZXNzYWdlOiBzdHJpbmcgPSBcIi0tXCIpIHtcbiAgICBzdXBlcihtZXNzYWdlKTtcbiAgICB0aGlzLnN0YWNrID0gKDxhbnk+bmV3IEVycm9yKG1lc3NhZ2UpKS5zdGFjaztcbiAgfVxuXG4gIHRvU3RyaW5nKCk6IHN0cmluZyB7IHJldHVybiB0aGlzLm1lc3NhZ2U7IH1cbn1cblxuLyoqXG4gKiBXcmFwcyBhbiBleGNlcHRpb24gYW5kIHByb3ZpZGVzIGFkZGl0aW9uYWwgY29udGV4dCBvciBpbmZvcm1hdGlvbi5cbiAqL1xuZXhwb3J0IGNsYXNzIFdyYXBwZWRFeGNlcHRpb24gZXh0ZW5kcyBFcnJvciB7XG4gIHByaXZhdGUgX3dyYXBwZXJTdGFjazogYW55O1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgX3dyYXBwZXJNZXNzYWdlOiBzdHJpbmcsIHByaXZhdGUgX29yaWdpbmFsRXhjZXB0aW9uLCBwcml2YXRlIF9vcmlnaW5hbFN0YWNrPyxcbiAgICAgICAgICAgICAgcHJpdmF0ZSBfY29udGV4dD8pIHtcbiAgICBzdXBlcihfd3JhcHBlck1lc3NhZ2UpO1xuICAgIHRoaXMuX3dyYXBwZXJTdGFjayA9ICg8YW55Pm5ldyBFcnJvcihfd3JhcHBlck1lc3NhZ2UpKS5zdGFjaztcbiAgfVxuXG4gIGdldCB3cmFwcGVyTWVzc2FnZSgpOiBzdHJpbmcgeyByZXR1cm4gdGhpcy5fd3JhcHBlck1lc3NhZ2U7IH1cblxuICBnZXQgd3JhcHBlclN0YWNrKCk6IGFueSB7IHJldHVybiB0aGlzLl93cmFwcGVyU3RhY2s7IH1cblxuXG4gIGdldCBvcmlnaW5hbEV4Y2VwdGlvbigpOiBhbnkgeyByZXR1cm4gdGhpcy5fb3JpZ2luYWxFeGNlcHRpb247IH1cblxuICBnZXQgb3JpZ2luYWxTdGFjaygpOiBhbnkgeyByZXR1cm4gdGhpcy5fb3JpZ2luYWxTdGFjazsgfVxuXG5cbiAgZ2V0IGNvbnRleHQoKTogYW55IHsgcmV0dXJuIHRoaXMuX2NvbnRleHQ7IH1cblxuICBnZXQgbWVzc2FnZSgpOiBzdHJpbmcgeyByZXR1cm4gRXhjZXB0aW9uSGFuZGxlci5leGNlcHRpb25Ub1N0cmluZyh0aGlzKTsgfVxuXG4gIHRvU3RyaW5nKCk6IHN0cmluZyB7IHJldHVybiB0aGlzLm1lc3NhZ2U7IH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1ha2VUeXBlRXJyb3IobWVzc2FnZT86IHN0cmluZyk6IEVycm9yIHtcbiAgcmV0dXJuIG5ldyBUeXBlRXJyb3IobWVzc2FnZSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB1bmltcGxlbWVudGVkKCk6IGFueSB7XG4gIHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKCd1bmltcGxlbWVudGVkJyk7XG59XG4iXX0=