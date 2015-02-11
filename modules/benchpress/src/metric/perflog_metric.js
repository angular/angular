import { PromiseWrapper, Promise } from 'angular2/src/facade/async';
import { isPresent, isBlank, int, BaseException, StringWrapper } from 'angular2/src/facade/lang';
import { ListWrapper } from 'angular2/src/facade/collection';
import { bind, OpaqueToken } from 'angular2/di';

import { WebDriverExtension } from '../web_driver_extension';
import { Metric } from '../metric';

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

  constructor(driverExtension:WebDriverExtension, setTimeout:Function) {
    super();
    this._driverExtension = driverExtension;
    this._remainingEvents = [];
    this._measureCount = 0;
    this._setTimeout = setTimeout;
  }

  describe() {
    return {
      'script': 'script execution time in ms',
      'render': 'render time in ms',
      'gcTime': 'gc time in ms',
      'gcAmount': 'gc amount in bytes',
      'gcTimeInScript': 'gc time during script execution in ms',
      'gcAmountInScript': 'gc amount during script execution in bytes'
    };
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

  _readUntilEndMark(markName:string, loopCount:int = 0) {
    return this._driverExtension.readPerfLog().then( (events) => {
      this._remainingEvents = ListWrapper.concat(this._remainingEvents, events);
      if (loopCount > _MAX_RETRY_COUNT) {
        throw new BaseException(`Tried too often to get the ending mark: ${loopCount}`);
      }
      var result = this._aggregateEvents(
        this._remainingEvents, markName
      );
      if (isPresent(result)) {
        this._remainingEvents = events;
        return result;
      }
      var completer = PromiseWrapper.completer();
      this._setTimeout(
        () => completer.complete(this._readUntilEndMark(markName, loopCount+1)),
        100
      );
      return completer.promise;
    });
  }

  _aggregateEvents(events, markName) {
    var result = {
      'script': 0,
      'render': 0,
      'gcTime': 0,
      'gcAmount': 0,
      'gcTimeInScript': 0,
      'gcAmountInScript': 0
    };

    var startMarkFound = false;
    var endMarkFound = false;
    if (isBlank(markName)) {
      startMarkFound = true;
      endMarkFound = true;
    }

    var intervalStarts = {};
    events.forEach( (event) => {
      var ph = event['ph'];
      var name = event['name'];
      var ts = event['ts'];
      var args = event['args'];
      if (StringWrapper.equals(ph, 'b') && StringWrapper.equals(name, markName)) {
        startMarkFound = true;
      } else if (StringWrapper.equals(ph, 'e') && StringWrapper.equals(name, markName)) {
        endMarkFound = true;
      }
      if (startMarkFound && !endMarkFound) {
        if (StringWrapper.equals(ph, 'B')) {
          intervalStarts[name] = ts;
        } else if (StringWrapper.equals(ph, 'E') && isPresent(intervalStarts[name])) {
          var diff = ts - intervalStarts[name];
          intervalStarts[name] = null;
          if (StringWrapper.equals(name, 'gc')) {
            result['gcTime'] += diff;
            var gcAmount = 0;
            if (isPresent(args)) {
              gcAmount = args['amount'];
            }
            result['gcAmount'] += gcAmount;
            if (isPresent(intervalStarts['script'])) {
              result['gcTimeInScript'] += diff;
              result['gcAmountInScript'] += gcAmount;
            }
          } else {
            result[name] += diff;
          }
        }
      }
    });
    result['script'] -= result['gcTimeInScript'];
    return startMarkFound && endMarkFound ? result : null;
  }

  _markName(index) {
    return `${_MARK_NAME_PREFIX}${index}`;
  }
}

var _MAX_RETRY_COUNT = 20;
var _MARK_NAME_PREFIX = 'benchpress';
var _SET_TIMEOUT = new OpaqueToken('PerflogMetric.setTimeout');
var _BINDINGS = [
  bind(Metric).toFactory(
    (driverExtension, setTimeout) => new PerflogMetric(driverExtension, setTimeout),
    [WebDriverExtension, _SET_TIMEOUT]
  ),
  bind(_SET_TIMEOUT).toValue( (fn, millis) => PromiseWrapper.setTimeout(fn, millis) )
];