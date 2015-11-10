library angular2.src.facade.exception_handler;

import "package:angular2/src/facade/lang.dart" show isPresent, isBlank, print;
import "package:angular2/src/facade/exceptions.dart"
    show BaseException, WrappedException;
import "package:angular2/src/facade/collection.dart"
    show ListWrapper, isListLikeIterable;

class _ArrayLogger {
  List<dynamic> res = [];
  void log(dynamic s) {
    this.res.add(s);
  }

  void logError(dynamic s) {
    this.res.add(s);
  }

  void logGroup(dynamic s) {
    this.res.add(s);
  }

  logGroupEnd() {}
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
class ExceptionHandler {
  dynamic _logger;
  bool _rethrowException;
  ExceptionHandler(this._logger, [this._rethrowException = true]) {}
  static String exceptionToString(dynamic exception,
      [dynamic stackTrace = null, String reason = null]) {
    var l = new _ArrayLogger();
    var e = new ExceptionHandler(l, false);
    e.call(exception, stackTrace, reason);
    return l.res.join("\n");
  }

  void call(dynamic exception,
      [dynamic stackTrace = null, String reason = null]) {
    var originalException = this._findOriginalException(exception);
    var originalStack = this._findOriginalStack(exception);
    var context = this._findContext(exception);
    this
        ._logger
        .logGroup('''EXCEPTION: ${ this . _extractMessage ( exception )}''');
    if (isPresent(stackTrace) && isBlank(originalStack)) {
      this._logger.logError("STACKTRACE:");
      this._logger.logError(this._longStackTrace(stackTrace));
    }
    if (isPresent(reason)) {
      this._logger.logError('''REASON: ${ reason}''');
    }
    if (isPresent(originalException)) {
      this._logger.logError(
          '''ORIGINAL EXCEPTION: ${ this . _extractMessage ( originalException )}''');
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
    if (this._rethrowException) throw exception;
  }

  /** @internal */
  String _extractMessage(dynamic exception) {
    return exception is WrappedException
        ? exception.wrapperMessage
        : exception.toString();
  }

  /** @internal */
  dynamic _longStackTrace(dynamic stackTrace) {
    return isListLikeIterable(stackTrace)
        ? ((stackTrace as List<dynamic>)).join("\n\n-----async gap-----\n")
        : stackTrace.toString();
  }

  /** @internal */
  dynamic _findContext(dynamic exception) {
    try {
      if (!(exception is WrappedException)) return null;
      return isPresent(exception.context)
          ? exception.context
          : this._findContext(exception.originalException);
    } catch (e, e_stack) {
      // exception.context can throw an exception. if it happens, we ignore the context.
      return null;
    }
  }

  /** @internal */
  dynamic _findOriginalException(dynamic exception) {
    if (!(exception is WrappedException)) return null;
    var e = exception.originalException;
    while (e is WrappedException && isPresent(e.originalException)) {
      e = e.originalException;
    }
    return e;
  }

  /** @internal */
  dynamic _findOriginalStack(dynamic exception) {
    if (!(exception is WrappedException)) return null;
    var e = exception;
    var stack = exception.originalStack;
    while (e is WrappedException && isPresent(e.originalException)) {
      e = e.originalException;
      if (e is WrappedException && isPresent(e.originalException)) {
        stack = e.originalStack;
      }
    }
    return stack;
  }
}
