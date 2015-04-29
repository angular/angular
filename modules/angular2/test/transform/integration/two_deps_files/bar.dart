library bar;

import 'package:angular2/src/core/annotations_impl/annotations.dart';
import 'foo.dart' as prefix;

@Component(selector: prefix.preDefinedSelector)
class MyComponent {
  final prefix.MyContext c;
  final String generatedValue;
  MyComponent(this.c, String inValue) {
    generatedValue = 'generated ' + inValue;
  }
}
