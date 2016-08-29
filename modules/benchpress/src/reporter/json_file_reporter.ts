/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {OpaqueToken} from '@angular/core/src/di';
import {DateWrapper, Json, isBlank, isPresent} from '@angular/facade/src/lang';

import {Options} from '../common_options';
import {MeasureValues} from '../measure_values';
import {Reporter} from '../reporter';
import {SampleDescription} from '../sample_description';


/**
 * A reporter that writes results into a json file.
 */
export class JsonFileReporter extends Reporter {
  // TODO(tbosch): use static values when our transpiler supports them
  static get PATH(): OpaqueToken { return _PATH; }
  // TODO(tbosch): use static values when our transpiler supports them
  static get PROVIDERS(): any[] { return _PROVIDERS; }

  /** @internal */
  private _writeFile: Function;
  /** @internal */
  private _path: string;
  /** @internal */
  private _description: SampleDescription;
  /** @internal */
  private _now: Function;

  constructor(sampleDescription, path, writeFile, now) {
    super();
    this._description = sampleDescription;
    this._path = path;
    this._writeFile = writeFile;
    this._now = now;
  }

  reportMeasureValues(measureValues: MeasureValues): Promise<any> { return Promise.resolve(null); }

  reportSample(completeSample: MeasureValues[], validSample: MeasureValues[]): Promise<any> {
    var content = Json.stringify({
      'description': this._description,
      'completeSample': completeSample,
      'validSample': validSample
    });
    var filePath =
        `${this._path}/${this._description.id}_${DateWrapper.toMillis(this._now())}.json`;
    return this._writeFile(filePath, content);
  }
}

var _PATH = new OpaqueToken('JsonFileReporter.path');
var _PROVIDERS = [
  {
    provide: JsonFileReporter,
    useFactory: (sampleDescription, path, writeFile, now) =>
                    new JsonFileReporter(sampleDescription, path, writeFile, now),
    deps: [SampleDescription, _PATH, Options.WRITE_FILE, Options.NOW]
  },
  {provide: _PATH, useValue: '.'}
];
