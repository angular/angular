import {bind, Provider, OpaqueToken} from 'angular2/src/core/di';
import {PromiseWrapper} from 'angular2/src/facade/async';
import {StringMapWrapper} from 'angular2/src/facade/collection';

import {Metric} from '../metric';
import {WebDriverAdapter} from '../web_driver_adapter';

var Observable = require('rxjs').Observable;

var _USER_PROPERTIES = new OpaqueToken('UserMetric.properties');

export class UserProperty {
  constructor(public name: string, public description: string) {}
}

export class UserMetric extends Metric {
  static createBindings(properties: {[key: string]: string}): Provider[] {
    return [
      bind(_USER_PROPERTIES)
          .toFactory(() => StringMapWrapper.keys(properties)
                               .map(propName => new UserProperty(propName, properties[propName]))),
      bind(UserMetric)
          .toFactory((properties, wdAdapter) => new UserMetric(properties, wdAdapter),
                     [_USER_PROPERTIES, WebDriverAdapter])
    ];
  }
  constructor(private _properties: UserProperty[], private _wdAdapter: WebDriverAdapter) {
    super();
  }

  /**
   * Starts measuring
   */
  beginMeasure(): Promise<any> { return PromiseWrapper.resolve(true); }

  /**
   * Ends measuring.
   */
  endMeasure(): Promise<{[key: string]: any}> {
    return Observable.interval(100)
        .switchMap(() => Observable.fromPromise(Promise.all(this._properties.map(prop => {
          return this._wdAdapter.executeScript(`return window.${prop.name}`);
        }))))
        .filter((values: any[]) => values.filter(val => typeof val !== 'number').length === 0)
        .do(() => {
          this._properties.forEach(prop =>
                                       this._wdAdapter.executeScript(`delete window.${prop.name}`));
        })
        .map(propertyValues => this._properties.reduce(
                 (prev, curr, i) => {
                   prev[curr.name] = propertyValues[i];
                   return prev;
                 },
                 {}))
        .take(1)
        .toPromise();
  }

  /**
   * Describes the metrics provided by this metric implementation.
   * (e.g. units, ...)
   */
  describe(): {[key: string]: any} {
    return this._properties.reduce((prev, curr, i) => {
      prev[curr.name] = curr.description;
      return prev;
    }, {});
  }
}
