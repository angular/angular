library dinner.bad_soup.ng_deps.dart;

import 'bad_soup.dart';

var _visited = false;
void initReflector(reflector) {
  if (_visited) return;
  _visited = true;
}
