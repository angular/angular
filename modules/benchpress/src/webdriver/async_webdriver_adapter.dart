library benchpress.src.webdriver.async_webdriver_adapter_dart;

import 'package:angular2/src/facade/async.dart' show Future;
import '../web_driver_adapter.dart' show WebDriverAdapter;

class AsyncWebDriverAdapter extends WebDriverAdapter {
  dynamic _driver;
  AsyncWebDriverAdapter(driver) {
    this._driver = driver;
  }
  Future waitFor(Function callback) {
    return callback();
  }
  Future executeScript(String script) {
    return this._driver.execute(script);
  }
  Future capabilities() {
    return this._driver.capabilities;
  }
  Future logs(String type) {
    return this._driver.logs.get(type);
  }
}
