library angular2.src.http.backends.browser_xhr;

import 'dart:html' show HttpRequest;
import 'package:angular2/di.dart';

@Injectable()
class BrowserXhr {
	HttpRequest build() {
		return new HttpRequest();
	}
}
