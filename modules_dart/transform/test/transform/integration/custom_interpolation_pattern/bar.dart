library bar;

import 'package:angular2/src/core/metadata.dart';

@Component(selector: '[soup]')
@View(template: 'Salad: [[myNum]] is awesome', interpolationPattern: '\\[\\[[(.*?)\\]]\\]]')
class MyComponent {
  int myNum;

  MyComponent();
}
