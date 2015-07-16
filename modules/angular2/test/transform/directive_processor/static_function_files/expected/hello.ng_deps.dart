library static_function_files.hello.ng_deps.dart;

import 'hello.dart';
import 'package:angular2/src/reflection/reflection.dart' as _ngRef;
import 'package:angular2/angular2.dart';

var _visited = false;
void initReflector() {
  if (_visited) return;
  _visited = true;
  _ngRef.reflector
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
