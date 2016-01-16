library bar;

import 'package:angular2/src/core/metadata.dart';

@Component(selector: '[soup]')
@View(template: '')
class MyComponent implements QueryFieldProvider {
  @override
  String queryField;
}
