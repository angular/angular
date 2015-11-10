library angular2.src.common.pipes.invalid_pipe_argument_exception;

import "package:angular2/src/facade/lang.dart" show Type;
import "package:angular2/src/facade/exceptions.dart"
    show BaseException, WrappedException;

class InvalidPipeArgumentException extends BaseException {
  InvalidPipeArgumentException(Type type, Object value)
      : super('''Invalid argument \'${ value}\' for pipe \'${ type}\'''') {
    /* super call moved to initializer */;
  }
}
