/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Inject, Injectable, OpaqueToken} from '@angular/core';

import {Options} from '../common_options';
import {Metric} from '../metric';
import {PerfLogEvent, PerfLogFeatures, WebDriverExtension} from '../web_driver_extension';


/**
 * A metric that reads out the performance log
 */
@Injectable()
export class PerflogMetric extends Metric {
  static SET_TIMEOUT = new OpaqueToken('PerflogMetric.setTimeout');
  static PROVIDERS = [
    PerflogMetric, {
      provide: PerflogMetric.SET_TIMEOUT,
      useValue: (fn: Function, millis: number) => <any>setTimeout(fn, millis)
    }
  ];

  private _remainingEvents: PerfLogEvent[];
  private _measureCount: number;
  private _perfLogFeatures: PerfLogFeatures;

  /**
   * @param driverExtension
   * @param setTimeout
   * @param microMetrics Name and description of metrics provided via console.time / console.timeEnd
   **/
  constructor(
      private _driverExtension: WebDriverExtension,
      @Inject(PerflogMetric.SET_TIMEOUT) private _setTimeout: Function,
      @Inject(Options.MICRO_METRICS) private _microMetrics: {[key: string]: string},
      @Inject(Options.FORCE_GC) private _forceGc: boolean,
      @Inject(Options.CAPTURE_FRAMES) private _captureFrames: boolean,
      @Inject(Options.RECEIVED_DATA) private _receivedData: boolean,
      @Inject(Options.REQUEST_COUNT) private _requestCount: boolean) {
    super();

    this._remainingEvents = [];
    this._measureCount = 0;
    this._perfLogFeatures = _driverExtension.perfLogFeatures();
    if (!this._perfLogFeatures.userTiming) {
      // User timing is needed for navigationStart.
      this._receivedData = false;
      this._requestCount = false;
    }
  }

