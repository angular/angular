'use strict';"use strict";
var lang_1 = require('angular2/src/facade/lang');
var base_wrapped_exception_1 = require('angular2/src/facade/base_wrapped_exception');
var collection_1 = require('angular2/src/facade/collection');
var _ArrayLogger = (function () {
    function _ArrayLogger() {
        this.res = [];
    }
    _ArrayLogger.prototype.log = function (s) { this.res.push(s); };
    _ArrayLogger.prototype.logError = function (s) { this.res.push(s); };
    _ArrayLogger.prototype.logGroup = function (s) { this.res.push(s); };
    _ArrayLogger.prototype.logGroupEnd = function () { };
    ;
    return _ArrayLogger;
}());
/**
 * Provides a hook for centralized exception handling.
 *
 * The default implementation of `ExceptionHandler` prints error messages to the `Console`. To
 * intercept error handling,
 * write a custom exception handler that replaces this default as appropriate for your app.
 *
 * ### Example
 *
 * ```javascript
 *
 * class MyExceptionHandler implements ExceptionHandler {
 *   call(error, stackTrace = null, reason = null) {
 *     // do something with the exception
 *   }
 * }
 *
 * bootstrap(MyApp, [provide(ExceptionHandler, {useClass: MyExceptionHandler})])
 *
 * ```
 */
