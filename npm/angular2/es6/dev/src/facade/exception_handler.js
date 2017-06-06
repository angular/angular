import { isPresent, isBlank } from 'angular2/src/facade/lang';
import { BaseWrappedException } from 'angular2/src/facade/base_wrapped_exception';
import { isListLikeIterable } from 'angular2/src/facade/collection';
class _ArrayLogger {
    constructor() {
        this.res = [];
    }
    log(s) { this.res.push(s); }
    logError(s) { this.res.push(s); }
    logGroup(s) { this.res.push(s); }
    logGroupEnd() { }
    ;
}
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
export class ExceptionHandler {
    constructor(_logger, _rethrowException = true) {
        this._logger = _logger;
        this._rethrowException = _rethrowException;
    }
    static exceptionToString(exception, stackTrace = null, reason = null) {
        var l = new _ArrayLogger();
        var e = new ExceptionHandler(l, false);
        e.call(exception, stackTrace, reason);
        return l.res.join("\n");
    }
    call(exception, stackTrace = null, reason = null) {
        var originalException = this._findOriginalException(exception);
        var originalStack = this._findOriginalStack(exception);
        var context = this._findContext(exception);
        this._logger.logGroup(`EXCEPTION: ${this._extractMessage(exception)}`);
        if (isPresent(stackTrace) && isBlank(originalStack)) {
            this._logger.logError("STACKTRACE:");
            this._logger.logError(this._longStackTrace(stackTrace));
        }
        if (isPresent(reason)) {
            this._logger.logError(`REASON: ${reason}`);
        }
        if (isPresent(originalException)) {
            this._logger.logError(`ORIGINAL EXCEPTION: ${this._extractMessage(originalException)}`);
        }
        if (isPresent(originalStack)) {
            this._logger.logError("ORIGINAL STACKTRACE:");
            this._logger.logError(this._longStackTrace(originalStack));
        }
        if (isPresent(context)) {
            this._logger.logError("ERROR CONTEXT:");
            this._logger.logError(context);
        }
        this._logger.logGroupEnd();
        // We rethrow exceptions, so operations like 'bootstrap' will result in an error
        // when an exception happens. If we do not rethrow, bootstrap will always succeed.
        if (this._rethrowException)
            throw exception;
    }
    /** @internal */
    _extractMessage(exception) {
        return exception instanceof BaseWrappedException ? exception.wrapperMessage :
            exception.toString();
    }
    /** @internal */
    _longStackTrace(stackTrace) {
        return isListLikeIterable(stackTrace) ? stackTrace.join("\n\n-----async gap-----\n") :
            stackTrace.toString();
    }
    /** @internal */
    _findContext(exception) {
        try {
            if (!(exception instanceof BaseWrappedException))
                return null;
            return isPresent(exception.context) ? exception.context :
                this._findContext(exception.originalException);
        }
        catch (e) {
            // exception.context can throw an exception. if it happens, we ignore the context.
            return null;
        }
    }
    /** @internal */
    _findOriginalException(exception) {
        if (!(exception instanceof BaseWrappedException))
            return null;
        var e = exception.originalException;
        while (e instanceof BaseWrappedException && isPresent(e.originalException)) {
            e = e.originalException;
        }
        return e;
    }
    /** @internal */
    _findOriginalStack(exception) {
        if (!(exception instanceof BaseWrappedException))
            return null;
        var e = exception;
        var stack = exception.originalStack;
        while (e instanceof BaseWrappedException && isPresent(e.originalException)) {
            e = e.originalException;
            if (e instanceof BaseWrappedException && isPresent(e.originalException)) {
                stack = e.originalStack;
            }
        }
        return stack;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXhjZXB0aW9uX2hhbmRsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJkaWZmaW5nX3BsdWdpbl93cmFwcGVyLW91dHB1dF9wYXRoLWd0TTdRaEVuLnRtcC9hbmd1bGFyMi9zcmMvZmFjYWRlL2V4Y2VwdGlvbl9oYW5kbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJPQUFPLEVBQUMsU0FBUyxFQUFFLE9BQU8sRUFBUSxNQUFNLDBCQUEwQjtPQUMzRCxFQUFDLG9CQUFvQixFQUFDLE1BQU0sNENBQTRDO09BQ3hFLEVBQWMsa0JBQWtCLEVBQUMsTUFBTSxnQ0FBZ0M7QUFFOUU7SUFBQTtRQUNFLFFBQUcsR0FBVSxFQUFFLENBQUM7SUFLbEIsQ0FBQztJQUpDLEdBQUcsQ0FBQyxDQUFNLElBQVUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ3ZDLFFBQVEsQ0FBQyxDQUFNLElBQVUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzVDLFFBQVEsQ0FBQyxDQUFNLElBQVUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzVDLFdBQVcsS0FBRyxDQUFDOztBQUNqQixDQUFDO0FBRUQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBb0JHO0FBQ0g7SUFDRSxZQUFvQixPQUFZLEVBQVUsaUJBQWlCLEdBQVksSUFBSTtRQUF2RCxZQUFPLEdBQVAsT0FBTyxDQUFLO1FBQVUsc0JBQWlCLEdBQWpCLGlCQUFpQixDQUFnQjtJQUFHLENBQUM7SUFFL0UsT0FBTyxpQkFBaUIsQ0FBQyxTQUFjLEVBQUUsVUFBVSxHQUFRLElBQUksRUFBRSxNQUFNLEdBQVcsSUFBSTtRQUNwRixJQUFJLENBQUMsR0FBRyxJQUFJLFlBQVksRUFBRSxDQUFDO1FBQzNCLElBQUksQ0FBQyxHQUFHLElBQUksZ0JBQWdCLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQ3ZDLENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLFVBQVUsRUFBRSxNQUFNLENBQUMsQ0FBQztRQUN0QyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDMUIsQ0FBQztJQUVELElBQUksQ0FBQyxTQUFjLEVBQUUsVUFBVSxHQUFRLElBQUksRUFBRSxNQUFNLEdBQVcsSUFBSTtRQUNoRSxJQUFJLGlCQUFpQixHQUFHLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUMvRCxJQUFJLGFBQWEsR0FBRyxJQUFJLENBQUMsa0JBQWtCLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDdkQsSUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUUzQyxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxjQUFjLElBQUksQ0FBQyxlQUFlLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBRXZFLEVBQUUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsSUFBSSxPQUFPLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3BELElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1lBQ3JDLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztRQUMxRCxDQUFDO1FBRUQsRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN0QixJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxXQUFXLE1BQU0sRUFBRSxDQUFDLENBQUM7UUFDN0MsQ0FBQztRQUVELEVBQUUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNqQyxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyx1QkFBdUIsSUFBSSxDQUFDLGVBQWUsQ0FBQyxpQkFBaUIsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUMxRixDQUFDO1FBRUQsRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUM3QixJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO1lBQzlDLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQztRQUM3RCxDQUFDO1FBRUQsRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN2QixJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1lBQ3hDLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ2pDLENBQUM7UUFFRCxJQUFJLENBQUMsT0FBTyxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBRTNCLGdGQUFnRjtRQUNoRixrRkFBa0Y7UUFDbEYsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDO1lBQUMsTUFBTSxTQUFTLENBQUM7SUFDOUMsQ0FBQztJQUVELGdCQUFnQjtJQUNoQixlQUFlLENBQUMsU0FBYztRQUM1QixNQUFNLENBQUMsU0FBUyxZQUFZLG9CQUFvQixHQUFHLFNBQVMsQ0FBQyxjQUFjO1lBQ3hCLFNBQVMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztJQUMxRSxDQUFDO0lBRUQsZ0JBQWdCO0lBQ2hCLGVBQWUsQ0FBQyxVQUFlO1FBQzdCLE1BQU0sQ0FBQyxrQkFBa0IsQ0FBQyxVQUFVLENBQUMsR0FBVyxVQUFXLENBQUMsSUFBSSxDQUFDLDJCQUEyQixDQUFDO1lBQ3JELFVBQVUsQ0FBQyxRQUFRLEVBQUUsQ0FBQztJQUNoRSxDQUFDO0lBRUQsZ0JBQWdCO0lBQ2hCLFlBQVksQ0FBQyxTQUFjO1FBQ3pCLElBQUksQ0FBQztZQUNILEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLFlBQVksb0JBQW9CLENBQUMsQ0FBQztnQkFBQyxNQUFNLENBQUMsSUFBSSxDQUFDO1lBQzlELE1BQU0sQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxHQUFHLFNBQVMsQ0FBQyxPQUFPO2dCQUNqQixJQUFJLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1FBQ3ZGLENBQUU7UUFBQSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ1gsa0ZBQWtGO1lBQ2xGLE1BQU0sQ0FBQyxJQUFJLENBQUM7UUFDZCxDQUFDO0lBQ0gsQ0FBQztJQUVELGdCQUFnQjtJQUNoQixzQkFBc0IsQ0FBQyxTQUFjO1FBQ25DLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLFlBQVksb0JBQW9CLENBQUMsQ0FBQztZQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUM7UUFFOUQsSUFBSSxDQUFDLEdBQUcsU0FBUyxDQUFDLGlCQUFpQixDQUFDO1FBQ3BDLE9BQU8sQ0FBQyxZQUFZLG9CQUFvQixJQUFJLFNBQVMsQ0FBQyxDQUFDLENBQUMsaUJBQWlCLENBQUMsRUFBRSxDQUFDO1lBQzNFLENBQUMsR0FBRyxDQUFDLENBQUMsaUJBQWlCLENBQUM7UUFDMUIsQ0FBQztRQUVELE1BQU0sQ0FBQyxDQUFDLENBQUM7SUFDWCxDQUFDO0lBRUQsZ0JBQWdCO0lBQ2hCLGtCQUFrQixDQUFDLFNBQWM7UUFDL0IsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsWUFBWSxvQkFBb0IsQ0FBQyxDQUFDO1lBQUMsTUFBTSxDQUFDLElBQUksQ0FBQztRQUU5RCxJQUFJLENBQUMsR0FBRyxTQUFTLENBQUM7UUFDbEIsSUFBSSxLQUFLLEdBQUcsU0FBUyxDQUFDLGFBQWEsQ0FBQztRQUNwQyxPQUFPLENBQUMsWUFBWSxvQkFBb0IsSUFBSSxTQUFTLENBQUMsQ0FBQyxDQUFDLGlCQUFpQixDQUFDLEVBQUUsQ0FBQztZQUMzRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLGlCQUFpQixDQUFDO1lBQ3hCLEVBQUUsQ0FBQyxDQUFDLENBQUMsWUFBWSxvQkFBb0IsSUFBSSxTQUFTLENBQUMsQ0FBQyxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUN4RSxLQUFLLEdBQUcsQ0FBQyxDQUFDLGFBQWEsQ0FBQztZQUMxQixDQUFDO1FBQ0gsQ0FBQztRQUVELE1BQU0sQ0FBQyxLQUFLLENBQUM7SUFDZixDQUFDO0FBQ0gsQ0FBQztBQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtpc1ByZXNlbnQsIGlzQmxhbmssIHByaW50fSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHtCYXNlV3JhcHBlZEV4Y2VwdGlvbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9iYXNlX3dyYXBwZWRfZXhjZXB0aW9uJztcbmltcG9ydCB7TGlzdFdyYXBwZXIsIGlzTGlzdExpa2VJdGVyYWJsZX0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9jb2xsZWN0aW9uJztcblxuY2xhc3MgX0FycmF5TG9nZ2VyIHtcbiAgcmVzOiBhbnlbXSA9IFtdO1xuICBsb2coczogYW55KTogdm9pZCB7IHRoaXMucmVzLnB1c2gocyk7IH1cbiAgbG9nRXJyb3IoczogYW55KTogdm9pZCB7IHRoaXMucmVzLnB1c2gocyk7IH1cbiAgbG9nR3JvdXAoczogYW55KTogdm9pZCB7IHRoaXMucmVzLnB1c2gocyk7IH1cbiAgbG9nR3JvdXBFbmQoKXt9O1xufVxuXG4vKipcbiAqIFByb3ZpZGVzIGEgaG9vayBmb3IgY2VudHJhbGl6ZWQgZXhjZXB0aW9uIGhhbmRsaW5nLlxuICpcbiAqIFRoZSBkZWZhdWx0IGltcGxlbWVudGF0aW9uIG9mIGBFeGNlcHRpb25IYW5kbGVyYCBwcmludHMgZXJyb3IgbWVzc2FnZXMgdG8gdGhlIGBDb25zb2xlYC4gVG9cbiAqIGludGVyY2VwdCBlcnJvciBoYW5kbGluZyxcbiAqIHdyaXRlIGEgY3VzdG9tIGV4Y2VwdGlvbiBoYW5kbGVyIHRoYXQgcmVwbGFjZXMgdGhpcyBkZWZhdWx0IGFzIGFwcHJvcHJpYXRlIGZvciB5b3VyIGFwcC5cbiAqXG4gKiAjIyMgRXhhbXBsZVxuICpcbiAqIGBgYGphdmFzY3JpcHRcbiAqXG4gKiBjbGFzcyBNeUV4Y2VwdGlvbkhhbmRsZXIgaW1wbGVtZW50cyBFeGNlcHRpb25IYW5kbGVyIHtcbiAqICAgY2FsbChlcnJvciwgc3RhY2tUcmFjZSA9IG51bGwsIHJlYXNvbiA9IG51bGwpIHtcbiAqICAgICAvLyBkbyBzb21ldGhpbmcgd2l0aCB0aGUgZXhjZXB0aW9uXG4gKiAgIH1cbiAqIH1cbiAqXG4gKiBib290c3RyYXAoTXlBcHAsIFtwcm92aWRlKEV4Y2VwdGlvbkhhbmRsZXIsIHt1c2VDbGFzczogTXlFeGNlcHRpb25IYW5kbGVyfSldKVxuICpcbiAqIGBgYFxuICovXG5leHBvcnQgY2xhc3MgRXhjZXB0aW9uSGFuZGxlciB7XG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgX2xvZ2dlcjogYW55LCBwcml2YXRlIF9yZXRocm93RXhjZXB0aW9uOiBib29sZWFuID0gdHJ1ZSkge31cblxuICBzdGF0aWMgZXhjZXB0aW9uVG9TdHJpbmcoZXhjZXB0aW9uOiBhbnksIHN0YWNrVHJhY2U6IGFueSA9IG51bGwsIHJlYXNvbjogc3RyaW5nID0gbnVsbCk6IHN0cmluZyB7XG4gICAgdmFyIGwgPSBuZXcgX0FycmF5TG9nZ2VyKCk7XG4gICAgdmFyIGUgPSBuZXcgRXhjZXB0aW9uSGFuZGxlcihsLCBmYWxzZSk7XG4gICAgZS5jYWxsKGV4Y2VwdGlvbiwgc3RhY2tUcmFjZSwgcmVhc29uKTtcbiAgICByZXR1cm4gbC5yZXMuam9pbihcIlxcblwiKTtcbiAgfVxuXG4gIGNhbGwoZXhjZXB0aW9uOiBhbnksIHN0YWNrVHJhY2U6IGFueSA9IG51bGwsIHJlYXNvbjogc3RyaW5nID0gbnVsbCk6IHZvaWQge1xuICAgIHZhciBvcmlnaW5hbEV4Y2VwdGlvbiA9IHRoaXMuX2ZpbmRPcmlnaW5hbEV4Y2VwdGlvbihleGNlcHRpb24pO1xuICAgIHZhciBvcmlnaW5hbFN0YWNrID0gdGhpcy5fZmluZE9yaWdpbmFsU3RhY2soZXhjZXB0aW9uKTtcbiAgICB2YXIgY29udGV4dCA9IHRoaXMuX2ZpbmRDb250ZXh0KGV4Y2VwdGlvbik7XG5cbiAgICB0aGlzLl9sb2dnZXIubG9nR3JvdXAoYEVYQ0VQVElPTjogJHt0aGlzLl9leHRyYWN0TWVzc2FnZShleGNlcHRpb24pfWApO1xuXG4gICAgaWYgKGlzUHJlc2VudChzdGFja1RyYWNlKSAmJiBpc0JsYW5rKG9yaWdpbmFsU3RhY2spKSB7XG4gICAgICB0aGlzLl9sb2dnZXIubG9nRXJyb3IoXCJTVEFDS1RSQUNFOlwiKTtcbiAgICAgIHRoaXMuX2xvZ2dlci5sb2dFcnJvcih0aGlzLl9sb25nU3RhY2tUcmFjZShzdGFja1RyYWNlKSk7XG4gICAgfVxuXG4gICAgaWYgKGlzUHJlc2VudChyZWFzb24pKSB7XG4gICAgICB0aGlzLl9sb2dnZXIubG9nRXJyb3IoYFJFQVNPTjogJHtyZWFzb259YCk7XG4gICAgfVxuXG4gICAgaWYgKGlzUHJlc2VudChvcmlnaW5hbEV4Y2VwdGlvbikpIHtcbiAgICAgIHRoaXMuX2xvZ2dlci5sb2dFcnJvcihgT1JJR0lOQUwgRVhDRVBUSU9OOiAke3RoaXMuX2V4dHJhY3RNZXNzYWdlKG9yaWdpbmFsRXhjZXB0aW9uKX1gKTtcbiAgICB9XG5cbiAgICBpZiAoaXNQcmVzZW50KG9yaWdpbmFsU3RhY2spKSB7XG4gICAgICB0aGlzLl9sb2dnZXIubG9nRXJyb3IoXCJPUklHSU5BTCBTVEFDS1RSQUNFOlwiKTtcbiAgICAgIHRoaXMuX2xvZ2dlci5sb2dFcnJvcih0aGlzLl9sb25nU3RhY2tUcmFjZShvcmlnaW5hbFN0YWNrKSk7XG4gICAgfVxuXG4gICAgaWYgKGlzUHJlc2VudChjb250ZXh0KSkge1xuICAgICAgdGhpcy5fbG9nZ2VyLmxvZ0Vycm9yKFwiRVJST1IgQ09OVEVYVDpcIik7XG4gICAgICB0aGlzLl9sb2dnZXIubG9nRXJyb3IoY29udGV4dCk7XG4gICAgfVxuXG4gICAgdGhpcy5fbG9nZ2VyLmxvZ0dyb3VwRW5kKCk7XG5cbiAgICAvLyBXZSByZXRocm93IGV4Y2VwdGlvbnMsIHNvIG9wZXJhdGlvbnMgbGlrZSAnYm9vdHN0cmFwJyB3aWxsIHJlc3VsdCBpbiBhbiBlcnJvclxuICAgIC8vIHdoZW4gYW4gZXhjZXB0aW9uIGhhcHBlbnMuIElmIHdlIGRvIG5vdCByZXRocm93LCBib290c3RyYXAgd2lsbCBhbHdheXMgc3VjY2VlZC5cbiAgICBpZiAodGhpcy5fcmV0aHJvd0V4Y2VwdGlvbikgdGhyb3cgZXhjZXB0aW9uO1xuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfZXh0cmFjdE1lc3NhZ2UoZXhjZXB0aW9uOiBhbnkpOiBzdHJpbmcge1xuICAgIHJldHVybiBleGNlcHRpb24gaW5zdGFuY2VvZiBCYXNlV3JhcHBlZEV4Y2VwdGlvbiA/IGV4Y2VwdGlvbi53cmFwcGVyTWVzc2FnZSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXhjZXB0aW9uLnRvU3RyaW5nKCk7XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9sb25nU3RhY2tUcmFjZShzdGFja1RyYWNlOiBhbnkpOiBhbnkge1xuICAgIHJldHVybiBpc0xpc3RMaWtlSXRlcmFibGUoc3RhY2tUcmFjZSkgPyAoPGFueVtdPnN0YWNrVHJhY2UpLmpvaW4oXCJcXG5cXG4tLS0tLWFzeW5jIGdhcC0tLS0tXFxuXCIpIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhY2tUcmFjZS50b1N0cmluZygpO1xuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfZmluZENvbnRleHQoZXhjZXB0aW9uOiBhbnkpOiBhbnkge1xuICAgIHRyeSB7XG4gICAgICBpZiAoIShleGNlcHRpb24gaW5zdGFuY2VvZiBCYXNlV3JhcHBlZEV4Y2VwdGlvbikpIHJldHVybiBudWxsO1xuICAgICAgcmV0dXJuIGlzUHJlc2VudChleGNlcHRpb24uY29udGV4dCkgPyBleGNlcHRpb24uY29udGV4dCA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2ZpbmRDb250ZXh0KGV4Y2VwdGlvbi5vcmlnaW5hbEV4Y2VwdGlvbik7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgLy8gZXhjZXB0aW9uLmNvbnRleHQgY2FuIHRocm93IGFuIGV4Y2VwdGlvbi4gaWYgaXQgaGFwcGVucywgd2UgaWdub3JlIHRoZSBjb250ZXh0LlxuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfZmluZE9yaWdpbmFsRXhjZXB0aW9uKGV4Y2VwdGlvbjogYW55KTogYW55IHtcbiAgICBpZiAoIShleGNlcHRpb24gaW5zdGFuY2VvZiBCYXNlV3JhcHBlZEV4Y2VwdGlvbikpIHJldHVybiBudWxsO1xuXG4gICAgdmFyIGUgPSBleGNlcHRpb24ub3JpZ2luYWxFeGNlcHRpb247XG4gICAgd2hpbGUgKGUgaW5zdGFuY2VvZiBCYXNlV3JhcHBlZEV4Y2VwdGlvbiAmJiBpc1ByZXNlbnQoZS5vcmlnaW5hbEV4Y2VwdGlvbikpIHtcbiAgICAgIGUgPSBlLm9yaWdpbmFsRXhjZXB0aW9uO1xuICAgIH1cblxuICAgIHJldHVybiBlO1xuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfZmluZE9yaWdpbmFsU3RhY2soZXhjZXB0aW9uOiBhbnkpOiBhbnkge1xuICAgIGlmICghKGV4Y2VwdGlvbiBpbnN0YW5jZW9mIEJhc2VXcmFwcGVkRXhjZXB0aW9uKSkgcmV0dXJuIG51bGw7XG5cbiAgICB2YXIgZSA9IGV4Y2VwdGlvbjtcbiAgICB2YXIgc3RhY2sgPSBleGNlcHRpb24ub3JpZ2luYWxTdGFjaztcbiAgICB3aGlsZSAoZSBpbnN0YW5jZW9mIEJhc2VXcmFwcGVkRXhjZXB0aW9uICYmIGlzUHJlc2VudChlLm9yaWdpbmFsRXhjZXB0aW9uKSkge1xuICAgICAgZSA9IGUub3JpZ2luYWxFeGNlcHRpb247XG4gICAgICBpZiAoZSBpbnN0YW5jZW9mIEJhc2VXcmFwcGVkRXhjZXB0aW9uICYmIGlzUHJlc2VudChlLm9yaWdpbmFsRXhjZXB0aW9uKSkge1xuICAgICAgICBzdGFjayA9IGUub3JpZ2luYWxTdGFjaztcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gc3RhY2s7XG4gIH1cbn1cbiJdfQ==