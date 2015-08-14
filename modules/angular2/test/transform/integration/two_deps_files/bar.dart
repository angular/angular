library bar;

import 'package:angular2/src/core/metadata.dart';
import 'foo.dart' as prefix;

@Component(selector: 'soup')
class MyComponent {
  final prefix.MyContext c;
  final String generatedValue;
  MyComponent(this.c, String inValue) {
    generatedValue = 'generated ' + inValue;
  }
}
