import {Injectable} from 'angular2/di';
import {isPresent, isBlank, print, BaseException} from 'angular2/src/core/facade/lang';
import {ListWrapper, isListLikeIterable} from 'angular2/src/core/facade/collection';

class _ArrayLogger {
  res: any[] = [];
  log(s: any): void { this.res.push(s); }
  logError(s: any): void { this.res.push(s); }
  logGroup(s: any): void { this.res.push(s); }
  logGroupEnd(){};
}

/**
 * Provides a hook for centralized exception handling.
 *
 * The default implementation of `ExceptionHandler` prints error messages to the `Console`. To
 * intercept error handling,
 * write a custom exception handler that replaces this default as appropriate for your app.
 *
 * # Example
 *
 * ```javascript
 *
 * class MyExceptionHandler implements ExceptionHandler {
 *   call(error, stackTrace = null, reason = null) {
 *     // do something with the exception
 *   }
 * }
 *
 * bootstrap(MyApp, [bind(ExceptionHandler).toClass(MyExceptionHandler)])
 *
 * ```
 */
@Injectable()
export class ExceptionHandler {
  constructor(private logger: any, private rethrowException: boolean = true) {}

  static exceptionToString(exception: any, stackTrace: any = null, reason: string = null): string {
    var l = new _ArrayLogger();
    var e = new ExceptionHandler(l, false);
    e.call(exception, stackTrace, reason);
    return l.res.join("\n");
  }

  call(exception: any, stackTrace: any = null, reason: string = null): void {
    var originalException = this._findOriginalException(exception);
    var originalStack = this._findOriginalStack(exception);
    var context = this._findContext(exception);

    this.logger.logGroup(`EXCEPTION: ${exception}`);

    if (isPresent(stackTrace) && isBlank(originalStack)) {
      this.logger.logError("STACKTRACE:");
      this.logger.logError(this._longStackTrace(stackTrace));
    }

    if (isPresent(reason)) {
      this.logger.logError(`REASON: ${reason}`);
    }

    if (isPresent(originalException)) {
      this.logger.logError(`ORIGINAL EXCEPTION: ${originalException}`);
    }

    if (isPresent(originalStack)) {
      this.logger.logError("ORIGINAL STACKTRACE:");
      this.logger.logError(this._longStackTrace(originalStack));
    }

    if (isPresent(context)) {
      this.logger.logError("ERROR CONTEXT:");
      this.logger.logError(context);
    }

    this.logger.logGroupEnd();

    // We rethrow exceptions, so operations like 'bootstrap' will result in an error
    // when an exception happens. If we do not rethrow, bootstrap will always succeed.
    if (this.rethrowException) throw exception;
  }

  _longStackTrace(stackTrace: any): any {
    return isListLikeIterable(stackTrace) ? (<any>stackTrace).join("\n\n-----async gap-----\n") :
                                            stackTrace.toString();
  }

  _findContext(exception: any): any {
    try {
      if (!(exception instanceof BaseException)) return null;
      return isPresent(exception.context) ? exception.context :
                                            this._findContext(exception.originalException);
    } catch (e) {
      // exception.context can throw an exception. if it happens, we ignore the context.
      return null;
    }
  }

  _findOriginalException(exception: any): any {
    if (!(exception instanceof BaseException)) return null;

    var e = exception.originalException;
    while (e instanceof BaseException && isPresent(e.originalException)) {
      e = e.originalException;
    }

    return e;
  }

  _findOriginalStack(exception: any): any {
    if (!(exception instanceof BaseException)) return null;

    var e = exception;
    var stack = exception.originalStack;
    while (e instanceof BaseException && isPresent(e.originalException)) {
      e = e.originalException;
      if (e instanceof BaseException && isPresent(e.originalException)) {
        stack = e.originalStack;
      }
    }

    return stack;
  }
}
