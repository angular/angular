import {isPresent, print, BaseException} from 'angular2/src/facade/lang';
import {ListWrapper, isListLikeIterable} from 'angular2/src/facade/collection';
import {ExceptionHandler} from 'angular2/src/core/exception_handler';
import {Injectable} from 'angular2/di';

@Injectable()
export class WorkerExceptionHandler implements ExceptionHandler {
  logError: Function = print;

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
