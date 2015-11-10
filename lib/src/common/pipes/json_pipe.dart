library angular2.src.common.pipes.json_pipe;

import "package:angular2/src/facade/lang.dart" show isBlank, isPresent, Json;
import "package:angular2/src/core/di.dart" show Injectable;
import "package:angular2/src/core/change_detection.dart"
    show PipeTransform, WrappedValue;
import "package:angular2/src/core/metadata.dart" show Pipe;

/**
 * Implements json transforms to any object.
 *
 * ### Example
 *
 * In this example we transform the user object to json.
 *
 *  ```
 * @Component({
 *   selector: "user-cmp",
 *   template: "User: {{ user | json }}"
 * })
 * class Username {
 *  user:Object
 *  constructor() {
 *    this.user = { name: "PatrickJS" };
 *  }
 * }
 *
 * ```
 */
@Pipe(name: "json", pure: false)
@Injectable()
class JsonPipe implements PipeTransform {
  String transform(dynamic value, [List<dynamic> args = null]) {
    return Json.stringify(value);
  }

  const JsonPipe();
}
