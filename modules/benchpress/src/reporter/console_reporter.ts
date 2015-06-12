import {print, isPresent, isBlank, NumberWrapper} from 'angular2/src/facade/lang';
import {StringMapWrapper, ListWrapper, List} from 'angular2/src/facade/collection';
import {Promise, PromiseWrapper} from 'angular2/src/facade/async';
import {Math} from 'angular2/src/facade/math';
import {bind, Binding, OpaqueToken} from 'angular2/di';

import {Statistic} from '../statistic';
import {Reporter} from '../reporter';
import {SampleDescription} from '../sample_description';
import {MeasureValues} from '../measure_values';

/**
 * A reporter for the console
 */
export class ConsoleReporter extends Reporter {
  // TODO(tbosch): use static values when our transpiler supports them
  static get PRINT(): OpaqueToken { return _PRINT; }
  // TODO(tbosch): use static values when our transpiler supports them
  static get COLUMN_WIDTH(): OpaqueToken { return _COLUMN_WIDTH; }
  // TODO(tbosch): use static values when our transpiler supports them
  static get BINDINGS(): List<Binding> { return _BINDINGS; }


  static _lpad(value, columnWidth, fill = ' ') {
    var result = '';
    for (var i = 0; i < columnWidth - value.length; i++) {
      result += fill;
    }
    return result + value;
  }

  static _formatNum(n) { return NumberWrapper.toFixed(n, 2); }

  static _sortedProps(obj) {
    var props = [];
    StringMapWrapper.forEach(obj, (value, prop) => ListWrapper.push(props, prop));
    props.sort();
    return props;
  }

  private _metricNames: List<string>;

  constructor(private _columnWidth: number, sampleDescription, private _print: Function) {
    super();
    this._metricNames = ConsoleReporter._sortedProps(sampleDescription.metrics);
    this._printDescription(sampleDescription);
  }

  _printDescription(sampleDescription) {
    this._print(`BENCHMARK ${sampleDescription.id}`);
    this._print('Description:');
    var props = ConsoleReporter._sortedProps(sampleDescription.description);
    props.forEach((prop) => { this._print(`- ${prop}: ${sampleDescription.description[prop]}`); });
    this._print('Metrics:');
    this._metricNames.forEach((metricName) => {
      this._print(`- ${metricName}: ${sampleDescription.metrics[metricName]}`);
    });
    this._print('');
    this._printStringRow(this._metricNames);
    this._printStringRow(this._metricNames.map((_) => ''), '-');
  }

  reportMeasureValues(measureValues: MeasureValues): Promise<any> {
    var formattedValues = ListWrapper.map(this._metricNames, (metricName) => {
      var value = measureValues.values[metricName];
      return ConsoleReporter._formatNum(value);
    });
    this._printStringRow(formattedValues);
    return PromiseWrapper.resolve(null);
  }

  reportSample(completeSample: List<MeasureValues>,
               validSample: List<MeasureValues>): Promise<any> {
    this._printStringRow(this._metricNames.map((_) => ''), '=');
    this._printStringRow(ListWrapper.map(this._metricNames, (metricName) => {
      var sample =
          ListWrapper.map(validSample, (measureValues) => measureValues.values[metricName]);
      var mean = Statistic.calculateMean(sample);
      var cv = Statistic.calculateCoefficientOfVariation(sample, mean);
      var formattedMean = ConsoleReporter._formatNum(mean)
                              // Note: Don't use the unicode character for +- as it might cause
                              // hickups for consoles...
                              return NumberWrapper.isNaN(cv) ?
                              formattedMean :
                              `${formattedMean}+-${Math.floor(cv)}%`;
    }));
    return PromiseWrapper.resolve(null);
  }

  _printStringRow(parts, fill = ' ') {
    this._print(ListWrapper.map(parts, (part) => {
                             var w = this._columnWidth;
                             return ConsoleReporter._lpad(part, w, fill);
                           }).join(' | '));
  }
}

var _PRINT = new OpaqueToken('ConsoleReporter.print');
var _COLUMN_WIDTH = new OpaqueToken('ConsoleReporter.columnWidth');
var _BINDINGS = [
  bind(ConsoleReporter)
      .toFactory((columnWidth, sampleDescription, print) =>
                     new ConsoleReporter(columnWidth, sampleDescription, print),
                 [_COLUMN_WIDTH, SampleDescription, _PRINT]),
  bind(_COLUMN_WIDTH).toValue(18),
  bind(_PRINT).toValue(print)
];
