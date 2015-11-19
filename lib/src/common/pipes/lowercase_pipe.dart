library angular2.src.common.pipes.lowercase_pipe;

import "package:angular2/src/facade/lang.dart" show isString, isBlank;
import "package:angular2/core.dart"
    show Injectable, PipeTransform, WrappedValue, Pipe;
import "invalid_pipe_argument_exception.dart" show InvalidPipeArgumentException;

/**
 * Transforms text to lowercase.
 *
 * ### Example
 *
 * {@example core/pipes/ts/lowerupper_pipe/lowerupper_pipe_example.ts region='LowerUpperPipe'}
 */
@Pipe(name: "lowercase")
@Injectable()
class LowerCasePipe implements PipeTransform {
  String transform(String value, [List<dynamic> args = null]) {
    if (isBlank(value)) return value;
    if (!isString(value)) {
      throw new InvalidPipeArgumentException(LowerCasePipe, value);
    }
    return value.toLowerCase();
  }

  const LowerCasePipe();
}
