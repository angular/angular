import 'package:angular2/src/reflection/reflection.dart' show reflector;
import 'index.dart' as i0;
import 'bar.dart' as i1;
import 'package:angular2/src/core/annotations/annotations.dart' as i2;

main() {
  reflector
    ..registerType(i1.Component, {
      "factory": (dynamic c) => new i1.Component(c),
      "parameters": const [const [dynamic]],
      "annotations": const [const i2.Directive(context: 'soup')]
    });
  i0.main();
}
