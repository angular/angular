/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Injectable} from '@angular/core';

import {WebDriverAdapter} from '../web_driver_adapter';
import {PerfLogEvent, PerfLogFeatures, WebDriverExtension} from '../web_driver_extension';

@Injectable()
export class IOsDriverExtension extends WebDriverExtension {
  static PROVIDERS = [{provide: IOsDriverExtension, deps: [WebDriverAdapter]}];

  constructor(private _driver: WebDriverAdapter) {
    super();
  }

  override gc(): Promise<any> {
    throw new Error('Force GC is not supported on iOS');
  }

  override timeBegin(name: string): Promise<any> {
    return this._driver.executeScript(`console.time('${name}');`);
  }

  override timeEnd(name: string, restartName: string | null = null): Promise<any> {
    let script = `console.timeEnd('${name}');`;
    if (restartName != null) {
      script += `console.time('${restartName}');`;
    }
    return this._driver.executeScript(script);
  }

  // See https://github.com/WebKit/webkit/tree/master/Source/WebInspectorUI/Versions
  override readPerfLog() {
    // TODO(tbosch): Bug in IOsDriver: Need to execute at least one command
    // so that the browser logs can be read out!
    return this._driver
      .executeScript('1+1')
      .then((_) => this._driver.logs('performance'))
      .then((entries) => {
        const records: any[] = [];
        entries.forEach((entry: any) => {
          const message = (
            JSON.parse(entry['message']) as {message: {method: string; params: PerfLogEvent}}
          )['message'];
          if (message['method'] === 'Timeline.eventRecorded') {
            records.push(message['params']['record']);
          }
        });
        return this._convertPerfRecordsToEvents(records);
      });
  }

  /** @internal */
  private _convertPerfRecordsToEvents(records: any[], events: PerfLogEvent[] | null = null) {
    if (!events) {
      events = [];
    }
    records.forEach((record) => {
      let endEvent: PerfLogEvent | null = null;
      const type = record['type'];
      const data = record['data'];
      const startTime = record['startTime'];
      const endTime = record['endTime'];

      if (type === 'FunctionCall' && (data == null || data['scriptName'] !== 'InjectedScript')) {
        events!.push(createStartEvent('script', startTime));
        endEvent = createEndEvent('script', endTime);
      } else if (type === 'Time') {
        events!.push(createMarkStartEvent(data['message'], startTime));
      } else if (type === 'TimeEnd') {
        events!.push(createMarkEndEvent(data['message'], startTime));
      } else if (
        type === 'RecalculateStyles' ||
        type === 'Layout' ||
        type === 'UpdateLayerTree' ||
        type === 'Paint' ||
        type === 'Rasterize' ||
        type === 'CompositeLayers'
      ) {
        events!.push(createStartEvent('render', startTime));
        endEvent = createEndEvent('render', endTime);
      }
      // Note: ios used to support GCEvent up until iOS 6 :-(
      if (record['children'] != null) {
        this._convertPerfRecordsToEvents(record['children'], events);
      }
      if (endEvent != null) {
        events!.push(endEvent);
      }
    });
    return events;
  }

  override perfLogFeatures(): PerfLogFeatures {
    return new PerfLogFeatures({render: true});
  }

  override supports(capabilities: {[key: string]: any}): boolean {
    return capabilities['browserName'].toLowerCase() === 'safari';
  }
}

function createEvent(
  ph: 'X' | 'B' | 'E' | 'B' | 'E',
  name: string,
  time: number,
  args: any = null,
) {
  const result: PerfLogEvent = {
    'cat': 'timeline',
    'name': name,
    'ts': time,
    'ph': ph,
    // The ios protocol does not support the notions of multiple processes in
    // the perflog...
    'pid': 'pid0',
  };
  if (args != null) {
    result['args'] = args;
  }
  return result;
}

function createStartEvent(name: string, time: number, args: any = null) {
  return createEvent('B', name, time, args);
}

function createEndEvent(name: string, time: number, args: any = null) {
  return createEvent('E', name, time, args);
}

function createMarkStartEvent(name: string, time: number) {
  return createEvent('B', name, time);
}

function createMarkEndEvent(name: string, time: number) {
  return createEvent('E', name, time);
}
