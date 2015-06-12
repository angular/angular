import {PromiseWrapper, Promise, TimerWrapper} from 'angular2/src/facade/async';
import {
  isPresent,
  isBlank,
  BaseException,
  StringWrapper,
  Math,
  RegExpWrapper,
  NumberWrapper
} from 'angular2/src/facade/lang';
import {ListWrapper, StringMap, StringMapWrapper} from 'angular2/src/facade/collection';
import {bind, Binding, OpaqueToken} from 'angular2/di';

import {WebDriverExtension, PerfLogFeatures} from '../web_driver_extension';
import {Metric} from '../metric';
import {Options} from '../common_options';

/**
 * A metric that reads out the performance log
 */
export class PerflogMetric extends Metric {
  // TODO(tbosch): use static values when our transpiler supports them
  static get BINDINGS(): List<Binding> { return _BINDINGS; }
  // TODO(tbosch): use static values when our transpiler supports them
  static get SET_TIMEOUT(): OpaqueToken { return _SET_TIMEOUT; }

  private _remainingEvents: List<StringMap<string, any>>;
  private _measureCount: int;
  _perfLogFeatures: PerfLogFeatures;


  /**
   * @param driverExtension
   * @param setTimeout
   * @param microMetrics Name and description of metrics provided via console.time / console.timeEnd
   **/
  constructor(private _driverExtension: WebDriverExtension, private _setTimeout: Function,
              private _microMetrics: StringMap<string, any>, private _forceGc: boolean,
              private _captureFrames: boolean) {
    super();

    this._remainingEvents = [];
    this._measureCount = 0;
    this._perfLogFeatures = _driverExtension.perfLogFeatures();
  }

  describe(): StringMap<string, any> {
    var res = {
      'scriptTime': 'script execution time in ms, including gc and render',
      'pureScriptTime': 'script execution time in ms, without gc nor render'
    };
    if (this._perfLogFeatures.render) {
      res['renderTime'] = 'render time in ms';
    }
    if (this._perfLogFeatures.gc) {
      res['gcTime'] = 'gc time in ms';
      res['gcAmount'] = 'gc amount in kbytes';
      res['majorGcTime'] = 'time of major gcs in ms';
      if (this._forceGc) {
        res['forcedGcTime'] = 'forced gc time in ms';
        res['forcedGcAmount'] = 'forced gc amount in kbytes';
      }
    }
    if (this._captureFrames) {
      res['meanFrameTime'] = this._perfLogFeatures.frameCapture ?
                                 'mean frame time in ms (target: 16.6ms for 60fps)' :
                                 'WARNING: Metric requested, but not supported by driver';
    }
    StringMapWrapper.forEach(this._microMetrics,
                             (desc, name) => { StringMapWrapper.set(res, name, desc); });
    return res;
  }

  beginMeasure(): Promise<any> {
    var resultPromise = PromiseWrapper.resolve(null);
    if (this._forceGc) {
      resultPromise = resultPromise.then((_) => this._driverExtension.gc());
    }
    return resultPromise.then((_) => this._beginMeasure());
  }

  endMeasure(restart: boolean): Promise<StringMap<string, any>> {
    if (this._forceGc) {
      return this._endPlainMeasureAndMeasureForceGc(restart);
    } else {
      return this._endMeasure(restart);
    }
  }

  _endPlainMeasureAndMeasureForceGc(restartMeasure: boolean) {
    return this._endMeasure(true).then((measureValues) => {
      // disable frame capture for measurments during forced gc
      var originalFrameCaptureValue = this._captureFrames;
      this._captureFrames = false;
      return this._driverExtension.gc()
          .then((_) => this._endMeasure(restartMeasure))
          .then((forceGcMeasureValues) => {
            this._captureFrames = originalFrameCaptureValue;
            StringMapWrapper.set(measureValues, 'forcedGcTime', forceGcMeasureValues['gcTime']);
            StringMapWrapper.set(measureValues, 'forcedGcAmount', forceGcMeasureValues['gcAmount']);
            return measureValues;
          });
    });
  }

  _beginMeasure(): Promise<any> {
    return this._driverExtension.timeBegin(this._markName(this._measureCount++));
  }

  _endMeasure(restart: boolean): Promise<StringMap<string, any>> {
    var markName = this._markName(this._measureCount - 1);
    var nextMarkName = restart ? this._markName(this._measureCount++) : null;
    return this._driverExtension.timeEnd(markName, nextMarkName)
        .then((_) => this._readUntilEndMark(markName));
  }

