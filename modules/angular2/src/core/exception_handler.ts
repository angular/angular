import {Injectable} from 'angular2/di';
import {isPresent, print, BaseException} from 'angular2/src/facade/lang';
import {ListWrapper, isListLikeIterable} from 'angular2/src/facade/collection';
import {DOM} from 'angular2/src/dom/dom_adapter';

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
  logError: Function = DOM.logError;

  call(exception: Object, stackTrace: any = null, reason: string = null) {
    var longStackTrace = isListLikeIterable(stackTrace) ?
                             (<any>stackTrace).join("\n\n-----async gap-----\n") :
                             stackTrace;

    this.logError(`${exception}\n\n${longStackTrace}`);

    if (isPresent(reason)) {
      this.logError(`Reason: ${reason}`);
    }

    var context = this._findContext(exception);
    if (isPresent(context)) {
      this.logError("Error Context:");
      this.logError(context);
    }

    throw exception;
  }

  _findContext(exception: any): any {
    if (!(exception instanceof BaseException)) return null;
    return isPresent(exception.context) ? exception.context :
                                          this._findContext(exception.originalException);
  }
}
