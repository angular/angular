library bar;

import 'package:angular2/src/core/annotations/annotations.dart';
import 'package:angular2/src/core/annotations/view.dart';

@Component(selector: '[soup]')
@View(template: 'Salad')
class MyComponent {
  MyComponent();
}
