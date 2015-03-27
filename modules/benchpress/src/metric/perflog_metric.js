import { PromiseWrapper, Promise } from 'angular2/src/facade/async';
import {
  isPresent, isBlank, int, BaseException, StringWrapper, Math, RegExpWrapper, NumberWrapper
} from 'angular2/src/facade/lang';
import { ListWrapper, StringMap, StringMapWrapper } from 'angular2/src/facade/collection';
import { bind, OpaqueToken } from 'angular2/di';

import { WebDriverExtension, PerfLogFeatures } from '../web_driver_extension';
import { Metric } from '../metric';
import { Options } from '../common_options';

/**
 * A metric that reads out the performance log
 */
export class PerflogMetric extends Metric {
  // TODO(tbosch): use static values when our transpiler supports them
  static get BINDINGS() { return _BINDINGS; }
  // TODO(tbosch): use static values when our transpiler supports them
  static get SET_TIMEOUT() { return _SET_TIMEOUT; }

  _driverExtension:WebDriverExtension;
  _remainingEvents:List;
  _measureCount:int;
  _setTimeout:Function;
  _microMetrics:StringMap<string, string>;
  _perfLogFeatures:PerfLogFeatures;

  /**
   * @param driverExtension
   * @param setTimeout
   * @param microMetrics Name and description of metrics provided via console.time / console.timeEnd
   **/
  constructor(driverExtension:WebDriverExtension, setTimeout:Function, microMetrics:StringMap<string, string>) {
    super();
    this._driverExtension = driverExtension;
    this._remainingEvents = [];
    this._measureCount = 0;
    this._setTimeout = setTimeout;
    this._microMetrics = microMetrics;
    this._perfLogFeatures = driverExtension.perfLogFeatures();
  }

  describe():StringMap {
    var res = {
      'scriptTime': 'script execution time in ms, including gc and render',
      'pureScriptTime': 'script execution time in ms, without gc nor render'
    };
    if (this._perfLogFeatures.render) {
      res['renderTime'] = 'render time in and ouside of script in ms';
    }
    if (this._perfLogFeatures.gc) {
      res['gcTime'] = 'gc time in and ouside of script in ms';
      res['gcAmount'] = 'gc amount in kbytes';
      res['majorGcTime'] = 'time of major gcs in ms';
    }
    StringMapWrapper.forEach(this._microMetrics, (desc, name) => {
      StringMapWrapper.set(res, name, desc);
    });
    return res;
  }

  beginMeasure():Promise {
    return this._driverExtension.timeBegin(this._markName(this._measureCount++));
  }

  endMeasure(restart:boolean):Promise<Object> {
    var markName = this._markName(this._measureCount-1);
    var nextMarkName = restart ? this._markName(this._measureCount++) : null;
    return this._driverExtension.timeEnd(markName, nextMarkName)
      .then( (_) => this._readUntilEndMark(markName) );
  }

  _readUntilEndMark(markName:string, loopCount:int = 0, startEvent = null) {
    if (loopCount > _MAX_RETRY_COUNT) {
      throw new BaseException(`Tried too often to get the ending mark: ${loopCount}`);
    }
    return this._driverExtension.readPerfLog().then( (events) => {
      this._addEvents(events);
      var result = this._aggregateEvents(
        this._remainingEvents, markName
      );
      if (isPresent(result)) {
        this._remainingEvents = events;
        return result;
      }
      var completer = PromiseWrapper.completer();
      this._setTimeout(
        () => completer.resolve(this._readUntilEndMark(markName, loopCount+1)),
        100
      );
      return completer.promise;
    });
  }

  _addEvents(events) {
    var needSort = false;
    ListWrapper.forEach(events, (event) => {
      if (StringWrapper.equals(event['ph'], 'X')) {
        needSort = true;
        var startEvent = {};
        var endEvent = {};
        StringMapWrapper.forEach(event, (value, prop) => {
          startEvent[prop] = value;
          endEvent[prop] = value;
        });
        startEvent['ph'] = 'B';
        endEvent['ph'] = 'E';
        endEvent['ts'] = startEvent['ts'] + startEvent['dur'];
        ListWrapper.push(this._remainingEvents, startEvent);
        ListWrapper.push(this._remainingEvents, endEvent);
      } else {
        ListWrapper.push(this._remainingEvents, event);
      }
    });
    if (needSort) {
      // Need to sort because of the ph==='X' events
      ListWrapper.sort(this._remainingEvents, (a,b) => {
        var diff = a['ts'] - b['ts'];
        return diff > 0
            ? 1
            : diff < 0
                ? -1
                : 0;
      });
    }
  }

