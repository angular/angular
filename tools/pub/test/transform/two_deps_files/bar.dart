library bar;

import 'package:angular2/src/core/annotations/annotations.dart';
import 'foo.dart';

@Directive(context: const MyContext(contextString))
class Component2 {
  final MyContext c;
  final String generatedValue;
  Component2(this.c, String inValue) {
    generatedValue = 'generated ' + inValue;
  }
}
