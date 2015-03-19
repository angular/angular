library dinner.split_pea_soup;

import 'package:angular2/di.dart' show Injectable;
import 'package:angular2/src/facade/lang.dart' show CONST;

class Food extends Injectable {
  @CONST()
  const Food() : super();
}

class Soup implements Food {
  @CONST()
  const Soup() : super();
}

@Soup()
class SplitPeaSoup {
  SplitPeaSoup();
}
