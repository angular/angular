import 'package:angular2/src/reflection/reflection.dart' show reflector;
import 'index.dart' as i0;
import 'bar.dart' as i1;
import 'foo.dart' as i2;
import 'package:angular2/src/core/annotations/annotations.dart' as i3;

main() {
  reflector
    ..registerType(i1.Component, {
      "factory": (i2.MyContext c) => new i1.Component(c),
      "parameters": const [const [i2.MyContext]],
      "annotations": const [const i3.Directive(context: const [i2.MyContext])]
    });
  i0.main();
}
