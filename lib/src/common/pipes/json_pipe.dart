library angular2.src.common.pipes.json_pipe;

import "package:angular2/src/facade/lang.dart" show isBlank, isPresent, Json;
import "package:angular2/src/core/di.dart" show Injectable;
import "package:angular2/src/core/change_detection.dart"
    show PipeTransform, WrappedValue;
import "package:angular2/src/core/metadata.dart" show Pipe;

/**
 * Transforms any input value using `JSON.stringify`. Useful for debugging.
 *
 * ### Example
 * {@example core/pipes/ts/json_pipe/json_pipe_example.ts region='JsonPipe'}
 */
@Pipe(name: "json", pure: false)
@Injectable()
class JsonPipe implements PipeTransform {
  String transform(dynamic value, [List<dynamic> args = null]) {
    return Json.stringify(value);
  }

  const JsonPipe();
}
