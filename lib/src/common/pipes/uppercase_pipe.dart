library angular2.src.common.pipes.uppercase_pipe;

import "package:angular2/src/facade/lang.dart" show isString, isBlank;
import "package:angular2/src/core/metadata.dart" show Pipe;
import "package:angular2/src/core/di.dart" show Injectable;
import "package:angular2/src/core/change_detection.dart"
    show PipeTransform, WrappedValue;
import "invalid_pipe_argument_exception.dart" show InvalidPipeArgumentException;

/**
 * Implements uppercase transforms to text.
 *
 * ### Example
 *
 * {@example core/pipes/ts/lowerupper_pipe/lowerupper_pipe_example.ts region='LowerUpperPipe'}
 */
@Pipe(name: "uppercase")
@Injectable()
class UpperCasePipe implements PipeTransform {
  String transform(String value, [List<dynamic> args = null]) {
    if (isBlank(value)) return value;
    if (!isString(value)) {
      throw new InvalidPipeArgumentException(UpperCasePipe, value);
    }
    return value.toUpperCase();
  }

  const UpperCasePipe();
}
