library bar;

import 'package:angular2/src/core/metadata.dart';

@Component(selector: '[bar]', template: 'Bar')
class MyComponent {

  final List<String> _strings;

  MyComponent(this._strings);
}
