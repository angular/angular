import 'package:angular2/src/reflection/reflection.dart' show reflector;
import 'bar.dart' as i0;
import 'foo.dart' as i1;
import 'package:angular2/src/core/annotations/annotations.dart' as i2;
import 'index.dart' as i3;

main() {
  reflector
    ..registerType(i0.Component, {
      "factory": (i1.MyContext c) => new i0.Component(c),
      "parameters": const [const [i1.MyContext]],
      "annotations": const [const i2.Directive(context: const [i1.MyContext])]
    });
  i3.main();
}
