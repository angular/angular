library dinner.soup;

import 'package:angular2/src/core/metadata.dart';
import 'package:angular2/src/core/compiler.dart';

@Component(selector: '[soup]')
@View(template: '')
class ChangingSoupComponent implements OnChanges, AnotherInterface {}
