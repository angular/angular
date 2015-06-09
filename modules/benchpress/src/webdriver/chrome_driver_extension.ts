import {bind, Binding} from 'angular2/di';
import {ListWrapper, StringMapWrapper, StringMap} from 'angular2/src/facade/collection';
import {
  Json,
  isPresent,
  isBlank,
  RegExpWrapper,
  StringWrapper,
  BaseException,
  NumberWrapper
} from 'angular2/src/facade/lang';

import {WebDriverExtension, PerfLogFeatures} from '../web_driver_extension';
import {WebDriverAdapter} from '../web_driver_adapter';
import {Promise} from 'angular2/src/facade/async';

/**
 * Set the following 'traceCategories' to collect metrics in Chrome:
 * 'v8,blink.console,disabled-by-default-devtools.timeline'
 *
 * In order to collect the frame rate related metrics, add 'benchmark'
 * to the list above.
 */
export class ChromeDriverExtension extends WebDriverExtension {
  // TODO(tbosch): use static values when our transpiler supports them
  static get BINDINGS(): List<Binding> { return _BINDINGS; }

  constructor(private _driver: WebDriverAdapter) { super(); }

  gc() { return this._driver.executeScript('window.gc()'); }

  timeBegin(name: string): Promise<any> {
    return this._driver.executeScript(`console.time('${name}');`);
  }

  timeEnd(name: string, restartName: string = null): Promise<any> {
    var script = `console.timeEnd('${name}');`;
    if (isPresent(restartName)) {
      script += `console.time('${restartName}');`
    }
    return this._driver.executeScript(script);
  }

  // See [Chrome Trace Event
  // Format](https://docs.google.com/document/d/1CvAClvFfyA5R-PhYUmn5OOQtYMH4h6I0nSsKchNAySU/edit)
  readPerfLog(): Promise<any> {
    // TODO(tbosch): Chromedriver bug https://code.google.com/p/chromedriver/issues/detail?id=1098
    // Need to execute at least one command so that the browser logs can be read out!
    return this._driver.executeScript('1+1')
        .then((_) => this._driver.logs('performance'))
        .then((entries) => {
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

  _convertPerfRecordsToEvents(chromeEvents: List<StringMap<string, any>>,
                              normalizedEvents: List<StringMap<string, any>> = null) {
    if (isBlank(normalizedEvents)) {
      normalizedEvents = [];
    }
    var majorGCPids = {};
    chromeEvents.forEach((event) => {
      var cat = event['cat'];
      var name = event['name'];
      var args = event['args'];
      var pid = event['pid'];
      var ph = event['ph'];
      if (StringWrapper.equals(cat, 'disabled-by-default-devtools.timeline')) {
        if (StringWrapper.equals(name, 'FunctionCall') &&
            (isBlank(args) || isBlank(args['data']) ||
             !StringWrapper.equals(args['data']['scriptName'], 'InjectedScript'))) {
          ListWrapper.push(normalizedEvents, normalizeEvent(event, {'name': 'script'}));

        } else if (StringWrapper.equals(name, 'RecalculateStyles') ||
                   StringWrapper.equals(name, 'Layout') ||
                   StringWrapper.equals(name, 'UpdateLayerTree') ||
                   StringWrapper.equals(name, 'Paint') || StringWrapper.equals(name, 'Rasterize') ||
                   StringWrapper.equals(name, 'CompositeLayers')) {
          ListWrapper.push(normalizedEvents, normalizeEvent(event, {'name': 'render'}));

        } else if (StringWrapper.equals(name, 'GCEvent')) {
          var normArgs = {
            'usedHeapSize': isPresent(args['usedHeapSizeAfter']) ? args['usedHeapSizeAfter'] :
                                                                   args['usedHeapSizeBefore']
          };
          if (StringWrapper.equals(event['ph'], 'E')) {
            normArgs['majorGc'] = isPresent(majorGCPids[pid]) && majorGCPids[pid];
          }
          majorGCPids[pid] = false;
          ListWrapper.push(normalizedEvents,
                           normalizeEvent(event, {'name': 'gc', 'args': normArgs}));
        }

      } else if (StringWrapper.equals(cat, 'blink.console')) {
        ListWrapper.push(normalizedEvents, normalizeEvent(event, {'name': name}));

      } else if (StringWrapper.equals(cat, 'v8')) {
        if (StringWrapper.equals(name, 'majorGC')) {
          if (StringWrapper.equals(ph, 'B')) {
            majorGCPids[pid] = true;
          }
        }

      } else if (StringWrapper.equals(cat, 'benchmark')) {
        if (StringWrapper.equals(name, 'BenchmarkInstrumentation::ImplThreadRenderingStats')) {
          var frameCount = event['args']['data']['frame_count'];
          if (frameCount > 1) {
            throw new BaseException('multi-frame render stats not supported');
          }
          if (frameCount == 1) {
            ListWrapper.push(normalizedEvents, normalizeEvent(event, {'name': 'frame'}));
          }
        } else if (StringWrapper.equals(name, 'BenchmarkInstrumentation::DisplayRenderingStats') ||
                   StringWrapper.equals(name, 'vsync_before')) {
          // TODO(goderbauer): If present, these events should be used instead of
          // BenchmarkInstrumentation::ImplThreadRenderingStats.
          // However, they never seem to appear in practice. Maybe they appear on a different
          // platform?
          throw new BaseException('NYI');
        }
      }
    });
    return normalizedEvents;
  }

  perfLogFeatures(): PerfLogFeatures {
    return new PerfLogFeatures({render: true, gc: true, frameCapture: true});
  }

  supports(capabilities: StringMap<string, any>): boolean {
    return StringWrapper.equals(capabilities['browserName'].toLowerCase(), 'chrome');
  }
}

function normalizeEvent(chromeEvent: StringMap<string, any>,
                        data: StringMap<string, any>): StringMap<string, any> {
  var ph = chromeEvent['ph'];
  if (StringWrapper.equals(ph, 'S')) {
    ph = 'b';
  } else if (StringWrapper.equals(ph, 'F')) {
    ph = 'e';
  }
  var result =
      {'pid': chromeEvent['pid'], 'ph': ph, 'cat': 'timeline', 'ts': chromeEvent['ts'] / 1000};
  if (chromeEvent['ph'] === 'X') {
    var dur = chromeEvent['dur'];
    if (isBlank(dur)) {
      dur = chromeEvent['tdur'];
    }
    result['dur'] = isBlank(dur) ? 0.0 : dur / 1000;
  }
  StringMapWrapper.forEach(data, (value, prop) => { result[prop] = value; });
  return result;
}

var _BINDINGS = [
  bind(ChromeDriverExtension)
      .toFactory((driver) => new ChromeDriverExtension(driver), [WebDriverAdapter])
];
