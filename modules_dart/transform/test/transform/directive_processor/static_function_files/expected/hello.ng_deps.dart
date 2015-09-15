library static_function_files.hello.ng_deps.dart;

import 'hello.dart';
import 'package:angular2/src/core/reflection/reflection.dart' as _ngRef;
import 'package:angular2/angular2.dart';
export 'hello.dart';

var _visited = false;
void initReflector() {
  if (_visited) return;
  _visited = true;
  _ngRef.reflector
    ..registerFunction(
        getMessage,
        new _ngRef.ReflectionInfo(const [
          const Injectable()
        ], const [
          const [const Inject(Message)]
        ]))
    ..registerType(
        Message,
        new _ngRef.ReflectionInfo(
            const [const Injectable()], const [], () => new Message()));
}
