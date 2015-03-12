library bar;

import 'package:angular2/src/core/annotations/annotations.dart';
import 'foo.dart';

@Component(services: const [MyContext])
class MyComponent {
  final MyContext c;
  MyComponent(this.c);
}
