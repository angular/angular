library bar;

import 'package:angular2/src/core/annotations_impl/annotations.dart';
import 'package:angular2/src/core/annotations_impl/view.dart';

@Component(selector: '[soup]')
@View(template: 'Salad')
class MyComponent {
  MyComponent();
}
