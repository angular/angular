library bar.ng_deps.dart;

import 'bar.template.dart' as _templates;

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
          const Component(
              selector: '[tool-tip]', inputs: const ['text: tool-tip']),
          const View(template: '<div>Tooltip</div>'),
          _templates.HostToolTipTemplate
        ], const [], () => new ToolTip()))
    ..registerSetters({'text': (o, v) => o.text = v});
}
