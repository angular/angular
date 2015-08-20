import {bind, Binding} from 'angular2/di';
import {isPresent, StringWrapper} from 'angular2/src/core/facade/lang';
import {WebDriverExtension, PerfLogFeatures} from '../web_driver_extension';
import {WebDriverAdapter} from '../web_driver_adapter';
import {Promise} from 'angular2/src/core/facade/async';

export class FirefoxDriverExtension extends WebDriverExtension {
  static get BINDINGS(): List<Binding> { return _BINDINGS; }

  private _profilerStarted: boolean;

  constructor(private _driver: WebDriverAdapter) {
    super();
    this._profilerStarted = false;
  }

  gc() { return this._driver.executeScript('window.forceGC()'); }

  timeBegin(name: string): Promise<any> {
    if (!this._profilerStarted) {
      this._profilerStarted = true;
      this._driver.executeScript('window.startProfiler();');
    }
    return this._driver.executeScript('window.markStart("' + name + '");');
  }

  timeEnd(name: string, restartName: string = null): Promise<any> {
    var script = 'window.markEnd("' + name + '");';
    if (isPresent(restartName)) {
      script += 'window.markStart("' + restartName + '");';
    }
    return this._driver.executeScript(script);
  }

  readPerfLog(): Promise<any> {
    return this._driver.executeAsyncScript('var cb = arguments[0]; window.getProfile(cb);');
  }

  perfLogFeatures(): PerfLogFeatures { return new PerfLogFeatures({render: true, gc: true}); }

  supports(capabilities: StringMap<string, any>): boolean {
    return StringWrapper.equals(capabilities['browserName'].toLowerCase(), 'firefox');
  }
}

var _BINDINGS = [
  bind(FirefoxDriverExtension)
      .toFactory((driver) => new FirefoxDriverExtension(driver), [WebDriverAdapter])
];
