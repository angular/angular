import {isBlank} from 'angular2/src/facade/lang';
import {Injector, InjectorFactory, THROW_IF_NOT_FOUND} from './injector';

/**
 * An simple injector based on a Map of values.
 */
export class MapInjector implements Injector {
  static createFactory(values?: Map<any, any>,
                       factories?: Map<any, (injector: Injector) => any>): InjectorFactory<any> {
    return new MapInjectorFactory(values, factories);
  }

  private _instances: Map<any, any> = new Map<any, any>();
  private _factories: Map<any, (injector: Injector) => any>;
  private _values: Map<any, any>;

  constructor(private _parent: Injector = null, values: Map<any, any> = null,
              factories: Map<any, (injector: Injector) => any> = null) {
    if (isBlank(values)) {
      values = new Map<any, any>();
    }
    this._values = values;
    if (isBlank(factories)) {
      factories = new Map<any, any>();
    }
    this._factories = factories;
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
    if (this._instances.has(token)) {
      return this._instances.get(token);
    }
    if (this._factories.has(token)) {
      var instance = this._factories.get(token)(this);
      this._instances.set(token, instance);
      return instance;
    }
    return this._parent.get(token, notFoundValue);
  }
}

/**
 * InjectorFactory for MapInjector.
 */
export class MapInjectorFactory implements InjectorFactory<any> {
  constructor(private _values: Map<any, any> = null,
              private _factories: Map<any, (injector: Injector) => any> = null) {}

  create(parent: Injector = null, context: any = null): Injector {
    return new MapInjector(parent, this._values, this._factories);
  }
}
