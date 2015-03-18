library dinner.soup;

import 'soup.dart';
import 'package:angular2/src/core/annotations/annotations.dart';

bool _visited = false;
void setupReflection(reflector) {
  if (_visited) return;
  _visited = true;
  reflector
    ..registerType(SoupComponent, {
      'factory':
          (String description, salt) => new SoupComponent(description, salt),
      'parameters': const [const [Tasty, String], const [const Inject(Salt)]],
      'annotations': const [const Component(selector: '[soup]')]
    });
} // {"version":1,"importOffset":104,"registerOffset":451,"imports":["package:angular2/src/core/annotations/annotations.dart"]}
