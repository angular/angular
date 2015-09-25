library bar.ng_deps.dart;

import 'bar.dart';
import 'package:angular2/src/core/metadata.dart';

var _visited = false;
void initReflector(reflector) {
  if (_visited) return;
  _visited = true;
  reflector
    ..registerType(
        ToolTip,
        new ReflectionInfo(const [
          const Directive(
              selector: '[tool-tip]')
        ], const [], () => new ToolTip(), null, const {'queryField': const [const ContentChild('child')]}));
}
