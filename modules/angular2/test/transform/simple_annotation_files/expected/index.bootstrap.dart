import 'package:angular2/src/reflection/reflection.dart' show reflector;
import 'index.dart' as i0;
import 'bar.dart' as i1;
import 'package:angular2/src/core/annotations/annotations.dart' as i2;

main() {
  reflector
    ..registerType(i1.Component, {
      "factory": () => new i1.Component(),
      "parameters": const [const []],
      "annotations": const [const i2.Directive(context: 'soup')]
    });
  i0.main();
}