var ExceptionHandler = (function () {
    function ExceptionHandler(_logger, _rethrowException) {
        if (_rethrowException === void 0) { _rethrowException = true; }
        this._logger = _logger;
        this._rethrowException = _rethrowException;
    }
    ExceptionHandler.exceptionToString = function (exception, stackTrace, reason) {
        if (stackTrace === void 0) { stackTrace = null; }
        if (reason === void 0) { reason = null; }
        var l = new _ArrayLogger();
        var e = new ExceptionHandler(l, false);
        e.call(exception, stackTrace, reason);
        return l.res.join("\n");
    };
    ExceptionHandler.prototype.call = function (exception, stackTrace, reason) {
        if (stackTrace === void 0) { stackTrace = null; }
        if (reason === void 0) { reason = null; }
        var originalException = this._findOriginalException(exception);
        var originalStack = this._findOriginalStack(exception);
        var context = this._findContext(exception);
        this._logger.logGroup("EXCEPTION: " + this._extractMessage(exception));
        if (lang_1.isPresent(stackTrace) && lang_1.isBlank(originalStack)) {
            this._logger.logError("STACKTRACE:");
            this._logger.logError(this._longStackTrace(stackTrace));
        }
        if (lang_1.isPresent(reason)) {
            this._logger.logError("REASON: " + reason);
        }
        if (lang_1.isPresent(originalException)) {
            this._logger.logError("ORIGINAL EXCEPTION: " + this._extractMessage(originalException));
        }
        if (lang_1.isPresent(originalStack)) {
            this._logger.logError("ORIGINAL STACKTRACE:");
            this._logger.logError(this._longStackTrace(originalStack));
        }
        if (lang_1.isPresent(context)) {
            this._logger.logError("ERROR CONTEXT:");
            this._logger.logError(context);
        }
        this._logger.logGroupEnd();
        // We rethrow exceptions, so operations like 'bootstrap' will result in an error
        // when an exception happens. If we do not rethrow, bootstrap will always succeed.
        if (this._rethrowException)
            throw exception;
    };
    /** @internal */
    ExceptionHandler.prototype._extractMessage = function (exception) {
        return exception instanceof base_wrapped_exception_1.BaseWrappedException ? exception.wrapperMessage :
            exception.toString();
    };
    /** @internal */
    ExceptionHandler.prototype._longStackTrace = function (stackTrace) {
        return collection_1.isListLikeIterable(stackTrace) ? stackTrace.join("\n\n-----async gap-----\n") :
            stackTrace.toString();
    };
    /** @internal */
    ExceptionHandler.prototype._findContext = function (exception) {
        try {
            if (!(exception instanceof base_wrapped_exception_1.BaseWrappedException))
                return null;
            return lang_1.isPresent(exception.context) ? exception.context :
                this._findContext(exception.originalException);
        }
        catch (e) {
            // exception.context can throw an exception. if it happens, we ignore the context.
            return null;
        }
    };
    /** @internal */
    ExceptionHandler.prototype._findOriginalException = function (exception) {
        if (!(exception instanceof base_wrapped_exception_1.BaseWrappedException))
            return null;
        var e = exception.originalException;
        while (e instanceof base_wrapped_exception_1.BaseWrappedException && lang_1.isPresent(e.originalException)) {
            e = e.originalException;
        }
        return e;
    };
    /** @internal */
    ExceptionHandler.prototype._findOriginalStack = function (exception) {
        if (!(exception instanceof base_wrapped_exception_1.BaseWrappedException))
            return null;
        var e = exception;
        var stack = exception.originalStack;
        while (e instanceof base_wrapped_exception_1.BaseWrappedException && lang_1.isPresent(e.originalException)) {
            e = e.originalException;
            if (e instanceof base_wrapped_exception_1.BaseWrappedException && lang_1.isPresent(e.originalException)) {
                stack = e.originalStack;
            }
        }
        return stack;
    };
    return ExceptionHandler;
}());
exports.ExceptionHandler = ExceptionHandler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXhjZXB0aW9uX2hhbmRsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJkaWZmaW5nX3BsdWdpbl93cmFwcGVyLW91dHB1dF9wYXRoLXI1UHJKSzloLnRtcC9hbmd1bGFyMi9zcmMvZmFjYWRlL2V4Y2VwdGlvbl9oYW5kbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxxQkFBd0MsMEJBQTBCLENBQUMsQ0FBQTtBQUNuRSx1Q0FBbUMsNENBQTRDLENBQUMsQ0FBQTtBQUNoRiwyQkFBOEMsZ0NBQWdDLENBQUMsQ0FBQTtBQUUvRTtJQUFBO1FBQ0UsUUFBRyxHQUFVLEVBQUUsQ0FBQztJQUtsQixDQUFDO0lBSkMsMEJBQUcsR0FBSCxVQUFJLENBQU0sSUFBVSxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDdkMsK0JBQVEsR0FBUixVQUFTLENBQU0sSUFBVSxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDNUMsK0JBQVEsR0FBUixVQUFTLENBQU0sSUFBVSxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDNUMsa0NBQVcsR0FBWCxjQUFjLENBQUM7O0lBQ2pCLG1CQUFDO0FBQUQsQ0FBQyxBQU5ELElBTUM7QUFFRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FvQkc7QUFDSDtJQUNFLDBCQUFvQixPQUFZLEVBQVUsaUJBQWlDO1FBQXpDLGlDQUF5QyxHQUF6Qyx3QkFBeUM7UUFBdkQsWUFBTyxHQUFQLE9BQU8sQ0FBSztRQUFVLHNCQUFpQixHQUFqQixpQkFBaUIsQ0FBZ0I7SUFBRyxDQUFDO0lBRXhFLGtDQUFpQixHQUF4QixVQUF5QixTQUFjLEVBQUUsVUFBc0IsRUFBRSxNQUFxQjtRQUE3QywwQkFBc0IsR0FBdEIsaUJBQXNCO1FBQUUsc0JBQXFCLEdBQXJCLGFBQXFC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QUFJLENBQUM7UUFFOUQsSUFBSSxDQUFDLEdBQUcsU0FBUyxDQUFDO1FBQ2xCLElBQUksS0FBSyxHQUFHLFNBQVMsQ0FBQyxhQUFhLENBQUM7UUFDcEMsT0FBTyxDQUFDLFlBQVksNkNBQW9CLElBQUksZ0JBQVMsQ0FBQyxDQUFDLENBQUMsaUJBQWlCLENBQUMsRUFBRSxDQUFDO1lBQzNFLENBQUMsR0FBRyxDQUFDLENBQUMsaUJBQWlCLENBQUM7WUFDeEIsRUFBRSxDQUFDLENBQUMsQ0FBQyxZQUFZLDZDQUFvQixJQUFJLGdCQUFTLENBQUMsQ0FBQyxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUN4RSxLQUFLLEdBQUcsQ0FBQyxDQUFDLGFBQWEsQ0FBQztZQUMxQixDQUFDO1FBQ0gsQ0FBQztRQUVELE1BQU0sQ0FBQyxLQUFLLENBQUM7SUFDZixDQUFDO0lBQ0gsdUJBQUM7QUFBRCxDQUFDLEFBbEdELElBa0dDO0FBbEdZLHdCQUFnQixtQkFrRzVCLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge2lzUHJlc2VudCwgaXNCbGFuaywgcHJpbnR9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge0Jhc2VXcmFwcGVkRXhjZXB0aW9ufSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2Jhc2Vfd3JhcHBlZF9leGNlcHRpb24nO1xuaW1wb3J0IHtMaXN0V3JhcHBlciwgaXNMaXN0TGlrZUl0ZXJhYmxlfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2NvbGxlY3Rpb24nO1xuXG5jbGFzcyBfQXJyYXlMb2dnZXIge1xuICByZXM6IGFueVtdID0gW107XG4gIGxvZyhzOiBhbnkpOiB2b2lkIHsgdGhpcy5yZXMucHVzaChzKTsgfVxuICBsb2dFcnJvcihzOiBhbnkpOiB2b2lkIHsgdGhpcy5yZXMucHVzaChzKTsgfVxuICBsb2dHcm91cChzOiBhbnkpOiB2b2lkIHsgdGhpcy5yZXMucHVzaChzKTsgfVxuICBsb2dHcm91cEVuZCgpe307XG59XG5cbi8qKlxuICogUHJvdmlkZXMgYSBob29rIGZvciBjZW50cmFsaXplZCBleGNlcHRpb24gaGFuZGxpbmcuXG4gKlxuICogVGhlIGRlZmF1bHQgaW1wbGVtZW50YXRpb24gb2YgYEV4Y2VwdGlvbkhhbmRsZXJgIHByaW50cyBlcnJvciBtZXNzYWdlcyB0byB0aGUgYENvbnNvbGVgLiBUb1xuICogaW50ZXJjZXB0IGVycm9yIGhhbmRsaW5nLFxuICogd3JpdGUgYSBjdXN0b20gZXhjZXB0aW9uIGhhbmRsZXIgdGhhdCByZXBsYWNlcyB0aGlzIGRlZmF1bHQgYXMgYXBwcm9wcmlhdGUgZm9yIHlvdXIgYXBwLlxuICpcbiAqICMjIyBFeGFtcGxlXG4gKlxuICogYGBgamF2YXNjcmlwdFxuICpcbiAqIGNsYXNzIE15RXhjZXB0aW9uSGFuZGxlciBpbXBsZW1lbnRzIEV4Y2VwdGlvbkhhbmRsZXIge1xuICogICBjYWxsKGVycm9yLCBzdGFja1RyYWNlID0gbnVsbCwgcmVhc29uID0gbnVsbCkge1xuICogICAgIC8vIGRvIHNvbWV0aGluZyB3aXRoIHRoZSBleGNlcHRpb25cbiAqICAgfVxuICogfVxuICpcbiAqIGJvb3RzdHJhcChNeUFwcCwgW3Byb3ZpZGUoRXhjZXB0aW9uSGFuZGxlciwge3VzZUNsYXNzOiBNeUV4Y2VwdGlvbkhhbmRsZXJ9KV0pXG4gKlxuICogYGBgXG4gKi9cbmV4cG9ydCBjbGFzcyBFeGNlcHRpb25IYW5kbGVyIHtcbiAgY29uc3RydWN0b3IocHJpdmF0ZSBfbG9nZ2VyOiBhbnksIHByaXZhdGUgX3JldGhyb3dFeGNlcHRpb246IGJvb2xlYW4gPSB0cnVlKSB7fVxuXG4gIHN0YXRpYyBleGNlcHRpb25Ub1N0cmluZyhleGNlcHRpb246IGFueSwgc3RhY2tUcmFjZTogYW55ID0gbnVsbCwgcmVhc29uOiBzdHJpbmcgPSBudWxsKTogc3RyaW5nIHtcbiAgICB2YXIgbCA9IG5ldyBfQXJyYXlMb2dnZXIoKTtcbiAgICB2YXIgZSA9IG5ldyBFeGNlcHRpb25IYW5kbGVyKGwsIGZhbHNlKTtcbiAgICBlLmNhbGwoZXhjZXB0aW9uLCBzdGFja1RyYWNlLCByZWFzb24pO1xuICAgIHJldHVybiBsLnJlcy5qb2luKFwiXFxuXCIpO1xuICB9XG5cbiAgY2FsbChleGNlcHRpb246IGFueSwgc3RhY2tUcmFjZTogYW55ID0gbnVsbCwgcmVhc29uOiBzdHJpbmcgPSBudWxsKTogdm9pZCB7XG4gICAgdmFyIG9yaWdpbmFsRXhjZXB0aW9uID0gdGhpcy5fZmluZE9yaWdpbmFsRXhjZXB0aW9uKGV4Y2VwdGlvbik7XG4gICAgdmFyIG9yaWdpbmFsU3RhY2sgPSB0aGlzLl9maW5kT3JpZ2luYWxTdGFjayhleGNlcHRpb24pO1xuICAgIHZhciBjb250ZXh0ID0gdGhpcy5fZmluZENvbnRleHQoZXhjZXB0aW9uKTtcblxuICAgIHRoaXMuX2xvZ2dlci5sb2dHcm91cChgRVhDRVBUSU9OOiAke3RoaXMuX2V4dHJhY3RNZXNzYWdlKGV4Y2VwdGlvbil9YCk7XG5cbiAgICBpZiAoaXNQcmVzZW50KHN0YWNrVHJhY2UpICYmIGlzQmxhbmsob3JpZ2luYWxTdGFjaykpIHtcbiAgICAgIHRoaXMuX2xvZ2dlci5sb2dFcnJvcihcIlNUQUNLVFJBQ0U6XCIpO1xuICAgICAgdGhpcy5fbG9nZ2VyLmxvZ0Vycm9yKHRoaXMuX2xvbmdTdGFja1RyYWNlKHN0YWNrVHJhY2UpKTtcbiAgICB9XG5cbiAgICBpZiAoaXNQcmVzZW50KHJlYXNvbikpIHtcbiAgICAgIHRoaXMuX2xvZ2dlci5sb2dFcnJvcihgUkVBU09OOiAke3JlYXNvbn1gKTtcbiAgICB9XG5cbiAgICBpZiAoaXNQcmVzZW50KG9yaWdpbmFsRXhjZXB0aW9uKSkge1xuICAgICAgdGhpcy5fbG9nZ2VyLmxvZ0Vycm9yKGBPUklHSU5BTCBFWENFUFRJT046ICR7dGhpcy5fZXh0cmFjdE1lc3NhZ2Uob3JpZ2luYWxFeGNlcHRpb24pfWApO1xuICAgIH1cblxuICAgIGlmIChpc1ByZXNlbnQob3JpZ2luYWxTdGFjaykpIHtcbiAgICAgIHRoaXMuX2xvZ2dlci5sb2dFcnJvcihcIk9SSUdJTkFMIFNUQUNLVFJBQ0U6XCIpO1xuICAgICAgdGhpcy5fbG9nZ2VyLmxvZ0Vycm9yKHRoaXMuX2xvbmdTdGFja1RyYWNlKG9yaWdpbmFsU3RhY2spKTtcbiAgICB9XG5cbiAgICBpZiAoaXNQcmVzZW50KGNvbnRleHQpKSB7XG4gICAgICB0aGlzLl9sb2dnZXIubG9nRXJyb3IoXCJFUlJPUiBDT05URVhUOlwiKTtcbiAgICAgIHRoaXMuX2xvZ2dlci5sb2dFcnJvcihjb250ZXh0KTtcbiAgICB9XG5cbiAgICB0aGlzLl9sb2dnZXIubG9nR3JvdXBFbmQoKTtcblxuICAgIC8vIFdlIHJldGhyb3cgZXhjZXB0aW9ucywgc28gb3BlcmF0aW9ucyBsaWtlICdib290c3RyYXAnIHdpbGwgcmVzdWx0IGluIGFuIGVycm9yXG4gICAgLy8gd2hlbiBhbiBleGNlcHRpb24gaGFwcGVucy4gSWYgd2UgZG8gbm90IHJldGhyb3csIGJvb3RzdHJhcCB3aWxsIGFsd2F5cyBzdWNjZWVkLlxuICAgIGlmICh0aGlzLl9yZXRocm93RXhjZXB0aW9uKSB0aHJvdyBleGNlcHRpb247XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9leHRyYWN0TWVzc2FnZShleGNlcHRpb246IGFueSk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGV4Y2VwdGlvbiBpbnN0YW5jZW9mIEJhc2VXcmFwcGVkRXhjZXB0aW9uID8gZXhjZXB0aW9uLndyYXBwZXJNZXNzYWdlIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBleGNlcHRpb24udG9TdHJpbmcoKTtcbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX2xvbmdTdGFja1RyYWNlKHN0YWNrVHJhY2U6IGFueSk6IGFueSB7XG4gICAgcmV0dXJuIGlzTGlzdExpa2VJdGVyYWJsZShzdGFja1RyYWNlKSA/ICg8YW55W10+c3RhY2tUcmFjZSkuam9pbihcIlxcblxcbi0tLS0tYXN5bmMgZ2FwLS0tLS1cXG5cIikgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGFja1RyYWNlLnRvU3RyaW5nKCk7XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9maW5kQ29udGV4dChleGNlcHRpb246IGFueSk6IGFueSB7XG4gICAgdHJ5IHtcbiAgICAgIGlmICghKGV4Y2VwdGlvbiBpbnN0YW5jZW9mIEJhc2VXcmFwcGVkRXhjZXB0aW9uKSkgcmV0dXJuIG51bGw7XG4gICAgICByZXR1cm4gaXNQcmVzZW50KGV4Y2VwdGlvbi5jb250ZXh0KSA/IGV4Y2VwdGlvbi5jb250ZXh0IDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fZmluZENvbnRleHQoZXhjZXB0aW9uLm9yaWdpbmFsRXhjZXB0aW9uKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAvLyBleGNlcHRpb24uY29udGV4dCBjYW4gdGhyb3cgYW4gZXhjZXB0aW9uLiBpZiBpdCBoYXBwZW5zLCB3ZSBpZ25vcmUgdGhlIGNvbnRleHQuXG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9maW5kT3JpZ2luYWxFeGNlcHRpb24oZXhjZXB0aW9uOiBhbnkpOiBhbnkge1xuICAgIGlmICghKGV4Y2VwdGlvbiBpbnN0YW5jZW9mIEJhc2VXcmFwcGVkRXhjZXB0aW9uKSkgcmV0dXJuIG51bGw7XG5cbiAgICB2YXIgZSA9IGV4Y2VwdGlvbi5vcmlnaW5hbEV4Y2VwdGlvbjtcbiAgICB3aGlsZSAoZSBpbnN0YW5jZW9mIEJhc2VXcmFwcGVkRXhjZXB0aW9uICYmIGlzUHJlc2VudChlLm9yaWdpbmFsRXhjZXB0aW9uKSkge1xuICAgICAgZSA9IGUub3JpZ2luYWxFeGNlcHRpb247XG4gICAgfVxuXG4gICAgcmV0dXJuIGU7XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9maW5kT3JpZ2luYWxTdGFjayhleGNlcHRpb246IGFueSk6IGFueSB7XG4gICAgaWYgKCEoZXhjZXB0aW9uIGluc3RhbmNlb2YgQmFzZVdyYXBwZWRFeGNlcHRpb24pKSByZXR1cm4gbnVsbDtcblxuICAgIHZhciBlID0gZXhjZXB0aW9uO1xuICAgIHZhciBzdGFjayA9IGV4Y2VwdGlvbi5vcmlnaW5hbFN0YWNrO1xuICAgIHdoaWxlIChlIGluc3RhbmNlb2YgQmFzZVdyYXBwZWRFeGNlcHRpb24gJiYgaXNQcmVzZW50KGUub3JpZ2luYWxFeGNlcHRpb24pKSB7XG4gICAgICBlID0gZS5vcmlnaW5hbEV4Y2VwdGlvbjtcbiAgICAgIGlmIChlIGluc3RhbmNlb2YgQmFzZVdyYXBwZWRFeGNlcHRpb24gJiYgaXNQcmVzZW50KGUub3JpZ2luYWxFeGNlcHRpb24pKSB7XG4gICAgICAgIHN0YWNrID0gZS5vcmlnaW5hbFN0YWNrO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBzdGFjaztcbiAgfVxufVxuIl19