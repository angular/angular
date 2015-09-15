library fields;

import 'package:angular2/src/core/metadata.dart';

@Component(selector: '[setters]')
class FieldComponent {
  @SetDecorator("set") String set setVal(val) => null;
}
