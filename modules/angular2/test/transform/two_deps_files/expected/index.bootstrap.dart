import 'package:angular2/src/reflection/reflection.dart' show reflector;
import 'bar.dart' as i0;
import 'foo.dart' as i1;
import 'package:angular2/src/core/annotations/annotations.dart' as i2;
import 'index.dart' as i3;

main() {
  reflector
    ..registerType(i0.Component2, {
      "factory":
          (i1.MyContext c, String inValue) => new i0.Component2(c, inValue),
      "parameters": const [const [i1.MyContext, String]],
      "annotations": const [
        const i2.Directive(context: const i1.MyContext(i1.contextString))
      ]
    });
  i3.main();
}
