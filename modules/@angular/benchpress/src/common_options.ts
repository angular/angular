/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {OpaqueToken} from '@angular/core';
import * as fs from 'fs';

export class Options {
  static SAMPLE_ID = new OpaqueToken('Options.sampleId');
  static DEFAULT_DESCRIPTION = new OpaqueToken('Options.defaultDescription');
  static SAMPLE_DESCRIPTION = new OpaqueToken('Options.sampleDescription');
  static FORCE_GC = new OpaqueToken('Options.forceGc');
  static NO_PREPARE = () => true;
  static PREPARE = new OpaqueToken('Options.prepare');
  static EXECUTE = new OpaqueToken('Options.execute');
  static CAPABILITIES = new OpaqueToken('Options.capabilities');
  static USER_AGENT = new OpaqueToken('Options.userAgent');
  static MICRO_METRICS = new OpaqueToken('Options.microMetrics');
  static USER_METRICS = new OpaqueToken('Options.userMetrics');
  static NOW = new OpaqueToken('Options.now');
  static WRITE_FILE = new OpaqueToken('Options.writeFile');
  static RECEIVED_DATA = new OpaqueToken('Options.receivedData');
  static REQUEST_COUNT = new OpaqueToken('Options.requestCount');
  static CAPTURE_FRAMES = new OpaqueToken('Options.frameCapture');
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
    {provide: Options.WRITE_FILE, useValue: writeFile}
  ];
}

function writeFile(filename: string, content: string): Promise<any> {
  return new Promise(function(resolve, reject) {
    fs.writeFile(filename, content, (error) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
}