  _readUntilEndMark(markName: string, loopCount: int = 0, startEvent = null) {
    if (loopCount > _MAX_RETRY_COUNT) {
      throw new BaseException(`Tried too often to get the ending mark: ${loopCount}`);
    }
    return this._driverExtension.readPerfLog().then((events) => {
      this._addEvents(events);
      var result = this._aggregateEvents(this._remainingEvents, markName);
      if (isPresent(result)) {
        this._remainingEvents = events;
        return result;
      }
      var completer = PromiseWrapper.completer();
      this._setTimeout(() => completer.resolve(this._readUntilEndMark(markName, loopCount + 1)),
                       100);
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
      ListWrapper.sort(this._remainingEvents, (a, b) => {
        var diff = a['ts'] - b['ts'];
        return diff > 0 ? 1 : diff < 0 ? -1 : 0;
      });
    }
  }

  _aggregateEvents(events: List<StringMap<string, any>>, markName): StringMap<string, any> {
    var result = {'scriptTime': 0, 'pureScriptTime': 0};
    if (this._perfLogFeatures.gc) {
      result['gcTime'] = 0;
      result['majorGcTime'] = 0;
      result['gcAmount'] = 0;
    }
    if (this._perfLogFeatures.render) {
      result['renderTime'] = 0;
    }
    if (this._captureFrames) {
      result['meanFrameTime'] = 0;
    }
    StringMapWrapper.forEach(this._microMetrics, (desc, name) => { result[name] = 0; });

    var markStartEvent = null;
    var markEndEvent = null;
    var gcTimeInScript = 0;
    var renderTimeInScript = 0;

    var frameTimestamps = [];
    var frameTimes = [];
    var frameCaptureStartEvent = null;
    var frameCaptureEndEvent = null;

    var intervalStarts: StringMap<string, any> = {};
    var intervalStartCount: StringMap<string, number> = {};
    events.forEach((event) => {
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

      if (isPresent(markStartEvent) && isBlank(markEndEvent) &&
          event['pid'] === markStartEvent['pid']) {
        if (StringWrapper.equals(ph, 'b') && StringWrapper.equals(name, _MARK_NAME_FRAME_CAPUTRE)) {
          if (isPresent(frameCaptureStartEvent)) {
            throw new BaseException('can capture frames only once per benchmark run');
          }
          if (!this._captureFrames) {
            throw new BaseException(
                'found start event for frame capture, but frame capture was not requested in benchpress')
          }
          frameCaptureStartEvent = event;
        } else if (StringWrapper.equals(ph, 'e') &&
                   StringWrapper.equals(name, _MARK_NAME_FRAME_CAPUTRE)) {
          if (isBlank(frameCaptureStartEvent)) {
            throw new BaseException('missing start event for frame capture');
          }
          frameCaptureEndEvent = event;
        }

        if (StringWrapper.equals(ph, 'I') || StringWrapper.equals(ph, 'i')) {
          if (isPresent(frameCaptureStartEvent) && isBlank(frameCaptureEndEvent) &&
              StringWrapper.equals(name, 'frame')) {
            ListWrapper.push(frameTimestamps, event['ts']);
            if (frameTimestamps.length >= 2) {
              ListWrapper.push(frameTimes, frameTimestamps[frameTimestamps.length - 1] -
                                               frameTimestamps[frameTimestamps.length - 2]);
            }
          }
        }

        if (StringWrapper.equals(ph, 'B') || StringWrapper.equals(ph, 'b')) {
          if (isBlank(intervalStarts[name])) {
            intervalStartCount[name] = 1;
            intervalStarts[name] = event;
          } else {
            intervalStartCount[name]++;
          }
        } else if ((StringWrapper.equals(ph, 'E') || StringWrapper.equals(ph, 'e')) &&
                   isPresent(intervalStarts[name])) {
          intervalStartCount[name]--;
          if (intervalStartCount[name] === 0) {
            var startEvent = intervalStarts[name];
            var duration = (event['ts'] - startEvent['ts']);
            intervalStarts[name] = null;
            if (StringWrapper.equals(name, 'gc')) {
              result['gcTime'] += duration;
              var amount =
                  (startEvent['args']['usedHeapSize'] - event['args']['usedHeapSize']) / 1000;
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
      }
    });
    if (!isPresent(markStartEvent) || !isPresent(markEndEvent)) {
      // not all events have been received, no further processing for now
      return null;
    }

    if (isPresent(markEndEvent) && isPresent(frameCaptureStartEvent) &&
        isBlank(frameCaptureEndEvent)) {
      throw new BaseException('missing end event for frame capture');
    }
    if (this._captureFrames && isBlank(frameCaptureStartEvent)) {
      throw new BaseException(
          'frame capture requested in benchpress, but no start event was found');
    }
    if (frameTimes.length > 0) {
      result['meanFrameTime'] =
          ListWrapper.reduce(frameTimes, (a, b) => a + b, 0) / frameTimes.length;
    }
    result['pureScriptTime'] = result['scriptTime'] - gcTimeInScript - renderTimeInScript;
    return result;
  }

  _markName(index) { return `${_MARK_NAME_PREFIX}${index}`; }
}
var _MICRO_ITERATIONS_REGEX = RegExpWrapper.create('(.+)\\*(\\d+)$');

var _MAX_RETRY_COUNT = 20;
var _MARK_NAME_PREFIX = 'benchpress';
var _SET_TIMEOUT = new OpaqueToken('PerflogMetric.setTimeout');

var _MARK_NAME_FRAME_CAPUTRE = 'frameCapture';

var _BINDINGS = [
  bind(PerflogMetric)
      .toFactory(
          (driverExtension, setTimeout, microMetrics, forceGc, captureFrames) =>
              new PerflogMetric(driverExtension, setTimeout, microMetrics, forceGc, captureFrames),
          [
            WebDriverExtension,
            _SET_TIMEOUT,
            Options.MICRO_METRICS,
            Options.FORCE_GC,
            Options.CAPTURE_FRAMES
          ]),
  bind(_SET_TIMEOUT).toValue((fn, millis) => TimerWrapper.setTimeout(fn, millis))
];
