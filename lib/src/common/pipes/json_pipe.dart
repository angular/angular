library angular2.src.common.pipes.json_pipe;

import "package:angular2/src/facade/lang.dart" show isBlank, isPresent, Json;
import "package:angular2/core.dart"
    show Injectable, PipeTransform, WrappedValue, Pipe;

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
