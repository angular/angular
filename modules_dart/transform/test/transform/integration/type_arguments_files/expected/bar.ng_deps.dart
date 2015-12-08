library bar.ng_deps.dart;

import 'bar.dart';
import 'package:angular2/src/core/reflection/reflection.dart' as _ngRef;
import 'package:angular2/src/core/di/type_literal.dart' as _ngTypeLiteral;
import 'package:angular2/src/core/metadata.dart';
import 'bar.template.dart' as _templates;
import 'package:angular2/src/core/metadata.ng_deps.dart' as i0;
export 'bar.dart';

var _visited = false;
void initReflector() {
  if (_visited) return;
  _visited = true;
  _ngRef.reflector
    ..registerType(
        MyComponent,
        new _ngRef.ReflectionInfo(const [
          const Component(selector: '[bar]', template: 'Bar'),
          _templates.HostMyComponentTemplate
        ], const [
          const [const _ngTypeLiteral.TypeLiteral<List<String>>()]
        ], (List<String> _strings) => new MyComponent(_strings)));
  i0.initReflector();
}

