library reflection.debug_reflection_capabilities;

import 'package:logging/logging.dart';
import 'package:stack_trace/stack_trace.dart';
import 'types.dart';
import 'reflection_capabilities.dart' as standard;

class ReflectionCapabilities extends standard.ReflectionCapabilities {
  final bool _verbose;
  final Logger _log = new Logger('ReflectionCapabilities');

  ReflectionCapabilities({bool verbose: false})
      : _verbose = verbose,
        super() {
    Logger.root.level = _verbose ? Level.ALL : Level.INFO;
    Logger.root.onRecord.listen((LogRecord rec) {
      print('[${rec.loggerName}(${rec.level.name})]: ${rec.message}');
    });
  }

  void _notify(String methodName, param) {
    var trace = _verbose ? ' ${Trace.format(new Trace.current())}' : '';
    _log.info('"$methodName" requested for "$param".$trace');
  }

  Function factory(Type type) {
    _notify('factory', type);
    return super.factory(type);
  }

  List<List> parameters(typeOrFunc) {
    _notify('parameters', typeOrFunc);
    return super.parameters(typeOrFunc);
  }

  List annotations(typeOrFunc) {
    _notify('annotations', typeOrFunc);
    return super.annotations(typeOrFunc);
  }

  GetterFn getter(String name) {
    _notify('getter', name);
    return super.getter(name);
  }

  SetterFn setter(String name) {
    _notify('setter', name);
    return super.setter(name);
  }

  MethodFn method(String name) {
    _notify('method', name);
    return super.method(name);
  }
}
