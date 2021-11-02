/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {InjectionToken} from '@angular/core';
import * as fs from 'fs';

export class Options {
  static SAMPLE_ID = new InjectionToken('Options.sampleId');
  static DEFAULT_DESCRIPTION = new InjectionToken('Options.defaultDescription');
  static SAMPLE_DESCRIPTION = new InjectionToken('Options.sampleDescription');
  static FORCE_GC = new InjectionToken('Options.forceGc');
  static NO_PREPARE = () => true;
  static PREPARE = new InjectionToken('Options.prepare');
  static EXECUTE = new InjectionToken('Options.execute');
  static CAPABILITIES = new InjectionToken('Options.capabilities');
  static USER_AGENT = new InjectionToken('Options.userAgent');
  static MICRO_METRICS = new InjectionToken('Options.microMetrics');
  static USER_METRICS = new InjectionToken('Options.userMetrics');
  static NOW = new InjectionToken('Options.now');
  static WRITE_FILE = new InjectionToken('Options.writeFile');
  static RECEIVED_DATA = new InjectionToken('Options.receivedData');
  static REQUEST_COUNT = new InjectionToken('Options.requestCount');
  static CAPTURE_FRAMES = new InjectionToken('Options.frameCapture');
  static RAW_PERFLOG_PATH = new InjectionToken('Options.rawPerflogPath');
  static DEFAULT_PROVIDERS = [
    {provide: Options.DEFAULT_DESCRIPTION, useValue: {}},
    {provide: Options.SAMPLE_DESCRIPTION, useValue: {}},
    {provide: Options.FORCE_GC, useValue: false},
    {provide: Options.PREPARE, useValue: Options.NO_PREPARE},
    {provide: Options.MICRO_METRICS, useValue: {}}, {provide: Options.USER_METRICS, useValue: {}},
    {provide: Options.NOW, useValue: () => new Date()},
    {provide: Options.RECEIVED_DATA, useValue: false},
    {provide: Options.REQUEST_COUNT, useValue: false},
    {provide: Options.CAPTURE_FRAMES, useValue: false},
    {provide: Options.WRITE_FILE, useValue: writeFile},
    {provide: Options.RAW_PERFLOG_PATH, useValue: null}
  ];
}

function writeFile(filename: string, content: string): Promise<any> {
  return new Promise<void>(function(resolve, reject) {
    fs.writeFile(filename, content, (error) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
}
