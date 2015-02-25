import { bind } from 'angular2/di';
import { ListWrapper, StringMapWrapper, StringMap } from 'angular2/src/facade/collection';
import {
  Json, isPresent, isBlank, RegExpWrapper, StringWrapper, BaseException, NumberWrapper
} from 'angular2/src/facade/lang';

import { WebDriverExtension } from '../web_driver_extension';
import { WebDriverAdapter } from '../web_driver_adapter';
import { Promise } from 'angular2/src/facade/async';


export class ChromeDriverExtension extends WebDriverExtension {
  // TODO(tbosch): use static values when our transpiler supports them
  static get BINDINGS() { return _BINDINGS; }

  _driver:WebDriverAdapter;

  constructor(driver:WebDriverAdapter) {
    super();
    this._driver = driver;
  }

  gc() {
    return this._driver.executeScript('window.gc()');
  }

  timeBegin(name:string):Promise {
    return this._driver.executeScript(`console.time('${name}');`);
  }

  timeEnd(name:string, restartName:string = null):Promise {
    var script = `console.timeEnd('${name}');`;
    if (isPresent(restartName)) {
      script += `console.time('${restartName}');`
    }
    return this._driver.executeScript(script);
  }

  // See [Chrome Trace Event Format](https://docs.google.com/document/d/1CvAClvFfyA5R-PhYUmn5OOQtYMH4h6I0nSsKchNAySU/edit)
  readPerfLog() {
    // TODO(tbosch): Bug in ChromeDriver: Need to execute at least one command
    // so that the browser logs can be read out!
    return this._driver.executeScript('1+1')
      .then( (_) => this._driver.logs('performance') )
      .then( (entries) => {
        var events = [];
        ListWrapper.forEach(entries, function(entry) {
          var message = Json.parse(entry['message'])['message'];
          if (StringWrapper.equals(message['method'], 'Tracing.dataCollected')) {
            ListWrapper.push(events, message['params']);
          }
          if (StringWrapper.equals(message['method'], 'Tracing.bufferUsage')) {
            throw new BaseException('The DevTools trace buffer filled during the test!');
          }
        });
        return this._convertPerfRecordsToEvents(events);
      });
  }

  _convertPerfRecordsToEvents(chromeEvents, normalizedEvents = null) {
    if (isBlank(normalizedEvents)) {
      normalizedEvents = [];
    }
    chromeEvents.forEach( (event) => {
      var cat = event['cat'];
      var name = event['name'];
      var args = event['args'];
      if (StringWrapper.equals(cat, 'disabled-by-default-devtools.timeline')) {
        if (StringWrapper.equals(name, 'FunctionCall') &&
          (isBlank(args) || isBlank(args['data']) || !StringWrapper.equals(args['data']['scriptName'], 'InjectedScript'))) {
          ListWrapper.push(normalizedEvents, normalizeEvent(event, {
            'name': 'script'
          }));
        } else if (StringWrapper.equals(name, 'RecalculateStyles') ||
          StringWrapper.equals(name, 'Layout') ||
          StringWrapper.equals(name, 'UpdateLayerTree') ||
          StringWrapper.equals(name, 'Paint') ||
          StringWrapper.equals(name, 'Rasterize') ||
          StringWrapper.equals(name, 'CompositeLayers')) {
          ListWrapper.push(normalizedEvents, normalizeEvent(event, {
            'name': 'render'
          }));
        } else if (StringWrapper.equals(name, 'GCEvent')) {
          ListWrapper.push(normalizedEvents, normalizeEvent(event, {
            'name': 'gc',
            'args': {
              'usedHeapSize': isPresent(args['usedHeapSizeAfter']) ? args['usedHeapSizeAfter'] : args['usedHeapSizeBefore']
            }
          }));
        }
      } else if (StringWrapper.equals(cat, 'blink.console')) {
        ListWrapper.push(normalizedEvents, normalizeEvent(event, {
          'name': name
        }));
      }
    });
    return normalizedEvents;
  }

  supports(capabilities:StringMap):boolean {
    return StringWrapper.equals(capabilities['browserName'].toLowerCase(), 'chrome');
  }
}

function normalizeEvent(chromeEvent, data) {
  var ph = chromeEvent['ph'];
  if (StringWrapper.equals(ph, 'S')) {
    ph = 'b';
  } else if (StringWrapper.equals(ph, 'F')) {
    ph = 'e';
  }
  var result = {
    'pid': chromeEvent['pid'],
    'ph': ph,
    'cat': 'timeline',
    'ts': chromeEvent['ts'] / 1000
  };
  if (chromeEvent['ph'] === 'X') {
    var dur = chromeEvent['dur'];
    if (isBlank(dur)) {
      dur = chromeEvent['tdur'];
    }
    result['dur'] = isBlank(dur) ? 0.0 : dur / 1000;
  }
  StringMapWrapper.forEach(data, (value, prop) => {
    result[prop] = value;
  });
  return result;
}

var _BINDINGS = [
  bind(ChromeDriverExtension).toFactory(
    (driver) => new ChromeDriverExtension(driver),
    [WebDriverAdapter]
  )
];