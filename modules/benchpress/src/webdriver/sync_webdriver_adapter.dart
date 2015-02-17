library benchpress.src.webdriver.sync_webdriver_adapter_dart;

import 'package:angular2/src/facade/async.dart' show Future, PromiseWrapper;
import '../web_driver_adapter.dart' show WebDriverAdapter;

class SyncWebDriverAdapter extends WebDriverAdapter {
  dynamic _driver;
  SyncWebDriverAdapter(driver) {
    this._driver = driver;
  }
  Future waitFor(Function callback) {
    return this._convertToAsync(callback);
  }
  Future _convertToAsync(callback) {
    try {
      var result = callback();
      if (result is Promise) {
        return result;
      } else {
        return PromiseWrapper.resolve(result);
      }
    } catch (e) {
      return PromiseWrapper.reject(result);
    }
  }
  Future executeScript(String script) {
    return this._convertToAsync(() {
      return this._driver.execute(script);
    });
  }
  Future capabilities() {
    return this._convertToAsync(() {
      return this._driver.capabilities;
    });
  }
  Future logs(String type) {
    return this._convertToAsync(() {
      return this._driver.logs.get(script);
    });
  }
}
