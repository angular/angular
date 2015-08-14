library bar;

import 'package:angular2/src/core/metadata.dart';
import 'foo.dart';

@Component(componentServices: const [MyContext])
class MyComponent {
  final MyContext c;
  MyComponent(this.c);
}
