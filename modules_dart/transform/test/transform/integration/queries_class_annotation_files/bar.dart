library bar;

import 'package:angular2/src/core/metadata.dart';

@Component(
    selector: '[soup]',
    queries: const {'queryField': const ContentChild('child')})
@View(template: '')
class MyComponent {}
