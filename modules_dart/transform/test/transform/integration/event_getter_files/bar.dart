library bar;

import 'package:angular2/src/core/metadata.dart';

@Component(selector: '[soup]', events: ['eventName1', 'eventName2: propName2'])
@View(template: '')
class MyComponent {
  MyComponent();
}
