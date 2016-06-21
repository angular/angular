import {isBlank} from 'angular2/src/facade/lang';
import {Injector, InjectorFactory, THROW_IF_NOT_FOUND} from './injector';

/**
 * An simple injector based on a Map of values.
 */
export class MapInjector implements Injector {
  static createFactory(values?: Map<any, any>): InjectorFactory<any> {
    return new MapInjectorFactory(values);
  }

  private _values: Map<any, any>;

  constructor(private _parent: Injector = null, values: Map<any, any> = null) {
    if (isBlank(values)) {
      values = new Map<any, any>();
    }
    this._values = values;
    if (isBlank(this._parent)) {
      this._parent = Injector.NULL;
    }
  }
  get(token: any, notFoundValue: any = THROW_IF_NOT_FOUND): any {
    if (token === Injector) {
      return this;
    }
    if (this._values.has(token)) {
      return this._values.get(token);
    }
    return this._parent.get(token, notFoundValue);
  }
}

/**
 * InjectorFactory for MapInjector.
 */
export class MapInjectorFactory implements InjectorFactory<any> {
  constructor(private _values: Map<any, any> = null) {}

  create(parent: Injector = null, context: any = null): Injector {
    return new MapInjector(parent, this._values);
  }
}
