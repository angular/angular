library static_function_files.hello.ng_deps.dart;

import 'hello.dart';
import 'package:angular2/angular2.dart';

var _visited = false;
void initReflector(reflector) {
  if (_visited) return;
  _visited = true;
  reflector
    ..registerFunction(getMessage, {
      'parameters': const [const [const Inject(Message)]],
      'annotations': const Injectable()
    })
    ..registerType(Message, {
      'factory': () => new Message(),
      'parameters': const [],
      'annotations': const [const Injectable()]
    });
}
