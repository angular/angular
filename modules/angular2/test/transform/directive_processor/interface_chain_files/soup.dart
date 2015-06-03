library dinner.soup;

import 'package:angular2/src/core/annotations_impl/annotations.dart';

@Component(selector: '[soup]')
class ChangingSoupComponent implements PrimaryInterface {}

class TernaryInterface {}

class SecondaryInterface implements TernaryInterface {}

class PrimaryInterface implements SecondaryInterface {}
