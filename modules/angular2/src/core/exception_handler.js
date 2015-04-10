import {Injectable} from 'angular2/di';
import {isPresent, print} from 'angular2/src/facade/lang';
import {ListWrapper, isListLikeIterable} from 'angular2/src/facade/collection';

/**
 * @exportedAs angular2/core
 */
@Injectable()
export class ExceptionHandler {
  call(error, stackTrace = null, reason = null) {
    var longStackTrace = isListLikeIterable(stackTrace) ? ListWrapper.join(stackTrace, "\n\n") : stackTrace;
    var reasonStr = isPresent(reason) ? `\n${reason}` : '';
    print(`${error}${reasonStr}\nSTACKTRACE:\n${longStackTrace}`);
  }
}
