library angular2.src.transform.generated;

import 'package:angular2/src/reflection/reflection.dart' show reflector;
import 'bar.dart' as i0;
import 'foo.dart' as i1;
import 'package:angular2/src/core/annotations/annotations.dart' as i2;

setupReflection() {
  reflector
    ..registerType(i0.MyComponent, {
      "factory": (i1.MyContext c) => new i0.MyComponent(c),
      "parameters": const [const [i1.MyContext]],
      "annotations": const [
        const i2.Component(componentServices: const [i1.MyContext])
      ]
    });
}
