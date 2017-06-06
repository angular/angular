library angular2.dom.webWorkerAdapter;

import 'abstract_html_adapter.dart';
import 'package:angular2/platform/common_dom.dart';

class WebWorkerDomAdapter extends AbstractHtml5LibAdapter {
  static void makeCurrent() {
    setRootDomAdapter(new WebWorkerDomAdapter());
  }

  logError(error) {
    print('${error}');
  }

  log(error) {
    print('${error}');
  }

  logGroup(error) {
    print('${error}');
  }

  logGroupEnd() {}
}
