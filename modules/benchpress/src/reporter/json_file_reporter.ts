import {DateWrapper, isPresent, isBlank, Json} from 'angular2/src/facade/lang';
import {List} from 'angular2/src/facade/collection';
import {Promise, PromiseWrapper} from 'angular2/src/facade/async';

import {bind, Binding, OpaqueToken} from 'angular2/di';

import {Reporter} from '../reporter';
import {SampleDescription} from '../sample_description';
import {MeasureValues} from '../measure_values';
import {Options} from '../common_options';

/**
 * A reporter that writes results into a json file.
 */
export class JsonFileReporter extends Reporter {
  // TODO(tbosch): use static values when our transpiler supports them
  static get PATH(): OpaqueToken { return _PATH; }
  // TODO(tbosch): use static values when our transpiler supports them
  static get BINDINGS(): List<Binding> { return _BINDINGS; }

  _writeFile: Function;
  _path: string;
  _description: SampleDescription;
  _now: Function;

  constructor(sampleDescription, path, writeFile, now) {
    super();
    this._description = sampleDescription;
    this._path = path;
    this._writeFile = writeFile;
    this._now = now;
  }

  reportMeasureValues(measureValues: MeasureValues): Promise<any> {
    return PromiseWrapper.resolve(null);
  }

  reportSample(completeSample: List<MeasureValues>,
               validSample: List<MeasureValues>): Promise<any> {
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
var _BINDINGS = [
  bind(JsonFileReporter)
      .toFactory((sampleDescription, path, writeFile, now) =>
                     new JsonFileReporter(sampleDescription, path, writeFile, now),
                 [SampleDescription, _PATH, Options.WRITE_FILE, Options.NOW]),
  bind(_PATH).toValue('.')
];