  _aggregateEvents(events, markName) {
    var result = {
      'scriptTime': 0,
      'pureScriptTime': 0
    };
    if (this._perfLogFeatures.gc) {
      result['gcTime'] = 0;
      result['majorGcTime'] = 0;
      result['gcAmount'] = 0;
    }
    if (this._perfLogFeatures.render) {
      result['renderTime'] = 0;
    }
    StringMapWrapper.forEach(this._microMetrics, (desc, name) => {
      result[name] = 0;
    });

    var markStartEvent = null;
    var markEndEvent = null;
    var gcTimeInScript = 0;
    var renderTimeInScript = 0;

    var intervalStarts = {};
    events.forEach( (event) => {
      var ph = event['ph'];
      var name = event['name'];
      var microIterations = 1;
      var microIterationsMatch = RegExpWrapper.firstMatch(_MICRO_ITERATIONS_REGEX, name);
      if (isPresent(microIterationsMatch)) {
        name = microIterationsMatch[1];
        microIterations = NumberWrapper.parseInt(microIterationsMatch[2], 10);
      }

      if (StringWrapper.equals(ph, 'b') && StringWrapper.equals(name, markName)) {
        markStartEvent = event;
      } else if (StringWrapper.equals(ph, 'e') && StringWrapper.equals(name, markName)) {
        markEndEvent = event;
      }
      if (isPresent(markStartEvent) && isBlank(markEndEvent) && event['pid'] === markStartEvent['pid']) {
        if (StringWrapper.equals(ph, 'B') || StringWrapper.equals(ph, 'b')) {
          intervalStarts[name] = event;
        } else if ((StringWrapper.equals(ph, 'E') || StringWrapper.equals(ph, 'e')) && isPresent(intervalStarts[name])) {
          var startEvent = intervalStarts[name];
          var duration = (event['ts'] - startEvent['ts']);
          intervalStarts[name] = null;
          if (StringWrapper.equals(name, 'gc')) {
            result['gcTime'] += duration;
            var amount = (startEvent['args']['usedHeapSize'] - event['args']['usedHeapSize']) / 1000;
            result['gcAmount'] += amount;
            var majorGc = event['args']['majorGc'];
            if (isPresent(majorGc) && majorGc) {
              result['majorGcTime'] += duration;
            }
            if (isPresent(intervalStarts['script'])) {
              gcTimeInScript += duration;
            }
          } else if (StringWrapper.equals(name, 'render')) {
            result['renderTime'] += duration;
            if (isPresent(intervalStarts['script'])) {
              renderTimeInScript += duration;
            }
          } else if (StringWrapper.equals(name, 'script')) {
            result['scriptTime'] += duration;
          } else if (isPresent(this._microMetrics[name])) {
            result[name] += duration / microIterations;
          }
        }
      }
    });
    result['pureScriptTime'] = result['scriptTime'] - gcTimeInScript - renderTimeInScript;
    return isPresent(markStartEvent) && isPresent(markEndEvent) ? result : null;
  }

  _markName(index) {
    return `${_MARK_NAME_PREFIX}${index}`;
  }
}

var _MICRO_ITERATIONS_REGEX = RegExpWrapper.create('(.+)\\*(\\d+)$');

var _MAX_RETRY_COUNT = 20;
var _MARK_NAME_PREFIX = 'benchpress';
var _SET_TIMEOUT = new OpaqueToken('PerflogMetric.setTimeout');
var _BINDINGS = [
  bind(PerflogMetric).toFactory(
    (driverExtension, setTimeout, microMetrics) =>
      new PerflogMetric(driverExtension, setTimeout, microMetrics),
    [WebDriverExtension, _SET_TIMEOUT, Options.MICRO_METRICS]
  ),
  bind(_SET_TIMEOUT).toValue( (fn, millis) => PromiseWrapper.setTimeout(fn, millis) )
];