  describe(): {[key: string]: string} {
    var res: {[key: string]: any} = {
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
    if (this._receivedData) {
      res['receivedData'] = 'encoded bytes received since navigationStart';
    }
    if (this._requestCount) {
      res['requestCount'] = 'count of requests sent since navigationStart';
    }
    if (this._captureFrames) {
      if (!this._perfLogFeatures.frameCapture) {
        var warningMsg = 'WARNING: Metric requested, but not supported by driver';
        // using dot syntax for metric name to keep them grouped together in console reporter
        res['frameTime.mean'] = warningMsg;
        res['frameTime.worst'] = warningMsg;
        res['frameTime.best'] = warningMsg;
        res['frameTime.smooth'] = warningMsg;
      } else {
        res['frameTime.mean'] = 'mean frame time in ms (target: 16.6ms for 60fps)';
        res['frameTime.worst'] = 'worst frame time in ms';
        res['frameTime.best'] = 'best frame time in ms';
        res['frameTime.smooth'] = 'percentage of frames that hit 60fps';
      }
    }
    for (let name in this._microMetrics) {
      res[name] = this._microMetrics[name];
    }
    return res;
  }

  beginMeasure(): Promise<any> {
    var resultPromise = Promise.resolve(null);
    if (this._forceGc) {
      resultPromise = resultPromise.then((_) => this._driverExtension.gc());
    }
    return resultPromise.then((_) => this._beginMeasure());
  }

  endMeasure(restart: boolean): Promise<{[key: string]: number}> {
    if (this._forceGc) {
      return this._endPlainMeasureAndMeasureForceGc(restart);
    } else {
      return this._endMeasure(restart);
    }
  }

  /** @internal */
  private _endPlainMeasureAndMeasureForceGc(restartMeasure: boolean) {
    return this._endMeasure(true).then((measureValues) => {
      // disable frame capture for measurements during forced gc
      var originalFrameCaptureValue = this._captureFrames;
      this._captureFrames = false;
      return this._driverExtension.gc()
          .then((_) => this._endMeasure(restartMeasure))
          .then((forceGcMeasureValues) => {
            this._captureFrames = originalFrameCaptureValue;
            measureValues['forcedGcTime'] = forceGcMeasureValues['gcTime'];
            measureValues['forcedGcAmount'] = forceGcMeasureValues['gcAmount'];
            return measureValues;
          });
    });
  }

  private _beginMeasure(): Promise<any> {
    return this._driverExtension.timeBegin(this._markName(this._measureCount++));
  }

  private _endMeasure(restart: boolean): Promise<{[key: string]: number}> {
    var markName = this._markName(this._measureCount - 1);
    var nextMarkName = restart ? this._markName(this._measureCount++) : null;
    return this._driverExtension.timeEnd(markName, nextMarkName)
        .then((_) => this._readUntilEndMark(markName));
  }

  private _readUntilEndMark(
      markName: string, loopCount: number = 0, startEvent: PerfLogEvent = null) {
    if (loopCount > _MAX_RETRY_COUNT) {
      throw new Error(`Tried too often to get the ending mark: ${loopCount}`);
    }
    return this._driverExtension.readPerfLog().then((events) => {
      this._addEvents(events);
      var result = this._aggregateEvents(this._remainingEvents, markName);
      if (result) {
        this._remainingEvents = events;
        return result;
      }
      var resolve: (result: any) => void;
      var promise = new Promise(res => { resolve = res; });
      this._setTimeout(() => resolve(this._readUntilEndMark(markName, loopCount + 1)), 100);
      return promise;
    });
  }

  private _addEvents(events: PerfLogEvent[]) {
    var needSort = false;
    events.forEach(event => {
      if (event['ph'] === 'X') {
        needSort = true;
        var startEvent: PerfLogEvent = {};
        var endEvent: PerfLogEvent = {};
        for (let prop in event) {
          startEvent[prop] = event[prop];
          endEvent[prop] = event[prop];
        }
        startEvent['ph'] = 'B';
        endEvent['ph'] = 'E';
        endEvent['ts'] = startEvent['ts'] + startEvent['dur'];
        this._remainingEvents.push(startEvent);
        this._remainingEvents.push(endEvent);
      } else {
        this._remainingEvents.push(event);
      }
    });
    if (needSort) {
      // Need to sort because of the ph==='X' events
      this._remainingEvents.sort((a, b) => {
        var diff = a['ts'] - b['ts'];
        return diff > 0 ? 1 : diff < 0 ? -1 : 0;
      });
    }
  }

  private _aggregateEvents(events: PerfLogEvent[], markName: string): {[key: string]: number} {
    var result: {[key: string]: number} = {'scriptTime': 0, 'pureScriptTime': 0};
    if (this._perfLogFeatures.gc) {
      result['gcTime'] = 0;
      result['majorGcTime'] = 0;
      result['gcAmount'] = 0;
    }
    if (this._perfLogFeatures.render) {
      result['renderTime'] = 0;
    }
    if (this._captureFrames) {
      result['frameTime.mean'] = 0;
      result['frameTime.best'] = 0;
      result['frameTime.worst'] = 0;
      result['frameTime.smooth'] = 0;
    }
    for (let name in this._microMetrics) {
      result[name] = 0;
    }
    if (this._receivedData) {
      result['receivedData'] = 0;
    }
    if (this._requestCount) {
      result['requestCount'] = 0;
    }

    var markStartEvent: PerfLogEvent = null;
    var markEndEvent: PerfLogEvent = null;
    events.forEach((event) => {
      var ph = event['ph'];
      var name = event['name'];
      if (ph === 'B' && name === markName) {
        markStartEvent = event;
      } else if (ph === 'I' && name === 'navigationStart') {
        // if a benchmark measures reload of a page, use the last
        // navigationStart as begin event
        markStartEvent = event;
      } else if (ph === 'E' && name === markName) {
        markEndEvent = event;
      }
    });
    if (!markStartEvent || !markEndEvent) {
      // not all events have been received, no further processing for now
      return null;
    }

    var gcTimeInScript = 0;
    var renderTimeInScript = 0;

    var frameTimestamps: number[] = [];
    var frameTimes: number[] = [];
    var frameCaptureStartEvent: PerfLogEvent = null;
    var frameCaptureEndEvent: PerfLogEvent = null;

    var intervalStarts: {[key: string]: PerfLogEvent} = {};
    var intervalStartCount: {[key: string]: number} = {};

    var inMeasureRange = false;
    events.forEach((event) => {
      var ph = event['ph'];
      var name = event['name'];
      var microIterations = 1;
      var microIterationsMatch = name.match(_MICRO_ITERATIONS_REGEX);
      if (microIterationsMatch) {
        name = microIterationsMatch[1];
        microIterations = parseInt(microIterationsMatch[2], 10);
      }
      if (event === markStartEvent) {
        inMeasureRange = true;
      } else if (event === markEndEvent) {
        inMeasureRange = false;
      }
      if (!inMeasureRange || event['pid'] !== markStartEvent['pid']) {
        return;
      }

      if (this._requestCount && name === 'sendRequest') {
        result['requestCount'] += 1;
      } else if (this._receivedData && name === 'receivedData' && ph === 'I') {
        result['receivedData'] += event['args']['encodedDataLength'];
      }
      if (ph === 'B' && name === _MARK_NAME_FRAME_CAPUTRE) {
        if (frameCaptureStartEvent) {
          throw new Error('can capture frames only once per benchmark run');
        }
        if (!this._captureFrames) {
          throw new Error(
              'found start event for frame capture, but frame capture was not requested in benchpress');
        }
        frameCaptureStartEvent = event;
      } else if (ph === 'E' && name === _MARK_NAME_FRAME_CAPUTRE) {
        if (!frameCaptureStartEvent) {
          throw new Error('missing start event for frame capture');
        }
        frameCaptureEndEvent = event;
      }

      if (ph === 'I' && frameCaptureStartEvent && !frameCaptureEndEvent && name === 'frame') {
        frameTimestamps.push(event['ts']);
        if (frameTimestamps.length >= 2) {
          frameTimes.push(
              frameTimestamps[frameTimestamps.length - 1] -
              frameTimestamps[frameTimestamps.length - 2]);
        }
      }

      if (ph === 'B') {
        if (!intervalStarts[name]) {
          intervalStartCount[name] = 1;
          intervalStarts[name] = event;
        } else {
          intervalStartCount[name]++;
        }
      } else if ((ph === 'E') && intervalStarts[name]) {
        intervalStartCount[name]--;
        if (intervalStartCount[name] === 0) {
          var startEvent = intervalStarts[name];
          var duration = (event['ts'] - startEvent['ts']);
          intervalStarts[name] = null;
          if (name === 'gc') {
            result['gcTime'] += duration;
            var amount =
                (startEvent['args']['usedHeapSize'] - event['args']['usedHeapSize']) / 1000;
            result['gcAmount'] += amount;
            var majorGc = event['args']['majorGc'];
            if (majorGc && majorGc) {
              result['majorGcTime'] += duration;
            }
            if (intervalStarts['script']) {
              gcTimeInScript += duration;
            }
          } else if (name === 'render') {
            result['renderTime'] += duration;
            if (intervalStarts['script']) {
              renderTimeInScript += duration;
            }
          } else if (name === 'script') {
            result['scriptTime'] += duration;
          } else if (this._microMetrics[name]) {
            (<any>result)[name] += duration / microIterations;
          }
        }
      }
    });

    if (frameCaptureStartEvent && !frameCaptureEndEvent) {
      throw new Error('missing end event for frame capture');
    }
    if (this._captureFrames && !frameCaptureStartEvent) {
      throw new Error('frame capture requested in benchpress, but no start event was found');
    }
    if (frameTimes.length > 0) {
      this._addFrameMetrics(result, frameTimes);
    }
    result['pureScriptTime'] = result['scriptTime'] - gcTimeInScript - renderTimeInScript;
    return result;
  }

  private _addFrameMetrics(result: {[key: string]: number}, frameTimes: any[]) {
    result['frameTime.mean'] = frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length;
    var firstFrame = frameTimes[0];
    result['frameTime.worst'] = frameTimes.reduce((a, b) => a > b ? a : b, firstFrame);
    result['frameTime.best'] = frameTimes.reduce((a, b) => a < b ? a : b, firstFrame);
    result['frameTime.smooth'] =
        frameTimes.filter(t => t < _FRAME_TIME_SMOOTH_THRESHOLD).length / frameTimes.length;
  }

  private _markName(index: number) { return `${_MARK_NAME_PREFIX}${index}`; }
}

var _MICRO_ITERATIONS_REGEX = /(.+)\*(\d+)$/;

var _MAX_RETRY_COUNT = 20;
var _MARK_NAME_PREFIX = 'benchpress';

var _MARK_NAME_FRAME_CAPUTRE = 'frameCapture';
// using 17ms as a somewhat looser threshold, instead of 16.6666ms
var _FRAME_TIME_SMOOTH_THRESHOLD = 17;
