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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXhjZXB0aW9ucy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy9mYWNhZGUvZXhjZXB0aW9ucy50cyJdLCJuYW1lcyI6WyJCYXNlRXhjZXB0aW9uIiwiQmFzZUV4Y2VwdGlvbi5jb25zdHJ1Y3RvciIsIkJhc2VFeGNlcHRpb24udG9TdHJpbmciLCJXcmFwcGVkRXhjZXB0aW9uIiwiV3JhcHBlZEV4Y2VwdGlvbi5jb25zdHJ1Y3RvciIsIldyYXBwZWRFeGNlcHRpb24ud3JhcHBlck1lc3NhZ2UiLCJXcmFwcGVkRXhjZXB0aW9uLndyYXBwZXJTdGFjayIsIldyYXBwZWRFeGNlcHRpb24ub3JpZ2luYWxFeGNlcHRpb24iLCJXcmFwcGVkRXhjZXB0aW9uLm9yaWdpbmFsU3RhY2siLCJXcmFwcGVkRXhjZXB0aW9uLmNvbnRleHQiLCJXcmFwcGVkRXhjZXB0aW9uLm1lc3NhZ2UiLCJXcmFwcGVkRXhjZXB0aW9uLnRvU3RyaW5nIiwibWFrZVR5cGVFcnJvciIsInVuaW1wbGVtZW50ZWQiXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsa0NBQStCLHFCQUFxQixDQUFDLENBQUE7QUFFckQsa0NBQStCLHFCQUFxQixDQUFDO0FBQTdDLGdFQUE2QztBQUVyRDtJQUFtQ0EsaUNBQUtBO0lBRXRDQSx1QkFBbUJBLE9BQXNCQTtRQUE3QkMsdUJBQTZCQSxHQUE3QkEsY0FBNkJBO1FBQ3ZDQSxrQkFBTUEsT0FBT0EsQ0FBQ0EsQ0FBQ0E7UUFERUEsWUFBT0EsR0FBUEEsT0FBT0EsQ0FBZUE7UUFFdkNBLElBQUlBLENBQUNBLEtBQUtBLEdBQUdBLENBQU1BLElBQUlBLEtBQUtBLENBQUNBLE9BQU9BLENBQUNBLENBQUNBLENBQUNBLEtBQUtBLENBQUNBO0lBQy9DQSxDQUFDQTtJQUVERCxnQ0FBUUEsR0FBUkEsY0FBcUJFLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLE9BQU9BLENBQUNBLENBQUNBLENBQUNBO0lBQzdDRixvQkFBQ0E7QUFBREEsQ0FBQ0EsQUFSRCxFQUFtQyxLQUFLLEVBUXZDO0FBUlkscUJBQWEsZ0JBUXpCLENBQUE7QUFFRDtJQUFzQ0csb0NBQUtBO0lBR3pDQSwwQkFBb0JBLGVBQXVCQSxFQUFVQSxrQkFBa0JBLEVBQVVBLGNBQWVBLEVBQzVFQSxRQUFTQTtRQUMzQkMsa0JBQU1BLGVBQWVBLENBQUNBLENBQUNBO1FBRkxBLG9CQUFlQSxHQUFmQSxlQUFlQSxDQUFRQTtRQUFVQSx1QkFBa0JBLEdBQWxCQSxrQkFBa0JBLENBQUFBO1FBQVVBLG1CQUFjQSxHQUFkQSxjQUFjQSxDQUFDQTtRQUM1RUEsYUFBUUEsR0FBUkEsUUFBUUEsQ0FBQ0E7UUFFM0JBLElBQUlBLENBQUNBLGFBQWFBLEdBQUdBLENBQU1BLElBQUlBLEtBQUtBLENBQUNBLGVBQWVBLENBQUNBLENBQUNBLENBQUNBLEtBQUtBLENBQUNBO0lBQy9EQSxDQUFDQTtJQUVERCxzQkFBSUEsNENBQWNBO2FBQWxCQSxjQUErQkUsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsZUFBZUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7OztPQUFBRjtJQUU3REEsc0JBQUlBLDBDQUFZQTthQUFoQkEsY0FBMEJHLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLGFBQWFBLENBQUNBLENBQUNBLENBQUNBOzs7T0FBQUg7SUFHdERBLHNCQUFJQSwrQ0FBaUJBO2FBQXJCQSxjQUErQkksTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0Esa0JBQWtCQSxDQUFDQSxDQUFDQSxDQUFDQTs7O09BQUFKO0lBRWhFQSxzQkFBSUEsMkNBQWFBO2FBQWpCQSxjQUEyQkssTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsY0FBY0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7OztPQUFBTDtJQUd4REEsc0JBQUlBLHFDQUFPQTthQUFYQSxjQUFxQk0sTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7OztPQUFBTjtJQUU1Q0Esc0JBQUlBLHFDQUFPQTthQUFYQSxjQUF3Qk8sTUFBTUEsQ0FBQ0Esb0NBQWdCQSxDQUFDQSxpQkFBaUJBLENBQUNBLElBQUlBLENBQUNBLENBQUNBLENBQUNBLENBQUNBOzs7T0FBQVA7SUFFMUVBLG1DQUFRQSxHQUFSQSxjQUFxQlEsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFDN0NSLHVCQUFDQTtBQUFEQSxDQUFDQSxBQXhCRCxFQUFzQyxLQUFLLEVBd0IxQztBQXhCWSx3QkFBZ0IsbUJBd0I1QixDQUFBO0FBRUQsdUJBQThCLE9BQWdCO0lBQzVDUyxNQUFNQSxDQUFDQSxJQUFJQSxTQUFTQSxDQUFDQSxPQUFPQSxDQUFDQSxDQUFDQTtBQUNoQ0EsQ0FBQ0E7QUFGZSxxQkFBYSxnQkFFNUIsQ0FBQTtBQUVEO0lBQ0VDLE1BQU1BLElBQUlBLGFBQWFBLENBQUNBLGVBQWVBLENBQUNBLENBQUNBO0FBQzNDQSxDQUFDQTtBQUZlLHFCQUFhLGdCQUU1QixDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtFeGNlcHRpb25IYW5kbGVyfSBmcm9tICcuL2V4Y2VwdGlvbl9oYW5kbGVyJztcblxuZXhwb3J0IHtFeGNlcHRpb25IYW5kbGVyfSBmcm9tICcuL2V4Y2VwdGlvbl9oYW5kbGVyJztcblxuZXhwb3J0IGNsYXNzIEJhc2VFeGNlcHRpb24gZXh0ZW5kcyBFcnJvciB7XG4gIHB1YmxpYyBzdGFjazogYW55O1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgbWVzc2FnZTogc3RyaW5nID0gXCItLVwiKSB7XG4gICAgc3VwZXIobWVzc2FnZSk7XG4gICAgdGhpcy5zdGFjayA9ICg8YW55Pm5ldyBFcnJvcihtZXNzYWdlKSkuc3RhY2s7XG4gIH1cblxuICB0b1N0cmluZygpOiBzdHJpbmcgeyByZXR1cm4gdGhpcy5tZXNzYWdlOyB9XG59XG5cbmV4cG9ydCBjbGFzcyBXcmFwcGVkRXhjZXB0aW9uIGV4dGVuZHMgRXJyb3Ige1xuICBwcml2YXRlIF93cmFwcGVyU3RhY2s6IGFueTtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIF93cmFwcGVyTWVzc2FnZTogc3RyaW5nLCBwcml2YXRlIF9vcmlnaW5hbEV4Y2VwdGlvbiwgcHJpdmF0ZSBfb3JpZ2luYWxTdGFjaz8sXG4gICAgICAgICAgICAgIHByaXZhdGUgX2NvbnRleHQ/KSB7XG4gICAgc3VwZXIoX3dyYXBwZXJNZXNzYWdlKTtcbiAgICB0aGlzLl93cmFwcGVyU3RhY2sgPSAoPGFueT5uZXcgRXJyb3IoX3dyYXBwZXJNZXNzYWdlKSkuc3RhY2s7XG4gIH1cblxuICBnZXQgd3JhcHBlck1lc3NhZ2UoKTogc3RyaW5nIHsgcmV0dXJuIHRoaXMuX3dyYXBwZXJNZXNzYWdlOyB9XG5cbiAgZ2V0IHdyYXBwZXJTdGFjaygpOiBhbnkgeyByZXR1cm4gdGhpcy5fd3JhcHBlclN0YWNrOyB9XG5cblxuICBnZXQgb3JpZ2luYWxFeGNlcHRpb24oKTogYW55IHsgcmV0dXJuIHRoaXMuX29yaWdpbmFsRXhjZXB0aW9uOyB9XG5cbiAgZ2V0IG9yaWdpbmFsU3RhY2soKTogYW55IHsgcmV0dXJuIHRoaXMuX29yaWdpbmFsU3RhY2s7IH1cblxuXG4gIGdldCBjb250ZXh0KCk6IGFueSB7IHJldHVybiB0aGlzLl9jb250ZXh0OyB9XG5cbiAgZ2V0IG1lc3NhZ2UoKTogc3RyaW5nIHsgcmV0dXJuIEV4Y2VwdGlvbkhhbmRsZXIuZXhjZXB0aW9uVG9TdHJpbmcodGhpcyk7IH1cblxuICB0b1N0cmluZygpOiBzdHJpbmcgeyByZXR1cm4gdGhpcy5tZXNzYWdlOyB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtYWtlVHlwZUVycm9yKG1lc3NhZ2U/OiBzdHJpbmcpOiBFcnJvciB7XG4gIHJldHVybiBuZXcgVHlwZUVycm9yKG1lc3NhZ2UpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdW5pbXBsZW1lbnRlZCgpOiBhbnkge1xuICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbigndW5pbXBsZW1lbnRlZCcpO1xufVxuIl19