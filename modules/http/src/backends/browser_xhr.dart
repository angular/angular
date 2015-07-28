library angular2_http.src.backends.browser_xhr;

import 'dart:html' show HttpRequest;
import 'package:angular2/di.dart';

@Injectable()
class BrowserXhr {
  HttpRequest build() {
    return new HttpRequest();
  }
}
