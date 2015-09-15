library fields;

import 'package:angular2/src/core/metadata.dart';

@Component(selector: '[getters]')
class FieldComponent {
  @GetDecorator("get") String get getVal => 'a';
}
