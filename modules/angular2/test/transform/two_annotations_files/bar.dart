library bar;

import 'package:angular2/src/core/annotations/annotations.dart';
import 'package:angular2/src/core/annotations/template.dart';

@Component(selector: '[soup]')
@Template(inline: 'Salad')
class MyComponent {
  MyComponent();
}
