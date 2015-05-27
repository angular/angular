import {bind, Binding, Injector, OpaqueToken} from 'angular2/di';
import {List, ListWrapper, StringMapWrapper, StringMap} from 'angular2/src/facade/collection';
import {Promise, PromiseWrapper} from 'angular2/src/facade/async';

import {Metric} from '../metric';

export class MultiMetric extends Metric {
  static createBindings(childTokens): List<Binding> {
    return [
      bind(_CHILDREN)
          .toAsyncFactory((injector) => PromiseWrapper.all(
                              ListWrapper.map(childTokens, (token) => injector.asyncGet(token))),
                          [Injector]),
      bind(MultiMetric).toFactory((children) => new MultiMetric(children), [_CHILDREN])
    ];
  }

  constructor(private _metrics: List<Metric>) { super(); }

  /**
   * Starts measuring
   */
  beginMeasure(): Promise<any> {
    return PromiseWrapper.all(ListWrapper.map(this._metrics, (metric) => metric.beginMeasure()));
  }

  /**
   * Ends measuring and reports the data
   * since the begin call.
   * @param restart: Whether to restart right after this.
   */
  endMeasure(restart: boolean): Promise<StringMap<string, any>> {
    return PromiseWrapper.all(
                             ListWrapper.map(this._metrics, (metric) => metric.endMeasure(restart)))
        .then((values) => { return mergeStringMaps(values); });
  }

  /**
   * Describes the metrics provided by this metric implementation.
   * (e.g. units, ...)
   */
  describe(): StringMap<string, any> {
    return mergeStringMaps(this._metrics.map((metric) => metric.describe()));
  }
}

function mergeStringMaps(maps): Object {
  var result = {};
  ListWrapper.forEach(maps, (map) => {
    StringMapWrapper.forEach(map, (value, prop) => { result[prop] = value; });
  });
  return result;
}

var _CHILDREN = new OpaqueToken('MultiMetric.children');
