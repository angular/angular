library bar;

import 'package:angular2/src/core/annotations/annotations.dart';
import 'foo.dart' as dep;

@Component(
    selector: '[soup]', componentServices: const [dep.DependencyComponent])
class MyComponent {
  MyComponent();
}
