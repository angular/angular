import {bind, Binding, Injector, OpaqueToken} from 'angular2/src/core/di';
import {ListWrapper, StringMapWrapper} from 'angular2/src/core/facade/collection';
import {Promise, PromiseWrapper} from 'angular2/src/core/facade/async';

import {Metric} from '../metric';

export class MultiMetric extends Metric {
  static createBindings(childTokens: any[]): Binding[] {
    return [
      bind(_CHILDREN)
          .toFactory((injector: Injector) => childTokens.map(token => injector.get(token)),
                     [Injector]),
      bind(MultiMetric).toFactory(children => new MultiMetric(children), [_CHILDREN])
    ];
  }

  constructor(private _metrics: Metric[]) { super(); }

  /**
   * Starts measuring
   */
  beginMeasure(): Promise<any> {
    return PromiseWrapper.all(this._metrics.map(metric => metric.beginMeasure()));
  }

  /**
   * Ends measuring and reports the data
   * since the begin call.
   * @param restart: Whether to restart right after this.
   */
  endMeasure(restart: boolean): Promise<{[key: string]: any}> {
    return PromiseWrapper.all(this._metrics.map(metric => metric.endMeasure(restart)))
        .then(values => mergeStringMaps(values));
  }

  /**
   * Describes the metrics provided by this metric implementation.
   * (e.g. units, ...)
   */
  describe(): {[key: string]: any} {
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
