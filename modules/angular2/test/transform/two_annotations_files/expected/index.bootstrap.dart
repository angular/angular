import 'package:angular2/src/reflection/reflection.dart' show reflector;
import 'bar.dart' as i0;
import 'package:angular2/src/core/annotations/annotations.dart' as i1;
import 'package:angular2/src/core/annotations/template.dart' as i2;
import 'index.dart' as i3;

main() {
  reflector
    ..registerType(i0.MyComponent, {
      "factory": () => new i0.MyComponent(),
      "parameters": const [const []],
      "annotations": const [
        const i1.Component(selector: '[soup]'),
        const i2.Template(inline: 'Salad')
      ]
    });
  i3.main();
}
