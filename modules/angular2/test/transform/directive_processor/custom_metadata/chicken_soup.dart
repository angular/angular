library dinner.chicken_soup;

import 'package:angular2/di.dart' show Injectable;
import 'package:angular2/src/facade/lang.dart' show CONST;

class Food implements Injectable {
  @CONST()
  const Food() : super();
}

class Soup extends Food {
  @CONST()
  const Soup() : super();
}

@Soup()
class ChickenSoup {
  ChickenSoup();
}
