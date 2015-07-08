import {Injectable} from 'angular2/di';
import {isPresent, print} from 'angular2/src/facade/lang';
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
 * @Component({
 *   selector: 'my-app',
 *   viewInjector: [
 *     bind(ExceptionHandler).toClass(MyExceptionHandler)
 *   ]
 * })
 * @View(...)
 * class MyApp { ... }
 *
 *
 * class MyExceptionHandler implements ExceptionHandler {
 *   call(error, stackTrace = null, reason = null) {
 *     // do something with the exception
 *   }
 * }
 *
 * ```
 */
@Injectable()
export class ExceptionHandler {
  call(error: Object, stackTrace: string | List<string> = null, reason: string = null) {
    var longStackTrace =
        isListLikeIterable(stackTrace) ? ListWrapper.join(<any>stackTrace, "\n\n") : stackTrace;
    var reasonStr = isPresent(reason) ? `\n${reason}` : '';
    DOM.logError(`${error}${reasonStr}\nSTACKTRACE:\n${longStackTrace}`);
  }
}
