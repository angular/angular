/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injector, OpaqueToken} from '@angular/core';

import {Options} from './common_options';
import {isBlank, isPresent} from './facade/lang';

export type PerfLogEvent = {
  cat?: string,
  ph?: 'X' | 'B' | 'E' | 'b' | 'e',
  ts?: number,
  dur?: number,
  name?: string,
  pid?: string,
  args?: {encodedDataLength?: number, usedHeapSize?: number, majorGc?: number}
};

/**
 * A WebDriverExtension implements extended commands of the webdriver protocol
 * for a given browser, independent of the WebDriverAdapter.
 * Needs one implementation for every supported Browser.
 */
export abstract class WebDriverExtension {
  static provideFirstSupported(childTokens: any[]): any[] {
    var res = [
      {
        provide: _CHILDREN,
        useFactory: (injector: Injector) => childTokens.map(token => injector.get(token)),
        deps: [Injector]
      },
      {
        provide: WebDriverExtension,
        useFactory: (children: WebDriverExtension[], capabilities: any) => {
          var delegate: WebDriverExtension;
          children.forEach(extension => {
            if (extension.supports(capabilities)) {
              delegate = extension;
            }
          });
          if (isBlank(delegate)) {
            throw new Error('Could not find a delegate for given capabilities!');
          }
          return delegate;
        },
        deps: [_CHILDREN, Options.CAPABILITIES]
      }
    ];
    return res;
  }

  gc(): Promise<any> { throw new Error('NYI'); }

  timeBegin(name: string): Promise<any> { throw new Error('NYI'); }

  timeEnd(name: string, restartName: string): Promise<any> { throw new Error('NYI'); }

  /**
   * Format:
   * - cat: category of the event
   * - name: event name: 'script', 'gc', 'render', ...
   * - ph: phase: 'B' (begin), 'E' (end), 'b' (nestable start), 'e' (nestable end), 'X' (Complete
   *event)
   * - ts: timestamp in ms, e.g. 12345
   * - pid: process id
   * - args: arguments, e.g. {heapSize: 1234}
   *
   * Based on [Chrome Trace Event
   *Format](https://docs.google.com/document/d/1CvAClvFfyA5R-PhYUmn5OOQtYMH4h6I0nSsKchNAySU/edit)
   **/
  readPerfLog(): Promise<PerfLogEvent[]> { throw new Error('NYI'); }

  perfLogFeatures(): PerfLogFeatures { throw new Error('NYI'); }

  supports(capabilities: {[key: string]: any}): boolean { return true; }
}

export class PerfLogFeatures {
  render: boolean;
  gc: boolean;
  frameCapture: boolean;
  userTiming: boolean;

  constructor(
      {render = false, gc = false, frameCapture = false, userTiming = false}:
          {render?: boolean, gc?: boolean, frameCapture?: boolean, userTiming?: boolean} = {}) {
    this.render = render;
    this.gc = gc;
    this.frameCapture = frameCapture;
    this.userTiming = userTiming;
  }
}

var _CHILDREN = new OpaqueToken('WebDriverExtension.children');
