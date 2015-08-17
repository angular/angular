library bar;

import 'package:angular2/src/core/annotations_impl/annotations.dart';
import 'package:angular2/src/core/annotations_impl/base_view.dart';

@Component(selector: '[soup]')
@BaseView(template: 'Salad: {{myNum}} is awesome')
class MyComponent {
  int myNum;

  MyComponent();
}
