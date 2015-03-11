library bar;

import 'package:angular2/src/core/annotations/annotations.dart';

@Component(selector: 'soup', services: const [ToolTip])
class MyComponent {}

@Decorator(selector: '[tool-tip]', bind: const {'text': 'tool-tip'})
class ToolTip {
  String text;
}
