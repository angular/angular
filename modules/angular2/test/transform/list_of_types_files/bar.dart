library bar;

import 'package:angular2/src/core/annotations/annotations.dart';
import 'foo.dart';

@Directive(context: const [MyContext])
class Component {
  final MyContext c;
  Component(this.c);
}
