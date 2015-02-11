import { bind } from 'angular2/di';
import { ListWrapper } from 'angular2/src/facade/collection';
import {
  Json, isPresent, isBlank, RegExpWrapper, StringWrapper
} from 'angular2/src/facade/lang';

import { WebDriverExtension } from '../web_driver_extension';
import { WebDriverAdapter } from '../web_driver_adapter';
import { Promise } from 'angular2/src/facade/async';


var BEGIN_MARK_RE = RegExpWrapper.create('begin_(.*)');
var END_MARK_RE = RegExpWrapper.create('end_(.*)');

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
    // Note: Can't use console.time / console.timeEnd as it does not show up in the perf log!
    return this._driver.executeScript(`console.timeStamp('begin_${name}');`);
  }

  timeEnd(name:string, restartName:string = null):Promise {
    // Note: Can't use console.time / console.timeEnd as it does not show up in the perf log!
    var script = `console.timeStamp('end_${name}');`;
    if (isPresent(restartName)) {
      script += `console.timeStamp('begin_${restartName}');`
    }
    return this._driver.executeScript(script);
  }

  readPerfLog() {
    // TODO(tbosch): Bug in ChromeDriver: Need to execute at least one command
    // so that the browser logs can be read out!
    return this._driver.executeScript('1+1')
      .then( (_) => this._driver.logs('performance') )
      .then( (entries) => {
        var records = [];
        ListWrapper.forEach(entries, function(entry) {
          var message = Json.parse(entry['message'])['message'];
          if (StringWrapper.equals(message['method'], 'Timeline.eventRecorded')) {
            ListWrapper.push(records, message['params']['record']);
          }
        });
        return this._convertPerfRecordsToEvents(records);
      });
  }

  _convertPerfRecordsToEvents(records, events = null) {
    if (isBlank(events)) {
      events = [];
    }
    records.forEach( (record) => {
      var endEvent = null;
      var type = record['type'];
      var data = record['data'];
      var startTime = record['startTime'];
      var endTime = record['endTime'];

      if (StringWrapper.equals(type, 'FunctionCall') &&
        (isBlank(data) || !StringWrapper.equals(data['scriptName'], 'InjectedScript'))) {
        ListWrapper.push(events, {
          'name': 'script',
          'ts': startTime,
          'ph': 'B'
        });
        endEvent = {
          'name': 'script',
          'ts': endTime,
          'ph': 'E',
          'args': null
        }
      } else if (StringWrapper.equals(type, 'TimeStamp')) {
        var name = data['message'];
        var ph;
        var match = RegExpWrapper.firstMatch(BEGIN_MARK_RE, name);
        if (isPresent(match)) {
          ph = 'b';
        } else {
          match = RegExpWrapper.firstMatch(END_MARK_RE, name);
          if (isPresent(match)) {
            ph = 'e';
          }
        }
        if (isPresent(ph)) {
          ListWrapper.push(events, {
            'name': match[1],
            'ph': ph
          });
        }
      } else if (StringWrapper.equals(type, 'RecalculateStyles') ||
        StringWrapper.equals(type, 'Layout') ||
        StringWrapper.equals(type, 'UpdateLayerTree') ||
        StringWrapper.equals(type, 'Paint') ||
        StringWrapper.equals(type, 'Rasterize') ||
        StringWrapper.equals(type, 'CompositeLayers')) {
        ListWrapper.push(events, {
          'name': 'render',
          'ts': startTime,
          'ph': 'B'
        });
        endEvent = {
          'name': 'render',
          'ts': endTime,
          'ph': 'E',
          'args': null
        }
      } else if (StringWrapper.equals(type, 'GCEvent')) {
        ListWrapper.push(events, {
          'name': 'gc',
          'ts': startTime,
          'ph': 'B'
        });
        endEvent = {
          'name': 'gc',
          'ts': endTime,
          'ph': 'E',
          'args': {
            'amount': data['usedHeapSizeDelta']
          }
        };
      }
      if (isPresent(record['children'])) {
        this._convertPerfRecordsToEvents(record['children'], events);
      }
      if (isPresent(endEvent)) {
        ListWrapper.push(events, endEvent);
      }
    });
    return events;
  }
}

var _BINDINGS = [
  bind(WebDriverExtension).toFactory(
    (driver) => new ChromeDriverExtension(driver),
    [WebDriverAdapter]
  )
];