import { DateWrapper, isPresent, isBlank, Json } from 'angular2/src/facade/lang';
import { List } from 'angular2/src/facade/collection';
import { Promise, PromiseWrapper } from 'angular2/src/facade/async';

import { bind, OpaqueToken } from 'angular2/di';

import { Reporter } from '../reporter';
import { SampleDescription } from '../sample_description';
import { MeasureValues } from '../measure_values';

/**
 * A reporter that writes results into a json file.
 * TODO(tbosch): right now we bind the `writeFile` method
 * in benchpres/benchpress.es6. This does not work for Dart,
 * find another way...
 */
export class JsonFileReporter extends Reporter {
  // TODO(tbosch): use static values when our transpiler supports them
  static get WRITE_FILE() { return _WRITE_FILE; }
  // TODO(tbosch): use static values when our transpiler supports them
  static get PATH() { return _PATH; }
  static get BINDINGS() { return _BINDINGS; }

  _writeFile:Function;
  _path:string;
  _description:SampleDescription;

  constructor(sampleDescription, path, writeFile) {
    super();
    this._description = sampleDescription;
    this._path = path;
    this._writeFile = writeFile;
  }

  reportMeasureValues(measureValues:MeasureValues):Promise {
    return PromiseWrapper.resolve(null);
  }

  reportSample(completeSample:List<MeasureValues>, validSample:List<MeasureValues>):Promise {
    var content = Json.stringify({
      'description': this._description,
      'completeSample': completeSample,
      'validSample': validSample
    });
    var filePath = `${this._path}/${this._description.id}_${DateWrapper.toMillis(DateWrapper.now())}.json`;
    return this._writeFile(filePath, content);
  }
}

var _WRITE_FILE = new OpaqueToken('JsonFileReporter.writeFile');
var _PATH = new OpaqueToken('JsonFileReporter.path');
var _BINDINGS = [
  bind(JsonFileReporter).toFactory(
    (sampleDescription, path, writeFile) => new JsonFileReporter(sampleDescription, path, writeFile),
    [SampleDescription, _PATH, _WRITE_FILE]
  ),
  bind(_PATH).toValue('.')
];
